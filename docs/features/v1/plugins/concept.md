# Deesse Plugin System (v1)

## Overview

The **Deesse Plugin System** provides a unified, declarative way to extend every layer of a DeesseJS project — schema, runtime, admin, and CLI.
Plugins are *pure objects* that describe new features, collections, context extensions, and UI integrations without directly mutating core behavior.

A plugin can:

* add new **collections** to the data model,
* extend the **runtime context** (via `addContext()`),
* add **pages** to the **admin dashboard**,
* declare **CLI pages** (Next.js routes) that the user may optionally scaffold,
* and (later) register **extensions** that modify internal compiler or storage logic.

> In essence, plugins are *capability bundles* — functional, composable, and user-consented.

---

## Core Concept

A **plugin** is declared using the `plugin()` function, which returns a structured, immutable object.
The compiler, runtime, and CLI use these plugin definitions to enrich the system deterministically.

Example:

```typescript
import { plugin, collection, field, text, date } from "deesse";
import { AuditLogs } from "./collections/AuditLogs";

export default plugin({
  name: "deesse-audit",
  collections: [AuditLogs],
  context: async (ctx) => ({
    audit: {
      log: (msg: string) => ctx.db.audit_logs.insert({ message: msg }),
    },
  }),
  admin: {
    pages: [
      {
        group: "System",
        path: "/audit",
        component: import("./admin/AuditPage"),
      },
    ],
  },
});
```

---

## Architecture

### Layer interaction

```
          ┌──────────────┐
          │   Plugins    │
          └──────┬───────┘
                 │
      ┌──────────┴──────────────┐
      │ Integrated into Systems │
      ├─────────────────────────┤
      │ • Compiler (collections)│
      │ • Context (runtime)     │
      │ • Admin (UI)            │
      │ • CLI (Next.js pages)   │
      └─────────────────────────┘
```

Each plugin operates through **pure composition** — never direct mutation.
Every subsystem simply merges the plugin’s contributions into its own data structures.

---

## Structure

### Plugin definition

```typescript
type DeessePlugin = {
  name: string;
  version?: string;
  collections?: CollectionDef[];
  context?: ContextProvider;
  extensions?: ExtensionDef[];
  admin?: {
    pages?: AdminPage[];
  };
  cli?: {
    pages?: NextPageTemplate[];
  };
};
```

### Plugin factory

```typescript
export const plugin = (def: DeessePlugin): PluginEntity => ({
  kind: "plugin",
  ...def,
});
```

---

## Collections Integration

Plugins can declare new collections that are automatically merged into the project’s schema during compilation.

```typescript
const analyticsPlugin = plugin({
  name: "analytics",
  collections: [
    collection({
      slug: "events",
      fields: {
        name: field({ type: text() }),
        createdAt: field({ type: date() }),
      },
    }),
  ],
});
```

During compilation:

```typescript
project.collections.push(...plugin.collections);
```

---

## Context Integration

A plugin can extend the runtime environment through the **Context System** using `addContext()`.

```typescript
addContext(async (ctx) => ({
  analytics: {
    track: async (event, data) => {
      await ctx.db.events.insert({ event, data });
    },
  },
}));
```

When the project loads, each plugin’s `context` function is automatically registered as a provider.

---

## Admin Integration

Plugins can extend the **Admin Dashboard** with custom pages grouped by logical sections.

```typescript
type AdminPage = {
  group?: string; // e.g. "System" or "Marketing"
  path: string;   // e.g. "/audit"
  component: () => Promise<any>; // dynamic import()
};
```

Example:

```typescript
admin: {
  pages: [
    {
      group: "System",
      path: "/audit",
      component: import("./admin/AuditPage"),
    },
  ],
}
```

When the admin builds, these pages are added to the sidebar grouped by `group`.

---

## CLI Integration

Plugins can also declare **Next.js pages** that can be *optionally* added to the user’s project via the CLI.

### Command

```
npx deesse plugin add <plugin-name>
```

### Flow

1. **Install** the plugin via npm.
2. **Load** its exported plugin definition.
3. **Detect** if it exposes any `cli.pages`.
4. **Prompt the user** before adding files:

   ```
   The plugin "deesse-blog" includes optional Next.js pages.
   Would you like to add them to your project? (Y/n)
   ```
5. **Copy** the page templates only if confirmed.
6. **Register** the plugin in `deesse.config.ts`.

---

### CLI Page Structure

```typescript
type NextPageTemplate = {
  path: string;          // e.g. "app/(deesse)/blog/page.tsx"
  source: string;        // path inside plugin
  description?: string;
};
```

The CLI copies `source` → `path` only if user approval is given.

---

## Example Plugin

```typescript
export default plugin({
  name: "deesse-blog",

  collections: [
    collection({
      slug: "posts",
      fields: {
        title: field({ type: text() }),
        content: field({ type: richText() }),
      },
    }),
  ],

  context: async (ctx) => ({
    blog: {
      getLatest: async () => ctx.db.posts.find({ limit: 5 }),
    },
  }),

  admin: {
    pages: [
      {
        group: "Content",
        path: "/blog",
        component: import("./admin/BlogPage"),
      },
    ],
  },

  cli: {
    pages: [
      {
        path: "app/(deesse)/blog/page.tsx",
        source: "./templates/blogPage.tsx",
        description: "Main public blog page",
      },
    ],
  },
});
```

---

## Integration Order

The plugin integration pipeline is deterministic and functional:

```
1️⃣ Load plugins from config
2️⃣ addContext(plugin.context)
3️⃣ Merge plugin.collections into project schema
4️⃣ Register admin pages
5️⃣ Register CLI pages (for user consent)
6️⃣ Merge extensions
```

Example implementation:

```typescript
const applyPlugin = (project: Project, plugin: DeessePlugin): Project => ({
  ...project,
  collections: [...project.collections, ...(plugin.collections ?? [])],
  extensions: [...project.extensions, ...(plugin.extensions ?? [])],
});
```

---

## CLI Example

```bash
npx deesse plugin add deesse-blog
```

```text
✔ Installing plugin...
✔ Detected 1 collection: posts
✔ Detected 1 admin page: /blog
? This plugin provides public Next.js pages. Add them now? (Y/n)
```

If the user accepts:

* Pages are copied into `/app/(deesse)/plugins/blog`
* The plugin is auto-registered in `deesse.config.ts`

---

## Plugin Configuration File

`deesse.config.ts`

```typescript
import blogPlugin from "deesse-blog";
import auditPlugin from "deesse-audit";

export default defineConfig({
  collections: [...],
  plugins: [blogPlugin, auditPlugin],
});
```

---

## Developer Experience

| Action                             | Result                                             |
| ---------------------------------- | -------------------------------------------------- |
| `plugin({ ... })`                  | Declares a plugin in a functional, declarative way |
| `addContext(plugin.context)`       | Extends runtime capabilities                       |
| `plugin.collections`               | Adds new schemas automatically                     |
| `plugin.admin.pages`               | Extends admin UI with minimal configuration        |
| `npx deesse plugin add`            | Installs and integrates plugin interactively       |
| `defineConfig({ plugins: [...] })` | Loads all plugins automatically on startup         |

---

## Philosophy

| Principle                       | Description                                                              |
| ------------------------------- | ------------------------------------------------------------------------ |
| **Functional purity**           | Plugins are data, not objects or instances.                              |
| **User control**                | Nothing is added automatically — users approve file generation.          |
| **Composable integration**      | Plugins merge without conflicts or side effects.                         |
| **Cross-system reach**          | A plugin can extend schema, runtime, admin, and CLI layers.              |
| **Declarative over imperative** | No mutation, no implicit side effects — everything described via config. |
| **Extensible ecosystem**        | Third-party developers can build and publish their own plugins.          |

---

## Summary

| Domain          | Description                           |
| --------------- | ------------------------------------- |
| **Schema**      | Add new collections                   |
| **Runtime**     | Extend context (`addContext()`)       |
| **Extensions**  | Inject new compiler/runtime behaviors |
| **Admin**       | Add dashboard pages and UI sections   |
| **CLI**         | Offer optional Next.js pages          |
| **Definition**  | `plugin({ ... })`                     |
| **Integration** | Managed via `defineConfig()`          |

---

> **In essence:**
> The Deesse Plugin System transforms DeesseJS into a *living ecosystem*.
> Each plugin acts as a modular extension of the platform — declarative, functional, and user-consented —
> seamlessly integrating new features across schema, runtime, admin, and developer tooling.

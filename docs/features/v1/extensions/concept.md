# Deesse Extension System (v1)

## Overview

The **Deesse Extension System** defines how low-level runtime capabilities (like database, cache, or logger) are integrated into the framework through **stable, typed interfaces**.

Deesse core defines a set of **official extension interfaces** (e.g. `DatabaseExtension`, `CacheExtension`, `LoggerExtension`), each describing a *capability contract*.
Concrete adapters (extensions) then **implement these interfaces**, and are dynamically attached to the runtime via `addContext()`.

Plugins and other systems never depend on specific implementations (Drizzle, Redis, etc.) — they only rely on the **core-defined interfaces**.

> **Goal:** Provide a capability-based architecture where every system (compiler, plugin, runtime) depends only on *abstract contracts*, not *concrete technologies*.

---

## Core Concept

Deesse defines a set of **extension interfaces** — formal contracts for what capabilities exist in the runtime.

Example interfaces include:

* `DatabaseExtension`
* `CacheExtension`
* `LoggerExtension`
* `MailerExtension`
* `StorageExtension`
* `SearchExtension`

Each adapter (e.g. Drizzle, Redis, S3) implements one of these contracts and exposes it through an **extension definition**.

These extensions are registered in the user’s configuration file and merged into the global context at runtime.

---

## Architecture

### Layers

```
     ┌──────────────────────────────┐
     │        Deesse Core           │
     │   (Defines interfaces)       │
     └──────────┬───────────────────┘
                │
     ┌──────────┴───────────────────┐
     │       Extensions (Adapters)  │
     │  Implement core interfaces   │
     └──────────┬───────────────────┘
                │
     ┌──────────┴───────────────────┐
     │         Plugins              │
     │ Use interfaces via context   │
     └──────────┬───────────────────┘
                │
     ┌──────────┴───────────────────┐
     │        Project Runtime       │
     │ Assembled context object     │
     └──────────────────────────────┘
```

---

## Extension Definition

Extensions are created using the `extension()` factory function.

```typescript
export const extension = (def: ExtensionDef): ExtensionEntity => ({
  kind: "extension",
  ...def,
});
```

### Interface

```typescript
type ExtensionDef = {
  id: string; // Unique identifier (e.g. "db", "cache")
  setup: (config?: any) => Promise<Partial<Context>>;
};
```

Each extension:

* registers under a unique `id`,
* provides a `setup()` function that returns the runtime capabilities it adds (typically conforming to a core interface).

---

## Example: Database Extension (Drizzle)

```typescript
import { extension } from "deesse";
import type { DatabaseExtension } from "deesse/extensions/db";

export const drizzleExtension = extension({
  id: "db",
  setup: async (config) => {
    const adapter = makeDrizzleAdapter(config);

    const db: DatabaseExtension = {
      find: (collection, query) =>
        adapter.select().from(collection).where(query),
      insert: (collection, data) =>
        adapter.insert(collection).values(data),
      update: (collection, id, data) =>
        adapter.update(collection).set(data).where(eq("id", id)),
      delete: (collection, id) =>
        adapter.delete(collection).where(eq("id", id)),
    };

    return { db };
  },
});
```

---

## Example: Cache Extension (Redis)

```typescript
import { extension } from "deesse";
import type { CacheExtension } from "deesse/extensions/cache";

export const redisCache = extension({
  id: "cache",
  setup: async (config) => {
    const redis = await connectRedis(config.url);

    const cache: CacheExtension = {
      get: async (key) => redis.get(key),
      set: async (key, value, ttl) =>
        redis.set(key, JSON.stringify(value), "EX", ttl),
      delete: async (key) => redis.del(key),
    };

    return { cache };
  },
});
```

---

## Example: Logger Extension (Console)

```typescript
import { extension } from "deesse";
import type { LoggerExtension } from "deesse/extensions/logger";

export const consoleLogger = extension({
  id: "logger",
  setup: async () => ({
    logger: {
      info: (msg, meta) => console.log("[INFO]", msg, meta),
      warn: (msg, meta) => console.warn("[WARN]", msg, meta),
      error: (msg, meta) => console.error("[ERROR]", msg, meta),
    } satisfies LoggerExtension,
  }),
});
```

---

## Core Extension Interfaces

Each interface is defined and exported by Deesse core.

### Database Interface

```typescript
export interface DatabaseExtension {
  find(collection: string, query?: any): Promise<any[]>;
  insert(collection: string, data: any): Promise<any>;
  update(collection: string, id: string, data: any): Promise<any>;
  delete(collection: string, id: string): Promise<void>;
}
```

### Cache Interface

```typescript
export interface CacheExtension {
  get(key: string): Promise<any | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
}
```

### Logger Interface

```typescript
export interface LoggerExtension {
  info(msg: string, meta?: any): void;
  warn(msg: string, meta?: any): void;
  error(msg: string, meta?: any): void;
}
```

---

## Integration in User Configuration

```typescript
import { drizzleExtension } from "deesse-extension-drizzle";
import { redisCache } from "deesse-extension-redis";
import { consoleLogger } from "deesse-extension-logger";

export default defineConfig({
  extensions: [drizzleExtension, redisCache, consoleLogger],
});
```

Deesse automatically registers each extension by calling its `setup()` function and merging the result into the runtime context.

```typescript
addContext(drizzleExtension.setup);
addContext(redisCache.setup);
addContext(consoleLogger.setup);
```

---

## Plugin Interaction

Plugins can **require** specific extensions by their IDs.

```typescript
export default plugin({
  name: "deesse-audit",
  requires: ["db", "logger"],
  context: async (ctx) => ({
    audit: {
      log: async (msg) => {
        await ctx.db.insert("audit_logs", { message: msg });
        ctx.logger.info(`[Audit] ${msg}`);
      },
    },
  }),
});
```

During runtime setup, Deesse validates that all required extensions exist:

```typescript
for (const plugin of project.plugins) {
  for (const id of plugin.requires ?? []) {
    if (!extensions.some((ext) => ext.id === id))
      throw new Error(`Missing required extension: "${id}" for plugin "${plugin.name}"`);
  }
}
```

---

## Type System Integration

Deesse supports **context auto-typing** through module augmentation:

```typescript
declare module "deesse/context" {
  interface Context {
    db?: DatabaseExtension;
    cache?: CacheExtension;
    logger?: LoggerExtension;
  }
}
```

→ Once extensions are registered, `ctx.db`, `ctx.cache`, etc. become fully typed with IDE autocompletion.

---

## Context Composition Example

```typescript
const ctx = await getContext();

// db, cache, logger are provided by extensions
await ctx.db.insert("posts", { title: "Hello" });
await ctx.cache.set("lastPost", { title: "Hello" });
ctx.logger.info("Inserted new post");
```

---

## Validation Flow

```
1️⃣ Load user-defined extensions
2️⃣ Validate each one against its core interface
3️⃣ Add extension.setup() as context providers
4️⃣ Build the runtime context
5️⃣ Load plugins
6️⃣ Validate plugin dependencies
```

This ensures:

* context consistency (no missing capabilities),
* type conformity,
* reproducible builds.

---

## Advanced Scenarios

### Multiple implementations of the same interface

You can define several adapters for a single capability type:

```typescript
const inMemoryDB = extension({ id: "db", setup: async () => ({ db: makeMemoryDB() }) });
const drizzleDB = extension({ id: "db", setup: async () => ({ db: makeDrizzleAdapter() }) });
```

Deesse uses the **last registered** extension for a given ID (or supports namespacing later).

---

### Custom user extensions

Developers can define their own extension types and interfaces:

```typescript
export interface MailerExtension {
  send(to: string, subject: string, body: string): Promise<void>;
}

export const smtpMailer = extension({
  id: "mailer",
  setup: async () => ({
    mailer: {
      send: async (to, subject, body) => smtp.sendMail({ to, subject, body }),
    },
  }),
});
```

---

## Developer Experience

| Action                         | Effect                                        |
| ------------------------------ | --------------------------------------------- |
| `extension({ id, setup })`     | Creates a new adapter bound to an interface   |
| `addContext(extension.setup)`  | Registers extension capabilities into runtime |
| `plugin.requires`              | Declares interface dependencies               |
| `defineConfig({ extensions })` | Composes the final runtime context            |
| `ctx.<capability>`             | Fully typed access to extension methods       |

---

## Philosophy

| Principle                           | Description                                                |
| ----------------------------------- | ---------------------------------------------------------- |
| **Interface-first design**          | Core defines contracts; adapters implement them.           |
| **Functional inversion of control** | High-level code depends only on interfaces.                |
| **Runtime composition**             | Context is built by merging extension capabilities.        |
| **Type-driven safety**              | Every extension is validated and typed.                    |
| **Implementation-agnostic plugins** | Plugins remain portable across infrastructures.            |
| **Explicit configuration**          | Users explicitly decide which adapters power their system. |

---

## Summary

| Element         | Description                                                |
| --------------- | ---------------------------------------------------------- |
| **Interface**   | Defined by Deesse core; contracts for runtime capabilities |
| **Extension**   | Concrete implementation of an interface                    |
| **Context**     | Global runtime object containing all capabilities          |
| **Plugin**      | Consumer of interfaces; declares dependencies              |
| **User Config** | Composition layer that binds everything together           |
| **Validation**  | Ensures interface compliance and dependency presence       |

---

> **In essence:**
> The **Deesse Extension System** is the *contractual backbone* of the framework.
> It enforces a clean separation between *interfaces* (what capabilities exist) and *implementations* (how they work),
> making every plugin, adapter, and runtime component fully composable, testable, and infrastructure-agnostic.


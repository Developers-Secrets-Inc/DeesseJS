# DeesseJS Collections System (v1)

## Overview

The **Collections System** in DeesseJS defines how entities (e.g., users, posts, products) are declared within a project.
A collection represents a *pure data domain*, describing its structure, behavior, and admin representation — without directly managing database persistence or runtime logic.

Each collection is a **declarative object**, built through functional composition, mirroring the same philosophy as the Fields System:

* **Functional Composition** — collections are pure data structures composed of fields.
* **Declarative Semantics** — developers describe what a collection *is*, not how it behaves internally.
* **Implicit Intelligence** — validation, storage, and admin configuration are inferred automatically later by the Deesse compiler.

---

## Core Concept

A **collection** is a named set of fields that represent a logical dataset (e.g., “Posts”, “Users”).
It defines:

1. A unique identity (`slug`, `label`)
2. Its data schema (`fields`)
3. Its organizational context (`group`, `icon`, `admin`)
4. Optional behavioral hints (`access`, `hooks`, `timestamps`)

Collections serve as the **foundation of Deesse’s data model** — each plugin, admin view, or API endpoint is derived from them.

---

## Example Usage

```typescript
import { collection } from "deesse/collections";
import { field, text, relation, date, boolean } from "deesse/fields";

export const Posts = collection({
  slug: "posts",
  label: "Post",
  group: "Content",

  fields: {
    title: field({ type: text() }),
    content: field({ type: text() }),
    author: field({ type: relation({ target: "users" }) }),
    publishedAt: field({ type: date() }),
    published: field({ type: boolean() }),
  },

  access: {
    read: "public",
    create: ({ user }) => !!user,
    update: ({ user }) => user?.role === "admin",
  },

  timestamps: true,

  admin: {
    search: ["title", "author"],
    listView: { columns: ["title", "author", "publishedAt"] },
  },
});
```

This single declaration provides Deesse with enough information to:

* Generate type-safe Zod schemas
* Define Drizzle table definitions
* Auto-generate admin forms and lists
* Infer default API behavior (in future versions)

---

## Collection Definition

Each collection is created via the `collection()` function, which receives a declarative configuration object.

```typescript
export const collection = (config: CollectionDef) => ({
  kind: "collection",
  ...config,
});
```

The return value is a **CollectionEntity**, a pure object containing structural and behavioral metadata — no runtime logic or side effects.

---

## CollectionEntity Structure

```typescript
type CollectionEntity = {
  kind: "collection";
  slug: string;
  label?: string;
  pluralLabel?: string;
  group?: string;
  icon?: string | ReactNode;

  fields: Record<string, FieldInstance<any>>;

  access?: {
    read?: AccessRule;
    create?: AccessRule;
    update?: AccessRule;
    delete?: AccessRule;
  };

  hooks?: Partial<{
    beforeCreate: HookFn;
    afterCreate: HookFn;
    beforeUpdate: HookFn;
    afterUpdate: HookFn;
    beforeDelete: HookFn;
    afterDelete: HookFn;
  }>;

  admin?: {
    hidden?: boolean;
    group?: string;
    search?: string[];
    listView?: ListViewConfig;
    formView?: FormViewConfig;
  };

  timestamps?: boolean;
  softDelete?: boolean;
  versioning?: { enabled: boolean; limit?: number };

  pluginData?: Record<string, unknown>;
};
```

Each property defines a declarative hint that Deesse will later compile into runtime systems (schema, DB, admin).

---

## Key Components

### **1. slug**

Unique identifier for the collection.
Used as the root key in database tables, cache keys, and admin routes.

```typescript
slug: "users";
```

---

### **2. label & group**

Defines how the collection is visually represented in the admin dashboard.

```typescript
label: "User";
group: "Accounts";
```

---

### **3. fields**

The structural definition of the collection.
Each field is declared through the `field()` wrapper to provide contextual metadata.

```typescript
fields: {
  name: field({ type: text() }),
  email: field({ type: text() }),
  isActive: field({ type: boolean() }),
};
```

---

### **4. access**

Access rules determine who can interact with the collection.
Each rule can be a string (static) or a function (contextual):

```typescript
access: {
  read: "public",
  update: ({ user }) => user?.role === "admin",
};
```

These rules are purely declarative; enforcement happens at runtime through Deesse’s access layer.

---

### **5. hooks**

Lifecycle hooks allow developers to react to creation, updates, and deletions.

```typescript
hooks: {
  beforeCreate: ({ data }) => ({ ...data, createdAt: new Date() }),
  afterUpdate: ({ data }) => console.log("Updated:", data),
};
```

Hooks are composable and stateless, operating on immutable data objects.

---

### **6. admin**

Admin metadata controls how the collection appears in the dashboard.

```typescript
admin: {
  search: ["title", "author"],
  listView: { columns: ["title", "author", "publishedAt"] },
  formView: { layout: "two-column" },
};
```

Deesse automatically renders the correct forms, lists, and search filters based on these configurations.

---

### **7. timestamps, softDelete, versioning**

Declarative flags that enable built-in behaviors:

```typescript
timestamps: true,      // adds createdAt + updatedAt
softDelete: true,      // adds deletedAt
versioning: { enabled: true, limit: 10 }, // keeps previous revisions
```

These will be compiled into additional fields and hooks automatically in later versions.

---

### **8. pluginData**

Reserved space for extensions and third-party integrations.

```typescript
pluginData: {
  "deesse-audit": { tracked: true },
};
```

Plugins can inject their own metadata here without altering the core API.

---

## Developer Experience (DX)

The Collections API is designed for **fluid composition** and **predictable behavior**:

### **1. Declarative Simplicity**

Developers describe *what* a collection represents, not *how* it behaves.
No need to handle validation, admin forms, or migrations manually.

---

### **2. Type Inference**

All collections are strongly typed.
Deesse automatically derives a schema type for each collection:

```typescript
type Post = SchemaType<typeof Posts>;
```

This type is used consistently across:

* API routes
* Admin forms
* Database queries

---

### **3. Pure Composition**

Collections and fields can be composed without shared state or global registration.

```typescript
const BaseTimestamps = {
  createdAt: field({ type: date() }),
  updatedAt: field({ type: date() }),
};

export const Posts = collection({
  slug: "posts",
  fields: {
    ...BaseTimestamps,
    title: field({ type: text() }),
    content: field({ type: richText() }),
  },
});
```

This promotes reusability and clarity.

---

### **4. Extensibility by Function**

All higher-level features (versioning, audit logs, caching) will be injected via **pure functions** that transform a collection:

```typescript
collection({
  slug: "posts",
  fields: { title: field({ type: text() }) },
  plugins: [timestamps(), versioning()],
});
```

These functional plugins follow the same declarative pattern as fields.

---

## Philosophy

The DeesseJS Collections System is built around four core principles:

1. **Purity:** A collection is a static descriptor, never an object instance.
2. **Predictability:** The same input always produces the same internal structure.
3. **Composability:** Collections are modular, composable, and mergeable.
4. **Declarative Intelligence:** Validation, schema, and UI are *derived*, not manually configured.

---

## Future Directions (post-v1)

While v1 focuses on declarative structure and DX, later versions will introduce:

* Automatic Zod/Drizzle schema generation
* API and Admin compilation
* Plugin runtime injection (e.g., timestamps, softDelete)
* Cross-collection relations and virtual fields
* Multi-tenant namespace isolation
* Cache & event-driven hooks

---

## Summary

| Goal               | Description                                       |
| ------------------ | ------------------------------------------------- |
| Minimal API        | Simple `collection({ ... })` syntax               |
| Pure data model    | No side effects, no class inheritance             |
| Composable fields  | Functional `field()` + `FieldEntity` architecture |
| Declarative access | Functional access rules                           |
| Admin integration  | Configurable search, list, and form views         |
| Extensible core    | Ready for plugins, versioning, timestamps         |
| Type safety        | Strong Zod + TypeScript inference                 |


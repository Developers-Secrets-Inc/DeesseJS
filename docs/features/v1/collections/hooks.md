# DeesseJS Hooks & Lifecycle System (v1)

## Overview

The **Hooks & Lifecycle System** in DeesseJS defines how developers and plugins can react to — or transform — data and system events throughout the framework.
It provides a **pure functional interface** for injecting logic at specific lifecycle stages, such as validation, creation, update, and deletion.

Hooks serve as **the connective tissue** between collections, the database, plugins, and external systems (like cache or event dispatchers).

---

## Core Concept

A **hook** is a pure, optionally asynchronous function that runs at a specific lifecycle stage.
Hooks can **modify input data**, **abort operations**, or **trigger side effects** after actions complete.

Hooks exist in two complementary scopes:

| Scope                          | Description                                                                         |
| ------------------------------ | ----------------------------------------------------------------------------------- |
| **Data lifecycle hooks**       | Operate on individual records during CRUD operations.                               |
| **Collection lifecycle hooks** | Operate at the schema or system level (e.g., during compilation or initialization). |

---

## Example Usage

```typescript
export const Posts = collection({
  slug: "posts",
  fields: {
    title: field({ type: text() }),
    content: field({ type: text() }),
  },

  hooks: {
    beforeValidate: ({ data }) => ({
      ...data,
      title: data.title.trim(),
    }),

    afterCreate: async ({ data, ctx }) => {
      await ctx.cache.invalidate(`posts:${data.id}`);
      ctx.events.emit("posts.created", data);
    },
  },
});
```

This example shows two types of hooks:

* A **pure pre-transformer** (`beforeValidate`) that cleans data.
* An **async post-action hook** (`afterCreate`) that triggers side effects.

---

## Hook Lifecycle Phases

### **1. Validation Phase**

| Hook             | Trigger               | Purpose                              |
| ---------------- | --------------------- | ------------------------------------ |
| `beforeValidate` | Before Zod validation | Normalize or pre-process input data. |
| `afterValidate`  | After Zod validation  | Inject derived or computed fields.   |

### **2. Create Phase**

| Hook           | Trigger                   | Purpose                                          |
| -------------- | ------------------------- | ------------------------------------------------ |
| `beforeCreate` | Before database insertion | Modify or enrich data (e.g., timestamps, slugs). |
| `afterCreate`  | After database insertion  | Trigger cache, events, or external side effects. |

### **3. Update Phase**

| Hook           | Trigger             | Purpose                                              |
| -------------- | ------------------- | ---------------------------------------------------- |
| `beforeUpdate` | Before update query | Modify or validate fields before persistence.        |
| `afterUpdate`  | After update query  | React to changes (invalidate cache, publish events). |

### **4. Delete Phase**

| Hook           | Trigger         | Purpose                                   |
| -------------- | --------------- | ----------------------------------------- |
| `beforeDelete` | Before deletion | Archive or log the record.                |
| `afterDelete`  | After deletion  | Send notifications or clean dependencies. |

### **5. Collection-Level Phase**

| Hook        | Trigger                                  | Purpose                                          |
| ----------- | ---------------------------------------- | ------------------------------------------------ |
| `onResolve` | When the collection is compiled          | Add implicit fields or hooks (used by plugins).  |
| `onInit`    | When the collection is loaded at runtime | Initialize related systems.                      |
| `onUnload`  | When a plugin or namespace unloads       | Clean up listeners, caches, or background tasks. |

---

## Hook Function Signature

Each hook receives a **contextual object** that depends on its phase.

### General structure

```typescript
type HookFn<Phase> = (args: HookArgs<Phase>) => Promise<any> | any;
```

### Example for common phases

```typescript
type HookArgsBase = {
  ctx: Context; // namespace, user, db, etc.
  collection: CollectionEntity;
};

type BeforeCreateArgs<T> = HookArgsBase & { data: T };
type AfterUpdateArgs<T> = HookArgsBase & { data: T; previous: T };
type BeforeDeleteArgs = HookArgsBase & { id: string };
```

### Context object

```typescript
type Context = {
  namespace: string;
  db: DrizzleDatabase;
  user?: UserContext;
  cache?: CacheAdapter;
  events?: EventBus;
};
```

Each hook operates in a **pure, isolated context**, without global state.

---

## Data Flow Order

Deesse executes hooks as a deterministic pipeline:

| Stage | Execution Order                                  |
| ----- | ------------------------------------------------ |
| 1     | `beforeValidate`                                 |
| 2     | Zod validation                                   |
| 3     | `afterValidate`                                  |
| 4     | `beforeCreate` / `beforeUpdate` / `beforeDelete` |
| 5     | Database operation                               |
| 6     | `afterCreate` / `afterUpdate` / `afterDelete`    |

If any hook throws an error, the pipeline stops, and the transaction is rolled back (if supported by the adapter).

---

## Composition and Chaining

Hooks are **composable** at both the collection and plugin levels.

### **Collection-level chaining**

Multiple hooks can be registered for the same phase:

```typescript
hooks: {
  beforeCreate: [
    ({ data }) => ({ ...data, createdAt: new Date() }),
    ({ data }) => ({ ...data, id: generateUUID() }),
  ],
}
```

Each function’s output feeds into the next one (pure functional pipeline).

### **Plugin-level injection**

Plugins can inject new hooks declaratively:

```typescript
const timestamps = (collection) => {
  collection.hooks.beforeCreate.push(({ data }) => ({
    ...data,
    createdAt: new Date(),
  }));
  collection.hooks.beforeUpdate.push(({ data }) => ({
    ...data,
    updatedAt: new Date(),
  }));
};
```

This allows third-party systems to participate in the lifecycle safely.

---

## Error Handling and Abort Semantics

* Throwing an error in any `before*` hook **aborts the entire operation**.
* Throwing an error in any `after*` hook **does not revert the DB change**,
  but emits a warning and stops subsequent `after*` hooks.
* The hook system automatically wraps async errors to preserve consistency.

This ensures transactional integrity and predictable behavior.

---

## Extensibility

The Hooks system is designed for **open composition**:

* New phases can be introduced (e.g., `beforePublish`, `afterArchive`).
* System-level hooks can be globally registered (e.g., logging, audit).
* Namespaces and plugins can scope their own hooks (`namespaceHooks`, `pluginHooks`).

All hook definitions are fully type-safe and inferred automatically from the collection schema.

---

## Developer Experience (DX)

1. **Declarative API**

   ```typescript
   hooks: { beforeCreate, afterDelete }
   ```

   Simple JSON-like structure, consistent across all systems.

2. **Type-safe context**
   Full IntelliSense for `ctx`, `data`, and `collection`.

3. **Functional chaining**
   Hooks can be arrays or composed functions, always pure.

4. **No hidden state**
   Every hook receives all it needs through arguments — no globals.

5. **Plugin-ready design**
   Third-party plugins can attach hooks without mutating the core system.

---

## Example: Full CRUD Lifecycle

```typescript
export const Users = collection({
  slug: "users",
  fields: { name: field(text()), email: field(text()) },

  hooks: {
    beforeValidate: ({ data }) => ({ ...data, email: data.email.toLowerCase() }),
    afterValidate: ({ data }) => ({ ...data, validated: true }),

    beforeCreate: ({ data }) => ({ ...data, createdAt: new Date() }),
    afterCreate: ({ data, ctx }) => ctx.events.emit("users.created", data),

    beforeUpdate: ({ data }) => ({ ...data, updatedAt: new Date() }),
    afterUpdate: ({ data }) => ctx.cache.invalidate(`users:${data.id}`),

    afterDelete: ({ id, ctx }) => ctx.events.emit("users.deleted", { id }),
  },
});
```

This defines a complete declarative lifecycle for the `users` collection — no external configuration or boilerplate.

---

## Design Philosophy

1. **Purity:**
   Hooks describe transformations, not side effects hidden in the system.

2. **Predictability:**
   Hook order and behavior are deterministic and observable.

3. **Composability:**
   Hooks form a linear, functional pipeline, easily merged by plugins.

4. **Extensibility:**
   Any phase or context can be added without breaking the base contract.

5. **Declarative Integration:**
   The lifecycle defines *what happens*, not *how to execute it*.

---

## Future Directions (post-v1)

| Area                         | Description                                                       |
| ---------------------------- | ----------------------------------------------------------------- |
| **Global hooks registry**    | System-wide hooks across namespaces                               |
| **Transactional hooks**      | Hooks executed inside DB transactions                             |
| **Namespace-scoped hooks**   | Hooks that trigger for all collections in a namespace             |
| **Admin-configurable hooks** | Define or toggle hooks directly in the admin UI                   |
| **Async pipeline control**   | Streamlined concurrency with cancellation tokens                  |
| **Cross-collection hooks**   | Listen to or trigger lifecycle events across multiple collections |

---

## Summary

| Goal                  | Description                                      |
| --------------------- | ------------------------------------------------ |
| Declarative lifecycle | Hooks for all CRUD and schema events             |
| Functional purity     | Stateless, composable, and chainable             |
| Strong typing         | Context and data are type-safe and inferred      |
| Plugin extensibility  | Easy to attach or override hooks via composition |
| Deterministic order   | Predictable execution pipeline                   |
| Unified integration   | Backbone for cache, events, audit, and plugins   |


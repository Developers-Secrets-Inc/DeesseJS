# Deesse Context System (v1)

## Overview

The **Deesse Context System** provides a unified, dynamic, and functional way to access all runtime capabilities of a DeesseJS project.
It acts as the **runtime entrypoint** of the entire framework — allowing developers, adapters, and plugins to register and access contextual capabilities like database, cache, logger, user session, namespace, and more.

The system is designed to be **functional, extensible, and immutable**:

* `addContext()` lets any subsystem register a capability provider.
* `getContext()` builds and returns the fully merged context.
* No classes, no global mutable state, and no hidden coupling.

---

## Core Concept

In Deesse, the **context** (`ctx`) represents the current runtime environment —
a structured object exposing the available resources and capabilities.

Example:

```typescript
const ctx = await getContext();

await ctx.db.posts.find({ where: { published: true } });
await ctx.cache.invalidate("posts:latest");
await ctx.logger.info("Post fetched");
```

Each of these properties (`db`, `cache`, `logger`, etc.) was registered dynamically through `addContext()`.

---

## Architecture

### Context flow

```
[ Core / Plugins ] ──▶ addContext() ──▶ Registry ──▶ getContext() ──▶ ctx
```

1. Modules and plugins register **context providers** using `addContext()`.
2. `getContext()` executes each provider sequentially.
3. The results are merged into a single **immutable context object**.

---

## Functional Design Principles

| Principle                  | Description                                                             |
| -------------------------- | ----------------------------------------------------------------------- |
| **Functional purity**      | No classes, singletons, or hidden mutations.                            |
| **Extensibility**          | New capabilities can be added dynamically via plugins.                  |
| **Immutability**           | Once constructed, a `ctx` instance cannot be mutated.                   |
| **Composition-first**      | Providers can depend on previously registered parts of the context.     |
| **Predictable resolution** | Order of registration determines resolution order.                      |
| **Scoping**                | Sub-contexts can be derived for per-request or per-namespace isolation. |

---

## API

### `addContext(provider)`

Registers a new **context provider** — a function that returns a partial context fragment.

```typescript
type ContextProvider = (ctx: Partial<Context>) => Promise<Partial<Context>>;

const addContext = (provider: ContextProvider) => {
  registry.push(provider);
};
```

Providers are executed in the order they were added.

Example:

```typescript
addContext(async () => ({
  db: await makeDrizzleAdapter(),
}));

addContext(async (ctx) => ({
  cache: makeRedisAdapter(),
  logger: makeLogger(),
  audit: { log: (msg) => ctx.db.logs.insert({ message: msg }) },
}));
```

---

### `getContext()`

Constructs and returns the current **runtime context**.

```typescript
export const getContext = async (): Promise<Context> => {
  let ctx: Record<string, any> = {};

  for (const provider of registry) {
    const partial = await provider(ctx);
    ctx = { ...ctx, ...partial };
  }

  return Object.freeze(ctx);
};
```

* The returned context is immutable (`Object.freeze()`).
* Each provider receives the *partial context* accumulated so far.

Example:

```typescript
const ctx = await getContext();
await ctx.db.users.find(...);
await ctx.audit.log("User fetched");
```

---

### `resetContext()`

(Development utility)
Clears all registered providers — useful for hot reload or tests.

```typescript
export const resetContext = () => {
  registry.length = 0;
};
```

---

### `withContext(ctx, patch)`

Creates a **derived context** with additional or overridden keys (useful per request).

```typescript
const withContext = (ctx: Context, patch: Partial<Context>): Context =>
  Object.freeze({ ...ctx, ...patch });
```

Example:

```typescript
const requestCtx = withContext(ctx, { user, namespace: "shop" });
```

---

## Type Definition

```typescript
type Context = {
  db?: DatabaseAdapter;
  cache?: CacheAdapter;
  logger?: Logger;
  user?: { id: string; role: string };
  namespace?: string;
  locale?: string;
  [key: string]: unknown;
};
```

---

## Example Usage

### Core registration

```typescript
addContext(async () => ({
  db: makeDrizzleAdapter(),
}));

addContext(async () => ({
  cache: makeRedisAdapter(),
}));
```

### Plugin extension

```typescript
addContext(async (ctx) => ({
  analytics: {
    track: async (event, data) => {
      await ctx.db.events.insert({ event, data });
    },
  },
}));
```

### Runtime access

```typescript
const ctx = await getContext();
await ctx.analytics.track("login", { userId: "123" });
```

---

## Internal Implementation

Minimal implementation example (`context.ts`):

```typescript
const registry: ContextProvider[] = [];

export const addContext = (provider: ContextProvider) => {
  registry.push(provider);
};

export const getContext = async (): Promise<Context> => {
  let ctx: any = {};
  for (const provider of registry) {
    const partial = await provider(ctx);
    ctx = { ...ctx, ...partial };
  }
  return Object.freeze(ctx);
};

export const resetContext = () => {
  registry.length = 0;
};
```

---

## Advanced Features

### Lazy Providers

Providers can define getters that are only initialized when accessed.

```typescript
addContext(async () => ({
  get db() {
    return makeDrizzleAdapter();
  },
}));
```

### Namespace Isolation

Contexts can be created per tenant or namespace:

```typescript
const nsCtx = await getContext({ namespace: "shop" });
await nsCtx.db.orders.find(...);
```

### Hot Plugin Loading

A plugin can dynamically extend the context at runtime:

```typescript
import { addContext } from "deesse/context";

addContext(async (ctx) => ({
  mailer: makeMailerAdapter(ctx.logger),
}));
```

---

## Developer Experience

* **Zero setup** — `getContext()` always returns the full environment, including plugin extensions.
* **Composable providers** — each provider can depend on previously registered parts.
* **Type inference** — the `Context` type can be automatically extended using declaration merging in TypeScript.
* **Predictable order** — last registered provider can depend on previous ones.

---

## Example: Full Pipeline

```typescript
// core/db.ts
addContext(async () => ({ db: makeDrizzleAdapter() }));

// core/cache.ts
addContext(async () => ({ cache: makeRedisAdapter() }));

// plugins/audit.ts
addContext(async (ctx) => ({
  audit: { log: (msg) => ctx.db.logs.insert({ message: msg }) },
}));

// app.ts
const ctx = await getContext();
await ctx.audit.log("System initialized");
```

→ `ctx` automatically exposes `{ db, cache, audit }`.

---

## Philosophy

| Principle                                        | Implementation                                                                      |
| ------------------------------------------------ | ----------------------------------------------------------------------------------- |
| **Everything is a capability**                   | Context is a collection of composable capabilities.                                 |
| **Explicit composition over implicit injection** | No dependency injection container — only pure functions.                            |
| **Stateless runtime**                            | Contexts are values, not class instances.                                           |
| **Plugin-first extensibility**                   | Every system (core or plugin) extends the context via `addContext()`.               |
| **Functional immutability**                      | Once built, a `ctx` object cannot be mutated.                                       |
| **Universal entrypoint**                         | `getContext()` is the only function developers need to access runtime capabilities. |

---

## Summary

| Element          | Role                                      |
| ---------------- | ----------------------------------------- |
| `addContext()`   | Registers new context capabilities        |
| `getContext()`   | Builds and returns the full context       |
| `resetContext()` | Clears registered providers (dev/testing) |
| `withContext()`  | Derives a sub-context (scoped or patched) |

---

> **In essence:**
> The Deesse Context System is a *functional, composable capability graph*.
> It is the **living interface** between all static definitions (collections, fields, plugins) and their runtime behavior.
> Everything in Deesse — from database access to plugin logic — flows through the context.


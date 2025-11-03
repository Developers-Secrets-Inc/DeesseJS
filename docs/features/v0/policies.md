# DS Policy System Plan

## Product Vision

The **Policy System** in Deesse (DS) defines the rules that govern plugin behavior and interactions. It ensures **security**, **governance**, and **predictable collaboration** between plugins by enforcing constraints on actions, capabilities, and data access.

### Core Goals

* **Security:** Prevent malicious or unintended cross-plugin behavior.
* **Transparency:** All policy decisions are explicit and traceable.
* **Configurability:** Developers can define and override policies per environment.
* **Trust Management:** Tiered plugin trust levels (core, official, partner, community).
* **Unified DX:** Same mental model for all checks—policies feel natural, not bureaucratic.

---

## Product Overview

Policies act as **guardians** for DS primitives (intentions, capabilities, events, effects, etc.). They decide whether an operation is allowed, blocked, or modified before execution.

A policy is **declarative**: it defines a scope, a condition, and an action to perform when that condition is (or isn’t) met.

### Example Use Case

* A plugin tries to call the `storage.upload` capability.
* DS evaluates the matching policy: “Community plugins cannot use storage.upload.”
* If blocked, the runtime logs the denial and surfaces a clear message to the developer.

---

## Developer Experience (DX)

### 1. Defining a Policy

Policies are defined using a fluent, strongly typed API:

```ts
export const storagePolicy = definePolicy({
  scope: "storage.upload",
  allow: (ctx, origin, args) => origin.tier !== "community",
  onDeny: (ctx, origin) => ctx.log.warn(`${origin.name} attempted to upload.`),
});
```

* `scope`: the domain or capability being protected.
* `allow`: predicate function returning `true` or `false`.
* `onDeny`: optional side effect (logging, alerting, audit entry).

Policies can target any layer: capabilities, intentions, events, or contexts.

### 2. Policy Scopes

Policies apply to **scopes**, which may use wildcards:

```ts
"storage.*"          // all storage actions
"email.send"         // specific capability
"intent.user.create" // specific intention
"event.*"            // all events
```

Policies are composable: DS merges and evaluates them in order of specificity and priority.

### 3. Trust Tiers

Each plugin has a **trust tier**, declared in its manifest:

```ts
export const plugin = definePlugin({
  name: "@community/chatbot",
  tier: "community",
});
```

Tiers control default access to sensitive scopes:

| Tier          | Description              | Default Privileges            |
| ------------- | ------------------------ | ----------------------------- |
| **core**      | Internal DS plugins      | full access                   |
| **official**  | Verified DS team plugins | broad access                  |
| **partner**   | Approved third-party     | limited network/storage       |
| **community** | Open-source / user-made  | sandboxed, no critical access |

Developers can override default policies for testing or local setups.

### 4. Unified Runtime Enforcement

At runtime, before executing any operation:

```ts
ctx.policy.check("storage.upload", origin, args);
```

If a policy denies access, DS automatically:

* logs the attempt,
* returns a clear error (or warning in dev mode),
* triggers optional compensating actions (`onDeny`, `effect.rollback`).

Policies apply **before capabilities**, **before intentions**, and **before events**.

### 5. Observability & Debugging

* **Inspector UI:** Developers can see which policies are active and why an operation was blocked.
* **Timeline logging:** Every decision recorded as an event (`policy.allowed`, `policy.denied`).
* **AI explanations (future):** Suggests minimal required scopes to make an action succeed.

---

## Architecture Overview

```
┌────────────────────────────┐
│ Plugin                     │
│  (consumer)                │
│  → ctx.capability('upload')│
└────────────┬────────────────┘
             │
             ▼
┌────────────────────────────┐
│ DS Policy Engine           │
│  - finds matching policies │
│  - evaluates allow()       │
│  - logs result             │
└────────────┬────────────────┘
             │
             ▼
┌────────────────────────────┐
│ Capability Provider Plugin │
│  executes if allowed       │
└────────────────────────────┘
```

---

## Developer Value

* **Clarity:** Developers instantly see why an action was allowed or denied.
* **Safety:** Prevent plugin abuse, data leaks, or capability misuse.
* **Flexibility:** Policies can be global, per-plugin, or per-scope.
* **Traceability:** Every enforcement decision is observable.
* **DX Consistency:** Same pattern across all DS primitives.

---

## Future Directions

* Visual policy graph (which plugin → which scope → allowed/denied).
* Policy testing suite (`npx deesse policy:test`).
* Conditional policies based on environment (`if prod only`, `if ctx.user.role === 'admin'`).
* Policy inheritance and overrides (environment or tenant level).
* Integration with AI reasoning: suggest the minimal permission a plugin needs.

---

### TL;DR

> **Policies = DS’s immune system.**
>
> They control what plugins can do, when, and how—ensuring a secure, transparent, and developer-friendly ecosystem.

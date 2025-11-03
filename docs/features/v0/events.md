# DS Event System Plan

## Product Vision

The **Event System** in Deesse (DS) is the central nervous system of the framework — it connects every action, reaction, and observation in a consistent and extensible way. It provides a unified, phase-based event flow that bridges **intentions**, **effects**, and **capabilities**.

### Core Goals

* **Unified model:** One event interface for intentions, signals, and completed actions.
* **Traceability:** Every event is observable and recordable.
* **Extensibility:** Plugins can emit and listen to events without direct coupling.
* **Composability:** Events drive workflows, automations, and analytics.
* **Developer clarity:** A simple, predictable API with consistent semantics.

---

## Product Overview

Events represent **everything that happens** within DS — from a user signup to a plugin loading, to an AI inference completing.

Each event has a name, payload, phase, and origin. Plugins can both **emit** and **listen** to events, creating a reactive ecosystem that is fully observable.

### Example Use Case

* `auth` plugin emits `user.create` (phase: `before`) → intention.
* After creation, it emits `user.create` (phase: `after`) → completion.
* The `email` plugin listens for `user.create:after` and sends a welcome email.

---

## Developer Experience (DX)

### 1. Declaring an Event

Events can be emitted by any plugin through the unified API:

```ts
ctx.event.emit("user.create", { phase: "before", data: userInput });
```

Or after completion:

```ts
ctx.event.emit("user.create", { phase: "after", result: user });
```

Phases include:

* `before` → intention / pre-validation.
* `during` → live / ongoing state.
* `after` → completion / success.
* `error` → failed / rejected action.

### 2. Listening to Events

Plugins can subscribe to events with strong typing and wildcard support:

```ts
ctx.event.on("user.create", ({ phase, data }) => {
  if (phase === "after") sendWelcomeEmail(data);
});

ctx.event.on("storage.*", (event) => {
  console.log("Any storage event:", event.name);
});
```

### 3. Event Structure

Each event has a consistent, typed envelope:

```ts
type Event<Name extends string, Data> = {
  name: Name;
  phase: "before" | "during" | "after" | "error";
  data: Data;
  origin: { plugin: string; version: string; tier: PluginTier };
  timestamp: number;
}
```

### 4. Observability

All emitted events are automatically:

* Logged in the DS Timeline.
* Available to the **Inspector UI** for real-time tracking.
* Accessible via the `@deesse/audit` plugin for historical queries.

Developers can visually trace flows such as:

```
user.create (before) → auth policy check → db.insert → user.create (after) → email.send
```

### 5. DX Enhancements

* Autocompletion on `ctx.event.emit` and `ctx.event.on` names.
* Generated event type map for all known plugin events.
* Event replay tools for debugging.
* CLI command:

  ```bash
  npx deesse events:list
  ```
* Filterable logs by phase, plugin, or origin.

---

## Architecture Overview

```
┌───────────────────────────────┐
│ Plugin A (Producer)          │
│  → ctx.event.emit('user.create') │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│ DS Event Bus (Core)           │
│  - Normalizes event format    │
│  - Enforces policies          │
│  - Broadcasts to listeners    │
│  - Logs to timeline           │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│ Plugin B (Listener)           │
│  → ctx.event.on('user.create')│
│  → reacts (send email, etc.)  │
└───────────────────────────────┘
```

---

## Developer Value

* **Simplicity:** One mental model for all reactive flows.
* **Reliability:** Phase-based model eliminates confusion between pre/post state.
* **Observability:** Every emission is traceable and explainable.
* **Composability:** Enables automation, analytics, and dynamic reactions.
* **Safety:** Policy layer governs what can emit or listen to which events.

---

## Integration with Other Systems

| System           | Role                                                         |
| ---------------- | ------------------------------------------------------------ |
| **Policies**     | Gate which events can be emitted/listened to                 |
| **Capabilities** | Events describe when a capability is invoked                 |
| **Effects**      | Delayed or chained events for later execution                |
| **Contexts**     | Events exist within a context scope (per request or session) |
| **History**      | Event logs become readable narratives of system behavior     |

---

## Future Directions

* **Typed event registry** generated at build time (autocomplete for event names).
* **Event replay and simulation** tools for debugging workflows.
* **Cross-instance events** for distributed DS clusters.
* **AI-driven event graphs** that visualize dependencies and detect loops.

---

### TL;DR

> **Events = DS’s universal language of change.**
>
> They connect everything that happens, unify all temporal phases, and give developers a consistent, observable, and secure way to orchestrate behavior across plugins.

# DeesseJS Fields System

## Overview

The **Fields System** in DeesseJS defines the foundation of how data types are represented, stored, validated, and rendered within collections. Each field is a **pure entity**, defined through functional composition rather than object-oriented inheritance. Fields are responsible for bridging three layers of the framework:

* **Schema Layer (Zod)** — Validation and runtime type inference.
* **Storage Layer (Drizzle)** — Database representation and persistence rules.
* **Admin Layer (UI)** — Visual representation in the admin dashboard.

Fields are defined using a declarative API that allows developers to describe the type, configuration, and UI of each field without managing cache, validation, or database behavior explicitly.

---

## Field Definition

Each field is defined using a base `field()` function that receives a configuration object. The configuration defines its type, permissions, admin behavior, and optional metadata.

Example:

```typescript
import { text, relation, array, field } from "deesse/fields";

export const Post = collection({
  title: field({ type: text({ defaultContent: "Untitled Post" }) }),
  content: field({ type: richText() }),
  author: field({ type: relation({ target: "users" }) }),
  tags: field({ type: array(text()) }),
  publishedAt: field({ type: date() }),
  published: field({ type: boolean() })
});
```

Each `field()` call returns a **FieldEntity**, an immutable value containing metadata for validation, storage, and admin representation.

---

## FieldEntity Structure

Internally, each field is represented as a `FieldEntity` object:

```typescript
type FieldEntity<A> = {
  kind: "field";
  schema: ZodType<A>;
  drizzle: DrizzleColumnDef<A>;
  admin: {
    component: FieldComponent<A>;
    label?: string;
    description?: string;
    placeholder?: string;
  };
  config: Record<string, unknown>;
  meta: {
    optional?: boolean;
    nullable?: boolean;
    readonly?: boolean;
  };
};
```

The field entity acts as a pure descriptor — it does not perform actions or mutate state. It serves as an atomic definition of the data type and its behavior.

---

## Field Primitives

DeesseJS provides a minimal set of **base field primitives** that can express all common data structures and relationships:

| Field Type   | Description             | Common Use Cases             |
| ------------ | ----------------------- | ---------------------------- |
| `text()`     | Basic string input      | Titles, names, descriptions  |
| `number()`   | Numeric input           | Prices, quantities, ratings  |
| `date()`     | Date/time input         | Published dates, timestamps  |
| `boolean()`  | True/false toggle       | Status flags, permissions    |
| `array()`    | Array of values         | Tags, categories, lists      |
| `relation()` | Reference to other docs | Users, linked content        |
| `richText()` | Advanced text editor    | Content bodies, descriptions |

Each primitive defines its own schema, storage adapter, and admin component, ensuring consistency across the entire system.

---

## Example: Text Field

```typescript
export const text = (config?: { defaultContent?: string }): FieldEntity<string> => ({
  kind: 'field',
  schema: z.string(),
  drizzle: textColumn({ default: config?.defaultContent ?? '' }),
  admin: {
    component: TextField,
    placeholder: config?.defaultContent ?? '',
  },
  config: config ?? {},
  meta: {}
});
```

* **Schema:** Uses Zod to ensure type-safe validation.
* **Drizzle:** Maps to a text-based SQL column.
* **Admin:** Renders using a TextField component.
* **Config:** Defines default content or custom rules.

---

## Composition and Extensibility

Field primitives can be composed to form more complex fields:

```typescript
const tags = array(text());
const author = relation({ target: 'users' });
```

Developers can extend existing fields without inheritance, simply by functionally composing new entities:

```typescript
const email = () => ({
  ...text(),
  schema: z.string().email(),
  admin: { component: EmailField },
});
```

This composition model ensures each field remains pure, stateless, and reusable.

---

## Integration with Collections

Each field is registered within a collection definition through the `field()` wrapper. This allows additional context-specific metadata like permissions or lifecycle hooks to be added:

```typescript
export const User = collection({
  name: field({ type: text({ defaultContent: "Anonymous" }) }),
  email: field({ type: text() }),
  isActive: field({ type: boolean() }),
  role: field({ type: text() }),
});
```

Collections automatically merge field definitions to generate:

* Zod schemas for validation
* Drizzle table definitions for persistence
* Admin UI components for the dashboard

---

## Type Generation

All field schemas are compiled into a single, strongly-typed interface per collection.

```typescript
type User = SchemaType<typeof UserCollection>;
```

This type ensures full type safety across API routes, admin forms, and database queries.

---

## Admin Components

Each field exposes its own `admin.component`, which defines how it should be rendered in the DeesseJS admin dashboard.

```typescript
admin: {
  component: TextField,
  label: 'Title',
  description: 'Main title of the post',
  placeholder: 'Enter title here...'
}
```

The admin interface automatically renders the correct component based on the field definition, requiring no manual wiring.

---

## Philosophy

The DeesseJS Fields System is built on three principles:

1. **Functional Composition:** Fields are functions, not classes or handlers.
2. **Declarative Semantics:** Fields describe what they are, not how they behave.
3. **Implicit Intelligence:** Validation, UI rendering, and persistence are derived automatically from the field’s internal structure.

This design ensures a balance between simplicity, extensibility, and mathematical purity, enabling future systems (plugins, cache layers, or code generators) to reason about data st

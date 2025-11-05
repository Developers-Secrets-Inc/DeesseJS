# Field Types

Overview of all available field types for defining collections in DeesseJS.

## Built-in Field Types

DeesseJS provides several built-in field types for common data requirements:

### Text Fields

#### `text()`
Basic text input with validation constraints.

```typescript
{
  type: text({
    minLength?: number;     // Minimum character length
    maxLength?: number;     // Maximum character length
    pattern?: string;       // Regex pattern for validation
  }),
  label?: string,
  required?: boolean,
  // ... other field metadata
}
```

**Example:**
```typescript
title: {
  type: text({
    minLength: 1,
    maxLength: 200,
    pattern: "^[a-zA-Z0-9\\s]+$" // Letters, numbers, and spaces only
  }),
  label: "Title",
  required: true,
  placeholder: "Enter a title..."
}
```

### Number Fields

#### `number()`
Numeric input with range validation.

```typescript
{
  type: number({
    min?: number;           // Minimum value
    max?: number;           // Maximum value
  }),
  label?: string,
  required?: boolean,
  // ... other field metadata
}
```

**Example:**
```typescript
price: {
  type: number({
    min: 0,
    max: 999999.99
  }),
  label: "Price",
  required: true,
  placeholder: "0.00"
}
```

### Date Fields

#### `date()`
Date and time input with format options.

```typescript
{
  type: date({
    format?: string;        // Date format (e.g., "YYYY-MM-DD")
  }),
  label?: string,
  required?: boolean,
  // ... other field metadata
}
```

**Example:**
```typescript
publishedAt: {
  type: date({
    format: "YYYY-MM-DD HH:mm"
  }),
  label: "Publication Date",
  defaultValue: null
}
```

### Boolean Fields

#### `boolean()`
Toggle/checkbox input for true/false values.

```typescript
{
  type: boolean(),
  label?: string,
  required?: boolean,
  // ... other field metadata
}
```

**Example:**
```typescript
isPublished: {
  type: boolean(),
  label: "Published",
  defaultValue: false
}
```

### Array Fields

#### `array()`
Array of values with optional type constraints.

```typescript
{
  type: array({
    items: FieldType;       // Type of array items
    maxItems?: number;      // Maximum number of items
  }),
  label?: string,
  required?: boolean,
  // ... other field metadata
}
```

**Example:**
```typescript
tags: {
  type: array({
    items: string(),        // Array of strings
    maxItems: 10           // Maximum 10 tags
  }),
  label: "Tags",
  placeholder: "Add a tag..."
}
```

### Relation Fields

#### `relation()`
Reference to another collection.

```typescript
{
  type: relation({
    target: string;         // Target collection slug
    options?: {
      maxSelect?: number;   // Maximum selectable items
      minSelect?: number;   // Minimum selectable items
    };
  }),
  label?: string,
  required?: boolean,
  // ... other field metadata
}
```

**Example:**
```typescript
author: {
  type: relation({
    target: "users",
    options: {
      maxSelect: 1         // Single selection only
    }
  }),
  label: "Author",
  required: true
}
```

### Rich Text Fields

#### `richText()`
Advanced rich text editor with customizable toolbar.

```typescript
{
  type: richText({
    tools?: string[];       // Available toolbar tools
  }),
  label?: string,
  required?: boolean,
  // ... other field metadata
}
```

**Example:**
```typescript
content: {
  type: richText({
    tools: ["bold", "italic", "link", "list", "table"]
  }),
  label: "Content",
  required: true
}
```

## Custom Field Types

### Plugin System Extension

DeesseJS includes a powerful plugin system that allows developers to create and register custom field types:

```typescript
// Register a custom field type
import { registerFieldType } from "deesse/plugins";

interface CustomFieldConfig {
  // Custom configuration options
  apiKey?: string;
  endpoint?: string;
}

registerFieldType<CustomFieldConfig>("geolocation", {
  configure: (config) => ({
    // Type-specific configuration
    validate: (value) => {
      // Custom validation logic
      return validateGeolocation(value, config);
    },

    // Admin component
    admin: {
      component: GeolocationField,
      props: {
        apiKey: config.apiKey
      }
    },

    // Database schema generation
    drizzle: {
      type: "jsonb" // Store as JSON
    }
  })
});

// Usage in collection
location: {
  type: geolocation({
    apiKey: "your-api-key",
    endpoint: "https://api.geolocation.com"
  }),
  label: "Location",
  description: "GPS coordinates or address"
}
```

### Creating Custom Field Types

To create a custom field type:

1. **Define the configuration interface**
2. **Implement validation logic**
3. **Create admin UI component**
4. **Generate database schema**
5. **Register the field type**

```typescript
// Complete example of a custom field type
interface ColorFieldConfig {
  // Configuration options
  presetColors?: string[];
  allowCustom?: boolean;
}

const colorFieldType = registerFieldType<ColorFieldConfig>("color", {
  configure: (config) => ({
    validation: (value) => {
      if (!allowCustom && !presetColors.includes(value)) {
        return false;
      }
      return isValidColor(value);
    },

    admin: {
      component: ColorPicker,
      props: {
        presetColors: config.presetColors || [],
        allowCustom: config.allowCustom ?? true
      }
    },

    drizzle: {
      type: "varchar(7)" // Store hex colors (#RRGGBB)
    }
  })
});
```

## Field Type Reference

| Field Type | Description | Common Use Cases |
|------------|-------------|------------------|
| `text()` | Basic string input | Titles, names, descriptions |
| `number()` | Numeric input | Prices, quantities, ratings |
| `date()` | Date/time input | Published dates, timestamps |
| `boolean()` | True/false toggle | Status flags, permissions |
| `array()` | Array of values | Tags, categories, lists |
| `relation()` | Reference to other docs | User relationships, linked content |
| `richText()` | Advanced text editor | Content bodies, descriptions |

## Best Practices

### Validation
- Use appropriate constraints for each field type
- Provide helpful error messages
- Consider both client-side and server-side validation

### User Experience
- Use descriptive labels and placeholders
- Provide helpful descriptions for complex fields
- Consider admin interface defaults for your field types

### Performance
- Be careful with large text fields and rich content
- Consider database indexing for frequently queried fields
- Use appropriate data types for better performance

## Next Steps

- Learn about [field permissions](../permissions.md)
- Explore [admin settings configuration](../admin-settings.md)
- Understand [collection hooks](../hooks.md)
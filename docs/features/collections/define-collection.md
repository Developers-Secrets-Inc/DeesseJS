# Defining Collections

## Overview

Collections are the foundation of your content model in DeesseJS. Each collection represents a type of content or data entity that you want to manage, such as blog posts, users, products, or categories.

## Basic Collection Definition

### The `collection` Function

Every collection is defined using the `collection` function, which takes a configuration object containing at minimum a `name` and `slug`:

```typescript
import { collection, text, relation, date } from "deesse";

export const PostsCollection = collection({
  name: "Blog Posts",
  slug: "posts",
  fields: {
    title: {
      type: text({ minLength: 1, maxLength: 200 }), // Text type configuration
      label: "Title",                              // Field metadata
      required: true,
      description: "The main title of the post",
      placeholder: "Enter a compelling title...",
      permissions: {
        read: ["admin", "editor", "user"],
        update: ["admin", "editor"]
      }
    },
    content: {
      type: text(), // Simple text type
      label: "Content",
      required: true,
      description: "The main content of the post",
      permissions: {
        read: ["admin", "editor"],
        update: ["admin", "editor"]
      }
    },
    author: {
      type: relation({ target: "users" }), // Relation type configuration
      label: "Author",
      description: "The author of the post",
      permissions: {
        read: ["admin"],
        update: ["admin"]
      }
    },
    publishedAt: {
      type: date(), // Date type configuration
      label: "Published Date",
      description: "When the post was published",
      permissions: {
        read: ["admin", "editor", "user"],
        update: ["admin", "editor"]
      }
    }
  }
});
```

### Required Parameters

#### `name`
- **Type**: `string`
- **Description**: A human-readable name for the collection
- **Optional**: Yes, can be inferred from `slug` if not provided
- **Example**: `"Blog Posts"`, `"Users"`, `"Products"`

#### `slug`
- **Type**: `string`
- **Description**: A URL-friendly identifier for the collection
- **Required**: Yes
- **Example**: `"posts"`, `"users"`, `"products"`
- **Rules**:
  - Must contain only lowercase letters, numbers, and hyphens
  - Must start with a letter
  - Must be unique across all collections

### Automatic Name Inference

If you don't provide a `name`, it will be automatically generated from the `slug`:

```typescript
// This works fine - name will be "Posts"
export const PostsCollection = collection({
  slug: "posts",
  fields: {
    // ... fields
  }
});

// This also works - name will be "Blog Posts"
export const PostsCollection = collection({
  slug: "blog-posts",
  fields: {
    // ... fields
  }
});
```

### Collection Registration

Once defined, collections need to be registered in your main configuration:

```typescript
// deesse.config.ts
import { buildConfig } from "deesse";
import { PostsCollection } from "./collections/posts";

export default buildConfig({
  // ... other configuration
  collections: [
    PostsCollection
    // ... other collections
  ]
});
```

## Field Configuration Structure

Each field in a collection follows a structured approach that separates type-specific configuration from field metadata:

### Field Structure

```typescript
{
  type: FieldType,     // Type-specific configuration
  required?: boolean,   // Field-level constraint
  label?: string,       // Human-readable label
  description?: string, // Help text for users
  placeholder?: string, // Input placeholder
  permissions?: {       // Access control
    read: string[];
    update: string[];
  },
  defaultValue?: any,   // Default value
  // ... other field metadata
}
```

### Separation of Concerns

#### Type Configuration (`type`)
The `type` property contains configuration specific to the data type:

```typescript
title: {
  type: text({
    minLength: 1,        // Text-specific validation
    maxLength: 200       // Text-specific validation
  }),
  // ...
}
```

**Available type configurations:**
- `text({ minLength?, maxLength?, pattern? })`
- `number({ min?, max? })`
- `date({ format? })`
- `relation({ target, options? })`
- `array({ items, maxItems? })`
- `boolean()`
- `richText({ tools? })`

#### Field Metadata
Field metadata provides information about how the field should behave and be displayed:

```typescript
title: {
  type: text({ minLength: 1 }),
  required: true,                    // Field must have a value
  label: "Title",                    // Display label
  description: "The main title",    // Help text
  placeholder: "Enter title...",     // Input placeholder
  permissions: {                     // Who can access
    read: ["admin", "editor"],
    update: ["admin", "editor"]
  }
}
```

## Next Steps

Once you have the basic collection structure defined, you can:

1. [Add field types and configurations](./fields.md)
2. [Configure admin settings](./admin-settings.md)
3. [Set up permissions](./permissions.md)
4. [Define hooks and validation](./hooks.md)
5. [Configure database settings](./database-settings.md)

## Examples

### Minimal Collection

```typescript
export const MinimalCollection = collection({
  slug: "minimal",
  fields: {
    name: {
      type: text(),
      required: true
    }
  }
});
```

### Collection with Automatic Name

```typescript
// Name will be "Categories"
export const CategoriesCollection = collection({
  slug: "categories",
  fields: {
    title: {
      type: text(),
      required: true,
      label: "Category Title"
    },
    description: {
      type: text(),
      label: "Description"
    }
  }
});
```

### Collection with Full Metadata

```typescript
export const FullCollection = collection({
  name: "Complete Blog Posts",
  slug: "blog-posts",
  fields: {
    title: {
      type: text({ minLength: 1, maxLength: 200 }),
      required: true,
      label: "Title",
      description: "The main title of the post",
      permissions: {
        read: ["admin", "editor", "user"],
        update: ["admin", "editor"]
      }
    },
    content: {
      type: text(),
      required: true,
      label: "Content",
      description: "The main content of the post",
      permissions: {
        read: ["admin", "editor"],
        update: ["admin", "editor"]
      }
    },
    excerpt: {
      type: text({ maxLength: 500 }),
      label: "Excerpt",
      description: "A short summary of the post"
    },
    author: {
      type: relation({ target: "users" }),
      label: "Author",
      description: "The author of the post",
      permissions: {
        read: ["admin"],
        update: ["admin"]
      }
    },
    publishedAt: {
      type: date(),
      label: "Published Date",
      description: "When the post was published",
      permissions: {
        read: ["admin", "editor", "user"],
        update: ["admin", "editor"]
      }
    },
    tags: {
      type: array(string()),
      label: "Tags",
      description: "Tags associated with the post"
    }
  }
});
```
# Collections System

## Schema Definition

Collections will be defined using a hidden Zod-based DSL that provides a clean, intuitive API while maintaining full type safety. The system internally uses Zod but abstracts it away from developers.

Each field is defined using the `field()` function with a configuration object that includes the type and permissions:

```typescript
export const PostSchema = collection({
  title: field({
    type: text(),
    permissions: {
      read: ["admin", "editor", "user"],
      update: ["admin", "editor"]
    }
  }),

  content: field({
    type: richText(),
    permissions: {
      read: ["admin", "editor"],
      update: ["admin", "editor"]
    }
  }),

  author: field({
    type: relation("users"),
    permissions: {
      read: ["admin"],
      update: ["admin"]
    }
  }),

  publishedAt: field({
    type: date().optional(),
    permissions: {
      read: ["admin", "editor"],
      update: ["admin"]
    }
  }),

  tags: field({
    type: array(text()),
    permissions: {
      read: ["admin", "editor", "user"],
      update: ["admin", "editor"]
    }
  }),

  createdAt: field({
    type: date().default(() => new Date()),
    permissions: {
      read: ["admin", "editor"],
      update: [] // No update permission - auto-managed field
    }
  }),

  updatedAt: field({
    type: date().default(() => new Date()),
    permissions: {
      read: ["admin", "editor"],
      update: [] // No update permission - auto-managed field
    }
  })
});

export const PostConfig = {
  slug: 'posts', // String used as database identifier
  admin: {
    group: 'Content', // Optional field for grouping collections in admin interface
    description: 'Blog posts and articles published on the site',
    useAsTitle: 'title' // Field name to use as the main title for each element
  }
};
```

## Database Access System

We will implement a database access system that provides generated methods for each collection. Similar to Payload, this will provide a clean and intuitive API for database operations.

```typescript
// Access collection posts
db.posts.find({
  where: {
    published: true
  },
  limit: 10,
  sort: {
    createdAt: 'desc'
  }
});

// Create a new post
db.posts.create({
  data: {
    title: "My First Post",
    content: "Hello, world!",
    published: true,
    author: "john.doe"
  }
});

// Update a post
db.posts.update({
  where: {
    id: "post-id"
  },
  data: {
    title: "Updated Title",
    updatedAt: new Date()
  }
});

// Delete a post
db.posts.delete({
  where: {
    id: "post-id"
  }
});
```

## Generated Methods

For each collection named `collectionName`, the following methods will be automatically generated:

- `find()` - Query documents with filters, pagination, and sorting
- `create()` - Create new documents
- `update()` - Update existing documents
- `delete()` - Delete documents
- `count()` - Count documents matching criteria
- `findById()` - Find a document by ID
- `findOne()` - Find a single document matching criteria

## Type Generation

The system automatically generates TypeScript types from the schema definitions, ensuring full type safety throughout the application without requiring developers to work directly with Zod:

```typescript
// Generated type based on schema definition
type Post = SchemaType<typeof PostSchema>;

// Usage in components with full type safety
function PostCard({ post }: { post: Post }) {
  return <h1>{post.title}</h1>;
}
```

## Strongly Typed Database Operations

Database operations will be strongly typed and aware of schema constraints, providing enhanced security through data validation before database interaction. All operations validate data against the schema before executing database queries:

```typescript
// CREATE operation - validates data before insertion
db.posts.create({
  data: {
    title: "My First Post",      // Will be validated against text() constraints
    content: "Hello, world!",    // Will be validated against richText() constraints
    author: "john.doe",         // Will be validated as relation to users collection
    publishedAt: new Date(),     // Optional field - validation passes even if undefined
    tags: ["typescript", "next"] // Will be validated as array of strings
  }
  // Data is validated against PostSchema before database insertion
  // If validation fails, operation throws with detailed error messages
});

// UPDATE operation - validates both data and existing document
db.posts.update({
  where: {
    id: "post-id"
  },
  data: {
    title: "Updated Title",     // Will be validated - cannot be empty, max 200 chars
    publishedAt: undefined      // Valid - optional field can be undefined
  }
  // Data is validated against schema before database update
});

// Query operations with typed filtering
db.posts.find({
  where: {
    published: true,            // Type-safe - must be boolean
    author: {
      equals: "john.doe"       // Typed relation queries
    },
    tags: {
      has: "typescript"        // Array operations are typed
    }
  }
});
```

## Collections Information API

We will provide an API that allows introspection of collections and their field definitions. This enables runtime access to collection metadata, field types, and permissions:

```typescript
// Access collection information
const postsFields = collections.posts.fields;
console.log(postsFields);

// Example output structure:
{
  title: {
    type: 'text',
    permissions: {
      read: ["admin", "editor", "user"],
      update: ["admin", "editor"]
    },
    constraints: {
      minLength: 1,
      maxLength: 200
    }
  },
  content: {
    type: 'richText',
    permissions: {
      read: ["admin", "editor"],
      update: ["admin", "editor"]
    }
  },
  author: {
    type: 'relation',
    target: "users",
    permissions: {
      read: ["admin"],
      update: ["admin"]
    }
  }
}

// Get all registered collections
const allCollections = collections.list();
// Returns: ["posts", "users", "categories"]

// Check if a field exists
const hasTitleField = collections.posts.hasField("title");
// Returns: true

// Get field permissions
const titleReadPermissions = collections.posts.getFieldPermissions("title", "read");
// Returns: ["admin", "editor", "user"]

// Get field type
const titleType = collections.posts.getFieldType("title");
// Returns: "text"
```

## Security Benefits

This strong typing approach provides several security advantages:

- **Prevent Invalid Data**: Schema validation prevents malformed data from reaching the database
- **Type Safety**: Full TypeScript coverage eliminates runtime type errors
- **Input Validation**: All data is validated against defined constraints before database operations
- **Relation Integrity**: Relation fields are validated against target collection existence
- **Consistent Validation**: Same validation logic applies across all operations
- **Detailed Error Messages**: Clear validation errors help developers fix data issues quickly
- **Runtime Introspection**: The collections API provides access to schema information for dynamic UI generation and permission checking

## Collection Hooks

Each collection provides a set of hooks that allow developers to run custom logic at different stages of the data lifecycle. These hooks enable complex business logic, data transformation, and event handling.

### Hook Configuration Options

Each collection can be configured with hooks at the following stages:

- **Config Options**: Global configuration for collection-level behavior

### Operation Hooks

**beforeOperation**:
- Executed before any database operation
- Global pre-operation logic validation
- Authorization and security checks
- Operation logging and monitoring

**afterOperation**:
- Executed after any database operation completes
- Global post-operation cleanup
- Success/error logging and metrics
- Integration with external services

### Validate Hooks

**beforeValidate**:
- Field-level validation logic
- Cross-field validation rules
- Custom validation functions
- Format and constraint checking

### Change Hooks

**beforeChange**:
- Pre-update data transformation
- Automating field updates
- Preventing changes based on business rules
- Setting derived fields

**afterChange**:
- Post-update notification systems
- Cache invalidation
- Related data synchronization
- Audit trail logging

### Read Hooks

**beforeRead**:
- Data filtering and masking
- Dynamic field visibility
- row-level security enforcement
- Query optimization hooks

**afterRead**:
- Data transformation after retrieval
- Field computation
- Caching mechanisms
- Related data loading

### Delete Hooks

**beforeDelete**:
- Soft deletion logic
- Cascade deletion prevention
- Dependency checks
- Archive operations

**afterDelete**:
- Cleanup operations
- Cache invalidation
- External service notifications
- Audit logging for deletions
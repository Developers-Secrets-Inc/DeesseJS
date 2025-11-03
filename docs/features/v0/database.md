# Database Features

## Database Operations

The DeesseJS framework provides two core database functions for data operations:

### Query and Mutation Functions

**query()**:
- Retrieves data from the database
- Used for read operations
- Returns data based on specified criteria
- Support for complex data retrieval patterns
- Signature: `query(args: zodObject, handler: async (ctx: ContextType, args: ArgsType) => ResultType, options?: { cachedTime?: number; cacheKey?: string })`
- **Cache Support**: Optional `cachedTime` parameter in seconds for result caching
- **Cache Key**: Optional `cacheKey` parameter for cache management

**mutation()**:
- Modifies data in the database
- Used for create, update, and delete operations
- Supports data validation and constraints
- Returns operation status and modified data
- Signature: `mutation(args: zodObject, handler: async (ctx: ContextType, args: ArgsType) => ResultType, options?: { revalidate?: string[]; clientRevalidate?: string[] })`
- **Server Revalidation**: Optional `revalidate` parameter for server cache revalidation keys
- **Client Revalidation**: Optional `clientRevalidate` parameter for client cache revalidation keys
- **Return Object**: Destructured object with operation details

### Function Parameters

**args**: First parameter containing input validation schema using zod
**handler**: Second parameter - an asynchronous function with:
- **ctx**: Context object containing:
  - **database**: Direct database access
  - **session**: Current user session and authentication state
  - **metadata**: Additional request and context metadata
- **args**: Validated input data from the first parameter
- **Returns**: Promise that resolves to operation results

Both functions are called using an object syntax:

```typescript
// Query function call pattern
const data = query({
  id: number
}, async (ctx, args) => {
  return db.users.findUnique({ where: { id: args.id } })
}, {
  cachedTime: 60, // cache for 60 seconds
  cacheKey: 'user:single'
})

// Mutation function call pattern
const { result, error, revalidatedKeys } = mutation({
  userInput: zodObject
}, async (ctx, args) => {
  return db.users.create({ data: args.userInput })
}, {
  revalidate: ['users:all', 'users:stats'],
  clientRevalidate: ['profile:overview']
})
```

The handler function is automatically called with the validated input data.

### Real-time Zod Validation

- **Immediate Validation**: Zod schema validation occurs instantly on function call
- **Type Checking**: Real-time type checking before handler execution
- **Automatic Casting**: Data is automatically cast to the expected types
- **Error Propagation**: Validation errors are immediately thrown and can be handled
- **Development-time Checking**: Type safety checked during development and runtime

### Core Features

- **Type Safety**: Both functions work with strongly typed data structures
- **Flexibility**: Support for complex queries and mutations across collections
- **Performance**: Optimized for efficient database interactions
- **Error Handling**: Comprehensive error handling and validation
- **Plugin Integration**: Designed to work seamlessly with plugin data models
- **Real-time Validation**: Immediate Zod schema validation on function calls

## Cache Key Type System

### Key Registration
- **Query Key Registry**: All query keys are automatically registered in a global type
- **Type-safe References**: Server mutation revalidation keys are typed based on registered query keys
- **Compile-time Checking**: Cache key validation occurs during development

### Cache Key Schema
```typescript
// Auto-generated type containing all query keys
type QueryCacheKeys =
  | 'users:all'
  | 'posts:list'
  | 'chats:single'
  | 'analytics:overview'
  | ...pluginSpecificKeys;

// Server revalidation accepts only registered query keys
type ServerRevalidateKeys = QueryCacheKeys[];
```

### Cache Synchronization
- **Automatic Coherence**: Mutation revalidation targets are validated against registered query keys
- **Client-server Sync**: Client revalidation keys are typed and tracked
- **Dependency Management**: Key relationships are automatically inferred and validated
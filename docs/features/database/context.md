# Plugin-Based Context Architecture

## Overview

The Context in DeesseJS is a dynamic, extensible object that starts completely empty and gets populated through a plugin-based system. This architecture allows for flexible composition of functionality like database access, authentication, collections, and custom plugins.

**Important**: This context system works alongside the existing plugin system for admin UI/pages/widgets. Context plugins are different from admin plugins - they extend the runtime context used in queries and mutations.

## Core Concept

### The Empty Base Context

```typescript
// packages/deesse/src/context/base.ts
export type Context = Record<string, any>;
```

The base `Context` type is completely empty - it's just a `Record<string, any>` that can be extended with any properties through context plugins.

### Context Builder Interface

```typescript
// packages/deesse/src/context/builder.ts
import { Context } from './base';
import { ContextPlugin } from './types';

export interface ContextBuilder {
  use(plugin: ContextPlugin, options?: any): ContextBuilder;
  build(): Context;
  reset(): ContextBuilder;
}

// Implementation
export function context(): ContextBuilder {
  let context: Context = {};
  const usedPlugins: ContextPlugin[] = [];

  return {
    use(plugin: ContextPlugin, options?: any): ContextBuilder {
      usedPlugins.push(plugin);

      // Setup the plugin
      const setup = plugin.setup(options || {});

      // Merge context object if provided
      if (setup.context) {
        context = { ...context, ...setup.context };
      }

      return this;
    },

    build(): Context {
      return { ...context }; // Return a copy
    },

    reset(): ContextBuilder {
      context = {};
      usedPlugins.length = 0;
      return this;
    }
  };
}
```

### Context Plugin Interface

```typescript
// packages/deesse/src/context/types.ts
import { Context } from './base';

// Use the existing plugin function from the plugin system
import { plugin } from '../plugins/define-plugin';

// Context plugins can return an object that will be merged into the context
export interface ContextPluginSetup {
  context?: Record<string, any>;  // Optional object to merge into context
  dependencies?: string[];
}

// Context plugins use the same plugin() function but can return context object
export type ContextPlugin = ReturnType<typeof plugin>;
```

This interface uses the existing `plugin()` function from the plugin system, but context plugins can optionally return a `context` object that will be automatically merged into the context. This is simpler than the `install` approach - just return an object and it will be available in the context.

## Type Safety with Plugins

### 1. Creating Safe Context Types

```typescript
// packages/deesse/src/context/types.ts
import { Context } from './base';

// Base context with type-safe plugins
export interface AppContext extends Context {
  // Database plugin will extend this
  db?: DatabaseContext;
  // Auth plugin will extend this
  auth?: AuthContext;
  // Collections plugin will extend this
  collections?: CollectionsContext;
  // Any custom plugins
  [key: string]: any;
}

// Type helper to create context with specific plugins
export type CreateContext<TPlugins extends Record<string, any>> = AppContext & TPlugins;

// Type helper to extract plugin types
export type PluginTypes<T extends Context> = {
  [K in keyof T]: T[K] extends Context ? PluginTypes<T[K]> : T[K];
};
```

### 2. Integration with Configuration System

```typescript
// packages/deesse/src/context/integration.ts
import { Config } from '../config/types';
import { Context } from './base';
import { ContextPlugin } from './types';

interface ContextPluginConfig {
  name: string;
  options?: any;
  dependencies?: string[];
}

// Extend Config type to include context plugins
export interface ExtendedConfig extends Config {
  contextPlugins?: ContextPluginConfig[];
}

// Context plugin registry
export const contextPluginRegistry = new Map<string, ContextPlugin>();
```

## Built-in Context Plugins

### Database Context Plugin

```typescript
// packages/deesse/src/context-plugins/database/plugin.ts
import { plugin } from "deesse/plugin";
import { AnyCollection } from "../../../collections/types";

export interface DatabaseContext {
  db: DatabaseInterface;
}

const DatabasePlugin = plugin(
  'database',
  'Database Context Plugin',
  '1.0.0',
  (options: { collections: AnyCollection[] }) => {
    // Simply return the context object that will be merged
    return {
      description: 'Provides database access methods',
      context: {
        db: createDatabaseInterface(options.collections)
      },
      dependencies: [] // Optional dependencies
    };
  }
);

function createDatabaseInterface(collections: AnyCollection[]): DatabaseInterface {
  return {
    // Database methods will be dynamically generated
    // See collections-dynamic-generation.md for implementation
  };
}

export { DatabasePlugin };
```

### Authentication Context Plugin

```typescript
// packages/deesse/src/context-plugins/auth/plugin.ts
import { plugin } from "deesse/plugin";

export interface AuthContext {
  auth: AuthService;
  user?: User;
  isAuthenticated: boolean;
}

const AuthPlugin = plugin(
  'auth',
  'Authentication Context Plugin',
  '1.0.0',
  (options: { secret: string; provider?: string }) => {
    // Simply return the context object that will be merged
    return {
      description: 'Provides authentication services',
      context: {
        auth: createAuthService(options),
        isAuthenticated: false
      },
      dependencies: [] // Optional dependencies
    };
  }
);

function createAuthService(options: { secret: string; provider?: string }): AuthService {
  return {
    // Authentication methods
    login: async () => {},
    logout: async () => {},
    getCurrentUser: async () => {},
    // etc.
  };
}

export { AuthPlugin };
```

### Collections Context Plugin

```typescript
// packages/deesse/src/context-plugins/collections/plugin.ts
import { plugin } from "deesse/plugin";
import { AnyCollection } from "../../../collections/types";

export interface CollectionsContext {
  collections: CollectionsService;
}

const CollectionsPlugin = plugin(
  'collections',
  'Collections Context Plugin',
  '1.0.0',
  (options: { collections: AnyCollection[] }) => {
    // Simply return the context object that will be merged
    return {
      description: 'Provides collections management',
      context: {
        collections: createCollectionsService(options.collections)
      },
      dependencies: ['database'] // Depends on database plugin
    };
  }
);

function createCollectionsService(collections: AnyCollection[]): CollectionsService {
  return {
    // Collections management methods
    getCollection: (slug: string) => {},
    getAllCollections: () => collections,
    // etc.
  };
}

export { CollectionsPlugin };
```

## Usage Examples

### 1. Basic Context Builder Usage

```typescript
import { context } from 'deesse/context';
import { DatabasePlugin } from 'deesse/context-plugins/database';
import { AuthPlugin } from 'deesse/context-plugins/auth';
import { CollectionsPlugin } from 'deesse/context-plugins/collections';

// Create context with builder pattern
const context = context()
  .use(AuthPlugin, { secret: 'your-secret', provider: 'jwt' })
  .use(DatabasePlugin, { collections: [PostsCollection, UsersCollection] })
  .build();

// Result type: Context & AuthContext & DatabaseContext & CollectionsContext
// context.db is available
// context.auth is available
// context.collections is available
```

### 2. Selective Plugin Installation

```typescript
// Only install auth and database plugins
const minimalContext = context()
  .use(AuthPlugin, { secret: 'your-secret' })
  .use(DatabasePlugin, { collections: [PostsCollection] })
  .build();

// Available functionality:
minimalContext.auth.login({ email: 'user@example.com' });
minimalContext.db.posts.create({ title: 'Hello' });
// minimalContext.collections is NOT available
```

### 3. Multiple Context Instances

```typescript
// Create different context configurations for different use cases
const adminContext = context()
  .use(AuthPlugin, { secret: 'admin-secret', provider: 'session' })
  .use(DatabasePlugin, { collections: allCollections })
  .use(CollectionsPlugin, { collections: allCollections })
  .build();

const publicContext = context()
  .use(AuthPlugin, { secret: 'public-secret', provider: 'jwt' })
  .use(DatabasePlugin, { collections: publicCollections })
  .build();

// Use different contexts in different scenarios
const adminResult = query({ handler: async (ctx) => ctx.db.users.delete('123') }, adminContext);
const publicResult = query({ handler: async (ctx) => ctx.db.posts.find({ published: true }) }, publicContext);
```

### 4. Context Reset and Reuse

```typescript
const builder = context();

// First usage
const context1 = builder
  .use(AuthPlugin, { secret: 'secret1' })
  .build();

// Reset and reuse for different configuration
const context2 = builder
  .reset()
  .use(AuthPlugin, { secret: 'secret2' })
  .use(DatabasePlugin, { collections: differentCollections })
  .build();
```

### 5. Custom Plugin Example

```typescript
// packages/deesse/src/context-plugins/logger/plugin.ts
import { plugin } from "deesse/plugin";

export interface LoggerContext {
  logger: LoggerService;
}

const LoggerPlugin = plugin(
  'logger',
  'Logger Context Plugin',
  '1.0.0',
  (options: { level?: string } = {}) => {
    // Simply return the context object that will be merged
    return {
      description: 'Provides logging services',
      context: {
        logger: {
          info: (message: string, data?: any) => console.log(message, data),
          error: (message: string, error?: Error) => console.error(message, error),
          warn: (message: string, data?: any) => console.warn(message, data),
        }
      },
      dependencies: [] // Optional dependencies
    };
  }
);

// Usage with builder pattern
const contextWithLogger = context()
  .use(LoggerPlugin, { level: 'debug' })
  .build();

contextWithLogger.logger.info('Application started');
```

## Integration with Query/Mutation Functions

### 1. Updated Query Function with Context Support

```typescript
// packages/deesse/src/database/functions.ts
import { z } from "zod";
import { Context } from './context';

export const query = <Schema extends z.ZodTypeAny, T>(
  config: {
    args?: Schema;
    handler: (ctx: Context, args: Schema extends undefined ? undefined : z.infer<Schema>) => Promise<T>;
  },
  context?: Context
): (args?: Schema extends undefined ? undefined : z.infer<Schema>) => Promise<T> => {

  return async (args?: Schema extends undefined ? undefined : z.infer<Schema>) => {
    // Use provided context or create empty one
    const ctx = context || {};

    if (config.args) config.args.parse(args ?? {});
    return config.handler(ctx, args ?? ({} as any));
  }
}
```

### 2. Usage in Practice

```typescript
// Create a context once and reuse it
const appContext = context()
  .use(AuthPlugin, { secret: 'your-secret', provider: 'jwt' })
  .use(DatabasePlugin, { collections: [PostsCollection, UsersCollection] })
  .build();

// Query with pre-configured context
const result = query({
  handler: async (ctx) => {
    // ctx.db is available here
    const posts = await ctx.db.posts.find({ published: true });

    // ctx.auth is available here
    if (ctx.isAuthenticated) {
      const user = await ctx.auth.getCurrentUser();
      return { posts, user };
    }

    return { posts };
  }
}, appContext);

// Query with minimal context
const minimalContext = context()
  .use(DatabasePlugin, { collections: [PostsCollection] })
  .build();

const publicResult = query({
  handler: async (ctx) => {
    const posts = await ctx.db.posts.find({ published: true });
    return { posts };
  }
}, minimalContext);
```

### 3. Integration with buildConfig

```typescript
// packages/deesse/src/config/integration.ts
import { buildConfig } from './build-config';
import { context } from '../context';
import { AuthPlugin } from '../context-plugins/auth';
import { DatabasePlugin } from '../context-plugins/database';
import { CollectionsPlugin } from '../context-plugins/collections';
import { PostsCollection, UsersCollection } from '../collections';

export function buildAppConfig(config: {
  secret: string;
  admin: any;
  auth: any;
  collections: any[];
}) {
  // Build the context as part of configuration
  const appContext = context()
    .use(AuthPlugin, {
      secret: config.secret,
      ...config.auth
    })
    .use(DatabasePlugin, {
      collections: config.collections
    })
    .use(CollectionsPlugin, {
      collections: config.collections
    })
    .build();

  // Build the main config
  const deesseConfig = buildConfig(config);

  return {
    ...deesseConfig,
    context: appContext, // Add the pre-built context
    getContext: () => appContext, // Helper to get context
  };
}
```

### 4. Usage in deesse.config.ts

```typescript
// deesse.config.ts
import { buildAppConfig } from 'deesse/config';
import { PostsCollection, UsersCollection } from './collections';

export default buildAppConfig({
  secret: process.env.DEESEE_SECRET || 'your-secret-key',
  admin: {
    defaultLanguage: 'fr'
  },
  auth: {
    provider: 'jwt',
    expiresIn: '7d'
  },
  collections: [PostsCollection, UsersCollection]
});

// In your application code
import { getConfig } from 'deesse/config';
import { query } from 'deesse/database';

const config = getConfig();
const context = config.getContext();

const result = query({
  handler: async (ctx) => {
    // ctx.db, ctx.auth, ctx.collections are all available
    return ctx.db.posts.find();
  }
}, context.getContext());
```

## Advanced Plugin Features

### 1. Plugin Dependencies

Context plugins support the same dependency system as admin plugins:

```typescript
// packages/deesse/src/context-plugins/admin/plugin.ts
import { plugin } from "deesse/plugin";
import { DatabasePlugin } from '../database';

const AdminPlugin = plugin(
  'admin',
  'Admin Context Plugin',
  '1.0.0',
  (options: { secret: string }) => {
    return {
      description: 'Provides admin functionality',
      context: {
        admin: {
          // Admin functionality that uses database (will be available due to dependencies)
          createAdminUser: async (userData) => {
            // The database plugin will have been merged first due to dependencies
            return ctx.db.users.create({ ...userData, role: 'admin' });
          }
        }
      },
      dependencies: ['database'] // Depends on database plugin
    };
  }
);
```

### 2. Plugin Intercommunication

Plugins can share data through the merged context:

```typescript
// packages/deesse/src/context-plugins/analytics/plugin.ts
import { plugin } from "deesse/plugin";

const AnalyticsPlugin = plugin(
  'analytics',
  'Analytics Context Plugin',
  '1.0.0',
  (options: { trackingId: string }) => {
    return {
      description: 'Provides analytics services',
      context: {
        analytics: {
          track: (event, data) => {
            // Access other plugins through the merged context
            // The context will contain auth and database due to dependencies
            if (ctx.auth) {
              // Track user-specific events
              console.log('Tracking event for user:', ctx.auth.user?.id);
            }
            if (ctx.db) {
              // Store events in database
              ctx.db.analytics.create({ event, data, timestamp: new Date() });
            }
          }
        }
      },
      dependencies: ['auth', 'database'] // Depends on both auth and database
    };
  }
);
```

### 3. Multiple Context Properties

A plugin can return multiple properties in the context:

```typescript
// packages/deesse/src/context-plugins/redis/plugin.ts
import { plugin } from "deesse/plugin";

const RedisPlugin = plugin(
  'redis',
  'Redis Context Plugin',
  '1.0.0',
  (options: { url: string }) => {
    const client = createRedisClient(options.url);

    return {
      description: 'Provides Redis client and caching utilities',
      context: {
        redis: client,
        cache: {
          get: (key: string) => client.get(key),
          set: (key: string, value: any, ttl?: number) => client.set(key, value, { EX: ttl }),
          del: (key: string) => client.del(key)
        },
        session: {
          get: (sessionId: string) => client.get(`session:${sessionId}`),
          set: (sessionId: string, data: any, ttl?: number) => client.set(`session:${sessionId}`, JSON.stringify(data), { EX: ttl })
        }
      },
      dependencies: [] // Optional dependencies
    };
  }
);

// Usage
const context = context()
  .use(RedisPlugin, { url: 'redis://localhost:6379' })
  .build();

// Multiple properties are available
context.cache.set('user:123', { name: 'John' });
context.session.set('abc123', { userId: 123 });
const cacheValue = await context.cache.get('user:123');
```

## Benefits of Plugin Architecture

1. **Modularity**: Each feature is isolated in its own plugin
2. **Flexibility**: Only install the plugins you need
3. **Type Safety**: Full TypeScript support for all plugin properties
4. **Testability**: Each plugin can be tested independently
5. **Extensibility**: Easy to add new plugins without modifying core functionality
6. **Tree Shaking**: Unused plugins don't get bundled
7. **Version Isolation**: Plugins can have different version requirements

## Migration Guide

### From Static Context to Plugin Context

**Before:**
```typescript
type Context = {
  db: Database;
  auth: Auth;
  collections: Collections;
};
```

**After:**
```typescript
type Context = Record<string, any>; // Empty base
// Add plugins as needed
const context = contextInstaller.installPlugins({}, ['database', 'auth', 'collections']);
```

This plugin-based architecture provides the flexibility to extend the context with any functionality while maintaining type safety and modularity.
# Global Configuration Access Architecture

## Overview

This document outlines the optimal architecture for global configuration access across the DeesseJS application. After analyzing multiple approaches (React Context, Global Variables, Next.js Props), this architecture provides the best balance of accessibility, performance, type-safety, and security. The system enables configuration access from anywhere in the codebase without prop drilling or limitations.

**Important**: All plugin-related code must be located in `/deesse/plugins` directory. This includes plugin definitions, plugin components, and any plugin-specific utilities or types.

## Core Principles

### 1. Universal Accessibility
- Configuration accessible from anywhere in the codebase
- No prop drilling or component hierarchy limitations
- Works in components, libraries, utilities, and server functions

### 2. Runtime Module Cache
- In-memory caching for O(1) access performance
- Single initialization pattern with explicit control
- Type-safe global state management

### 3. Server-Only Security
- Configuration never leaves the server environment
- No client-side exposure of sensitive data
- Server Components for optimal performance

### 4. Build-Time Processing
- Configuration processed once at build time via `deesse.config.ts`
- All plugins resolved and validated during build
- Static generation for better performance

### 5. Type-Safe Access
- Full TypeScript support throughout the system
- No runtime type checking overhead
- IDE support with autocompletion

### 6. External Configuration File
- Centralized configuration in `deesse.config.ts` file
- Follows PayloadCMS patterns with `export default buildConfig()`
- Environment variable support for sensitive data

## Architecture Overview

### 1. Runtime Configuration Cache

```typescript
// /packages/deesse/src/config/index.ts
import type { Config } from './types';
import type { Plugin } from '../plugins/types'; // Import Plugin type from /deesse/plugins

// Runtime cache with TypeScript safety
let _config: Config | null = null;

export function getConfig(): Config {
  if (!_config) {
    throw new Error(
      'DeesseJS configuration not accessed. ' +
      'Make sure to import your deesse.config.ts file first.'
    );
  }
  return _config;
}

export function hasConfig(): boolean {
  return _config !== null;
}

// Internal auto-initialization function (hidden from users)
function initializeConfig(config: Config): void {
  if (_config !== null) {
    console.warn('DeesseJS config already initialized, using existing cache');
  }
  _config = config;
}

// For development hot reload (internal use)
export function refreshConfig(config: Config): void {
  _config = config;
}

// Server-side safe getter
export function requireConfig(): Config {
  const config = getConfig();
  if (process.env.NODE_ENV === 'production' && !config) {
    throw new Error('Production requires configuration to be initialized');
  }
  return config;
}
```

### 2. Configuration Building Process (Auto-Initializes)

```typescript
// /packages/deesse/src/config/build.ts
import type { Config } from './types';
import type { Plugin } from '../plugins/types'; // Import Plugin type from /deesse/plugins
import { initializeConfig } from './index'; // Import internal initialization

export async function buildConfig(config: Config): Promise<Config> {
  // Process plugins sequentially
  let processedConfig = config;
  for (const plugin of config.plugins) {
    processedConfig = await plugin(processedConfig);
  }

  // Auto-initialize the cache (hidden from users)
  initializeConfig(processedConfig);

  return processedConfig; // Fully processed configuration
}
```

### 3. Plugin Type Definitions

```typescript
// /deesse/plugins/types.ts - All plugin types must be in /deesse/plugins
export interface PluginPage {
  path: string;          // "seo/overview"
  component: React.ComponentType; // Server Component
  title?: string;
  permissions?: string[];
}

export interface Plugin {
  pages: PluginPage[];
  // Other plugin properties
}
```

### 4. Configuration Type Definitions

```typescript
// /packages/deesse/src/config/types.ts
export interface Config {
  secret: string;
  admin: AdminConfig;
  auth: AuthConfig;
  plugins: Plugin[]; // Import Plugin type from /deesse/plugins
  collections?: Collection[]; // Optional future collections system
  globals?: Global[];        // Optional future globals system
}
```

### 5. External Configuration File (Auto-Initialized)

```typescript
// /your-project/deesse.config.ts
import { buildConfig } from 'deesse/config';
import type { Plugin } from 'deesse/plugins'; // Import Plugin type from /deesse/plugins
import { seo } from 'deesse/plugins/seo'; // Plugins imported from /deesse/plugins

// Auto-initialization - no manual initConfig() call needed!
export default buildConfig({
  secret: process.env.DEESEE_SECRET || 'your-secret-key',
  admin: { defaultLanguage: 'fr' },
  auth: {},
  plugins: [seo({ title: 'My App' })]
});

// Configuration is automatically cached when imported
```

**Plugin Directory Structure**:
```
/deesse/plugins/
├── seo/
│   ├── index.ts         # Main plugin export
│   ├── components.ts    # Plugin-specific components
│   └── types.ts         # Plugin-specific types
├── analytics/
│   ├── index.ts
│   └── components.ts
└── shared/
    └── types.ts         # Common plugin types
```

## Universal Access Pattern

### 1. Simplified RootLayout (No Props!)

```typescript
// /packages/admin/src/layouts/root-layout.tsx
import { getConfig } from 'deesse/config';
import { LoginPage } from "../pages/login-page";

export const RootLayout: React.FC<{ segments: string[] }> = ({ segments }) => {
  // Direct config access - no props needed!
  const config = getConfig();

  // Build plugin pages mapping
  const pluginPages = new Map(
    config.plugins.flatMap(plugin =>
      plugin.pages.map(page => [page.path, page.component])
    )
  );

  const currentPath = segments.join('/');
  const PluginComponent = pluginPages.get(currentPath);

  // Serve plugin pages
  if (PluginComponent) {
    return <PluginComponent />;
  }

  // Serve core pages
  if (segments.includes("login")) {
    return <LoginPage />;
  }

  // Default layout
  return (
    <div>
      <h1>{config.admin.defaultLanguage} - Root Layout</h1>
      <ul>
        {segments.map((segment, index) => (
          <li key={index}>{segment}</li>
        ))}
      </ul>
    </div>
  );
};
```

### 2. Plugin Development Example

```typescript
// /deesse/plugins/seo/index.ts - All plugins must be in /deesse/plugins
import type { Plugin } from '../types'; // Import Plugin type from /deesse/plugins
import { getConfig } from 'deesse/config';

const seoPlugin = (): Plugin => {
  return {
    pages: [
      {
        path: "seo/overview",
        component: async () => {
          // Direct config access anywhere!
          const config = getConfig();
          return <SeoOverview defaultLanguage={config.admin.defaultLanguage} />;
        }
      },
      {
        path: "seo/settings",
        component: SeoSettings
      }
    ]
  };
};

export default seoPlugin;
```

**Plugin Development Rules**:
- All plugins must be located in `/deesse/plugins/`
- Plugin imports must use paths like `import { seo } from 'deesse/plugins/seo'`
- Plugin-specific components should be co-located with the plugin
- Plugin types should be in `/deesse/plugins/shared/types.ts` if shared

### 3. Universal Access Examples

```typescript
// In any file - components, utilities, libraries, etc.
import { getConfig } from 'deesse/config';

// Example 1: Component
export function MyComponent() {
  const config = getConfig();
  return <div>{config.admin.defaultLanguage}</div>;
}

// Example 2: Utility function
export function getAdminConfig() {
  const config = getConfig();
  return config.admin;
}

// Example 3: Server action
export async function someServerAction() {
  const config = getConfig();
  const secret = config.secret;
  // Use secret for server operations
}

// Example 4: Library function (external package)
export function someLibraryFunction() {
  const config = getConfig();
  return config.plugins;
}
```

## Architecture Comparison

### Analyzed Approaches

| Approach | Accessibility | Performance | Type-Safety | Maintenance | Security |
|----------|---------------|-------------|-------------|-------------|----------|
| React Context | ❌ Limited (props drilling) | ⚠️ Middle | ✅ Full | ❌ Complex | ✅ Safe |
| Global Variables | ✅ Everywhere | ✅ Best | ❌ None | ✅ Simple | ❌ Unsafe |
| Module Cache (Recommended) | ✅ Everywhere | ✅ Best | ✅ Full | ✅ Simple | ✅ Safe |
| Next.js Props | ❌ Server only | ✅ Best | ✅ Full | ✅ Simple | ✅ Safe |

### Why Module Cache Wins

1. **Universal Accessibility**: Works everywhere without prop limitations
2. **Optimal Performance**: O(1) access with in-memory caching
3. **Type Safety**: Full TypeScript support with IDE autocompletion
4. **Security**: Server-only configuration with no client exposure
5. **Maintainability**: Simple, explicit initialization pattern

## Trade-offs and Sacrifices

### Sacrifice 1: Immutable Configuration After Initialization
- ✅ More secure and predictable
- ✅ Better performance (no runtime mutations)
- ❌ No configuration updates after app starts (acceptable for most use cases)

### Sacrifice 2: Explicit Initialization Required
- ✅ Control over when config is loaded
- ✅ Clear error messages if not initialized
- ❌ Requires one line of setup in entry point

### Sacrifice 3: Server-Only Design
- ✅ Better security and performance
- ✅ Cleaner architecture
- ❌ Not available in client-side code (acceptable by design)

## Configuration File Benefits

### 1. Centralized Configuration
- Single source of truth in `deesse.config.ts`
- Easy to find and modify configuration
- Consistent structure across all DeesseJS projects

### 2. Environment Variable Support
- Secure handling of sensitive data
- Different configurations per environment
- Easy deployment and CI/CD integration

### 3. Build-Time Integration
- Configuration is imported as a module
- TypeScript compilation validates types
- Hot reload during development

## Security Benefits

### 1. No Client-Side Exposure
- Configuration never leaves the server
- Sensitive data (secrets, admin configs) remain protected
- No risk of client-side data leaks

### 2. Server-Only Components
- Plugin components are Server Components by default
- No JavaScript overhead for routing logic
- Better SEO and initial load performance

### 3. Build-Time Validation
- Configuration validated once at build time via `buildConfig()`
- Early detection of plugin conflicts
- Consistent configuration across all environments

## Performance Benefits

### 1. Static Generation
- Configuration pre-built at deploy time
- No runtime configuration loading
- Faster cold starts

### 2. Minimal JavaScript
- No client-side configuration management
- Server Components reduce bundle size
- Optimized for Next.js App Router

### 3. Efficient Routing
- Pre-built mapping of plugin pages
- O(1) lookup for route resolution
- No dynamic route generation overhead

## Comparison with PayloadCMS

### Similarities
- External `deesse.config.ts` file with `export default buildConfig()`
- Sequential plugin processing
- Build-time configuration resolution
- Type-safe configuration system
- Environment variable support

### Differences (Improvements)
- Simplified server/client separation
- No unnecessary complexity for unauthenticated configs
- Better integration with Next.js App Router
- More focused on core admin functionality
- Authentication is built-in, not a plugin

## Implementation Roadmap

### Phase 1: Runtime Configuration System
- Implement `getConfig()`, `initConfig()`, `refreshConfig()` functions
- Create configuration caching mechanism
- Add TypeScript interfaces and type safety

### Phase 2: External Configuration Integration
- Create `deesse.config.ts` template with `buildConfig()`
- Implement configuration file processing
- Add environment variable support

### Phase 3: Universal Access Pattern
- Update all components to use `getConfig()` instead of props
- Create plugin development framework with direct config access
- Add comprehensive error handling and validation

### Phase 4: Optimization and Tooling
- Add hot reload support for development
- Create configuration validation utilities
- Add comprehensive documentation and examples
- Performance optimization for large configurations

## Usage Examples

### Basic Configuration Access

```typescript
// In any file - components, utilities, libraries, etc.
import { getConfig } from 'deesse/config';

export function MyComponent() {
  const config = getConfig();
  return <div>{config.admin.defaultLanguage}</div>;
}
```

### Server Component Integration (Auto-Initialized)

```typescript
// /packages/admin/src/app/(deesse)/admin/layout.tsx
import config from '../../../deesse.config'; // Config is auto-initialized on import

export default function AdminLayout({ children, params }) {
  return (
    <RootLayout segments={params.segments}>
      {children}
    </RootLayout>
  );
}
```

### External Configuration File Example

```typescript
// deesse.config.ts
import { buildConfig } from 'deesse/config';
import type { Plugin } from 'deesse/plugins'; // Import Plugin type from /deesse/plugins
import { seo } from 'deesse/plugins/seo'; // Plugins imported from /deesse/plugins

// Auto-initialization - no manual initConfig() call needed!
export default buildConfig({
  secret: process.env.DEESEE_SECRET || 'your-secret-key',
  admin: { defaultLanguage: 'fr' },
  auth: {},
  plugins: [seo({ title: 'My App' })],
  // Future collections and globals can be added here:
  // collections: [myCollection],
  // globals: [myGlobal]
});

// Configuration is automatically cached when imported
```

### Plugin Page Development

```typescript
import type { Plugin } from 'deesse/plugins'; // Import Plugin type from /deesse/plugins
import { getConfig } from 'deesse/config';

// Plugin must be defined in /deesse/plugins/my-plugin/index.ts
const myPlugin = (): Plugin => {
  return {
    pages: [
      {
        path: "my-plugin/dashboard",
        component: async () => {
          const config = getConfig();
          return <MyDashboard defaultLanguage={config.admin.defaultLanguage} />;
        }
      }
    ]
  };
};

// Usage in deesse.config.ts:
// import { myPlugin } from 'deesse/plugins/my-plugin'; // Correct import path
// plugins: [myPlugin()]
```

**Plugin Import Convention**:
```typescript
// Always import plugins from /deesse/plugins/
import { seo } from 'deesse/plugins/seo';
import { analytics } from 'deesse/plugins/analytics';
import { myPlugin } from 'deesse/plugins/my-plugin';
import type { Plugin } from 'deesse/plugins'; // Import Plugin type from /deesse/plugins

// In deesse.config.ts:
export default buildConfig({
  // ... config
  plugins: [
    seo({ title: "My App" }),
    analytics({ provider: "google" }),
    myPlugin()
  ]
});
```

## Simplified Architecture Benefits

By removing `SanitizedConfig` and using a unified `Config` type, we achieve:

### 1. **Simplified Type System**
- Single `Config` type instead of multiple related types
- Less boilerplate and easier maintenance
- Future extensibility without type constraints

### 2. **Unified Processing**
- All configuration processing happens in `buildConfig()`
- Plugins, collections, and globals are processed uniformly
- Consistent behavior across all configuration elements

### 3. **Future-Proof Design**
- Optional `collections` and `globals` fields ready for future implementation
- No artificial limitations on what can be added to the configuration
- Flexible enough to handle any future requirements

### 4. **Better Developer Experience**
- No need to understand the difference between `Config` and `SanitizedConfig`
- Straightforward API: `buildConfig()` returns `Config`
- Auto-initialization works seamlessly with the unified type

This architecture provides the optimal balance of accessibility, performance, type-safety, and security for DeesseJS applications. The module cache approach eliminates prop drilling limitations while maintaining all the benefits of a server-only configuration system with simplified type management.
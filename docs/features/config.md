# Configuration

## Project Configuration File

Each DeesseJS project contains a `deesse.config.ts` file that serves as the central configuration file for the entire application. This file defines all the settings, collections, plugins, and global options for the project.

The configuration system works with a `buildConfig` function. This function takes a secret string parameter and a sequence of plugins as parameters. The content of the plugins will not be detailed for now.

The `buildConfig` function serves as the main configuration builder that accepts the application secret and initializes all the plugins that will extend the framework's functionality.

## Global Configuration Access

The configuration will be accessible globally across the entire application through a `getConfig` function, which will be available in the `/deesse/config` module. This allows you to access configuration values from any part of your codebase without having to manually pass configuration objects around.

## Module Structure

All configuration-related functionality will be centralized in the `/deesse/config` module. This includes:
- `buildConfig` function for creating the configuration
- `getConfig` function for accessing configuration globally
- Configuration types and interfaces

## Configuration Type Definition

The configuration system is built around the `Config` type, which defines the structure of the configuration object:

```typescript
type Config = {
  secret: string;
  admin: AdminConfig;
  auth: AuthConfig;
  plugins: Plugin[];
};
```

Where:
- `secret`: A string representing the application secret
- `admin`: An `AdminConfig` object for administrative settings, which includes a `defaultLanguage` field
- `auth`: An `AuthConfig` object for authentication configuration
- `plugins`: An array of `Plugin` objects for extending functionality

The `AdminConfig` type includes at least:
```typescript
type AdminConfig = {
  defaultLanguage: string;
};
```

## Configuration Example

Here's an example of a typical `deesse.config.ts` file:

```typescript
import { buildConfig } from "deesse/config";
import { seo } from "deesse/plugins/seo";
import { analytics } from "deesse/plugins/analytics";

export default buildConfig({
  secret: process.env.DEESEE_SECRET || "your-secret-key-here",
  admin: {
    defaultLanguage: "fr"
  },
  auth: {
    // Authentication configuration
  },
  plugins: [
    seo({
      title: "My Application",
      description: "A modern web application built with DeesseJS"
    }),
    analytics({
      provider: "google",
      trackingId: "G-XXXXXXXXXX"
    })
  ]
});
```

## Using Global Configuration

Once configured, you can access the configuration from anywhere in your application:

```typescript
import { getConfig } from "deesse/config";

// Access configuration values
const config = getConfig();
console.log(config.admin.defaultLanguage);
console.log(config.secret);
```

The `getConfig` function provides global access to the configuration without requiring you to pass configuration objects through multiple layers of your application.
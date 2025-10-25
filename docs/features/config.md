# Configuration

## Project Configuration File

Each DeesseJS project contains a `deesse.config.ts` file that serves as the central configuration file for the entire application. This file defines all the settings, collections, plugins, and global options for the project.

The configuration system works with a `buildConfig` function. This function takes a secret string parameter and a sequence of plugins as parameters. The content of the plugins will not be detailed for now.

The `buildConfig` function serves as the main configuration builder that accepts the application secret and initializes all the plugins that will extend the framework's functionality.

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
# Plugins System

## Plugin Capabilities

Each plugin will have the ability to:

- **Add Packages**: Plugins can add new packages to the project, extending the functionality with additional libraries and dependencies.
- **Create Dashboard Pages**: Plugins can create new pages within the admin dashboard, providing custom interfaces and functionality.
- **Add Configuration Elements**: Plugins can define new configuration options and settings that users can manage through the admin interface.
- **Support Multiple Languages**: Plugins can define different languages for their interfaces, labels, and content, enabling internationalization support across the admin dashboard.

## Plugin Dependencies

Plugins will have the capability to define dependencies on other plugins. This allows for:
- Modular functionality where plugins can build upon each other
- Ensuring proper loading order of interdependent plugins
- Managing complex plugin ecosystems with clear dependency relationships

## Plugin Type Definition

A plugin is represented by the following TypeScript type:

```typescript
interface Plugin {
  pages: Page[];
  widgets: Widget[];
}
```

## Configuration Example

The `deesse.config.ts` file will include a `plugins` field that is a list of functions. Here's an example:

```typescript
import { defineConfig } from "deesse/config";
import { seo } from "deesse/plugins/seo";
import { analytics } from "deesse/plugins/analytics";

export default defineConfig({
  plugins: [
    seo({
      title: "My Awesome Application",
      description: "A fullstack application built with DeesseJS",
      defaultImage: "/og-default.jpg",
      social: {
        twitter: "@myapp",
        facebook: "myapp"
      }
    }),
    analytics({
      provider: "google",
      trackingId: "G-XXXXXXXXXX"
    })
  ]
});
```
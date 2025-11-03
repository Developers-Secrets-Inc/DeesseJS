# DeesseJS Configuration System

## Project Configuration File

Each DeesseJS project contains a single configuration file named `deesse.config.ts` located at the root of the project. This file serves as the central configuration point for the entire application.

The file must export by default the result of the `buildConfig` function. The configuration defines global settings such as admin preferences, authentication, and plugins.

Example:

```typescript
import { buildConfig } from "deesse/config";
import { seo } from "deesse/plugins/seo";

export default buildConfig({
  admin: { defaultLanguage: "fr" },
  auth: {},
  plugins: [seo({ title: "My App" })]
});
```

## Secret Key

Each project requires a secret key defined in the `.env` file under the name `DEESSE_SECRET_KEY`.

This key is automatically generated when creating the project and must never be hardcoded. It is automatically read from the environment within the `buildConfig` function. If the key is missing, an explicit error will be thrown.

Example:

```
DEESSE_SECRET_KEY=your-generated-secret
```

## Global Alias

A global TypeScript alias `@deesse-config` is automatically added during project creation. This alias points directly to the root configuration file, allowing you to import the configuration from anywhere in your codebase without relative paths.

Example:

```typescript
import config from "@deesse-config";

console.log(config.admin.defaultLanguage);
```

This alias is added automatically to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@deesse-config": ["./deesse.config.ts"]
    }
  }
}
```

## Single Configuration Principle

DeesseJS uses a single, global configuration instance. There are no multiple configuration files (e.g., no `admin.config.ts` or `api.config.ts`).

All parts of the framework—admin, authentication, plugins, and future modules—rely on the same unified configuration object.

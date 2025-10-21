# Admin Dashboard

## Page Structure

All pages related to the admin dashboard will be in a Next.js dynamic page at `/app/(deesse)/admin/[[...segments]]`.

## Core Pages

The admin dashboard will include the following core pages:

- **Superadmin Creation Page**: A page for creating the first superadmin account when the system is initialized for the first time.
- **Login Page**: A page for administrators to sign in to their accounts.
- **Dashboard Page**: The main admin dashboard page providing an overview and quick access to all features.
- **Collections Page**: A page for managing all data collections and their elements.
- **Users Page**: A page for managing admin users and their permissions.
- **Settings Page**: A page for configuring global admin settings and preferences.
- **Profile Page**: A page for the current admin to manage their own profile information.

## Plugin Extension Capabilities

Plugins will have the ability to extend the admin dashboard in several ways:

- **New Pages**: Plugins can create additional pages within the admin dashboard, extending functionality beyond the core pages.
- **Settings Sections**: Plugins can define new sections within the settings page, allowing for plugin-specific configurations.
- **Dashboard Components**: The admin dashboard homepage will feature an array of highlighted components. Each plugin will have the ability to create highlighted components, similar to widgets that can be loaded into this page to provide quick access to plugin-specific features and data.

## Plugins Management

We will also include a **Plugins Page** that will fetch all plugins from the online registry. For security reasons, plugins cannot be installed directly from the plugins page, but users will be able to copy the installation command by clicking on a plugin, which they can then run in their terminal to safely install the plugin.
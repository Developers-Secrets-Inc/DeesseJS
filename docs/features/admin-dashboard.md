# Admin Dashboard

## Page Structure

All pages related to the admin dashboard will be in a Next.js dynamic page at `/app/(deesse)/admin/[[...segments]]`.

## Core Pages

The admin dashboard will include the following core pages:

- **First User Page (`/first-user`)**: A special page accessible only in local development when no admin exists in the database yet. Used for creating the first superadmin account.
- **Login Page (`/login`)**: A page for administrators to sign in to their accounts.
- **Dashboard Page**: The main admin dashboard page providing an overview and quick access to all features.
- **Collections Page**: A page for managing all data collections and their elements.
- **Users Page**: A page for managing admin users and their permissions.
- **Settings Page**: A page for configuring global admin settings and preferences.
- **Profile Page**: A page for the current admin to manage their own profile information.

## CLI Configuration

- **CLI Setup Option**: During project initialization, users will have the option to create a superadmin account through the CLI
- **Interactive Setup**: The CLI will prompt for admin credentials during project setup if no admin exists
- **Configuration Integration**: Admin setup will be integrated into the deesse.config.ts file configuration process
- **Production Ready**: CLI setup ensures a production-ready admin account from the start

## Layout and Security

### RootLayout Component
The admin dashboard will feature a `RootLayout` component that provides automatic security and redirection:

- **Automatic Redirection**: Non-admin users will be automatically redirected away from admin pages
- **Route Protection**: All admin pages are protected and require authentication
- **Development Access**: The `/first-user` page is only accessible during local development when no admin exists
- **Seamless Integration**: RootLayout handles authentication state and ensures only authorized users can access admin functionality

### Route Handling and Redirection Logic
The system implements intelligent route handling based on database state:

**Redirection Behavior**:
- When user navigates to `/admin`, the system automatically redirects to the appropriate page:
  - If an admin exists in database → redirect to `/admin/login`
  - If no admin exists in database → redirect to `/admin/first-user`

### Component Architecture

**Page Components (Conditional Rendering)**:
- **Login Component**: Renders login form with email and password fields
- **FirstUser Component**: Renders first user creation form with name, email, password, and confirm password fields
- **Dashboard Component**: Main admin interface (only when authenticated)
- All components are rendered conditionally based on authentication state and database status

### Server Functions

**Server-side Functions**:
1. **`hasAdmin()`**: Server function that checks if any admin exists in the database
   - Returns boolean indicating admin presence
   - Used by RootLayout for initial redirection logic
   - Perform database query to admin users table

2. **`createFirstAdmin(data)`**: Server function that creates the first admin account
   - Accepts typed user data: `{name: string, email: string, password: string, confirmPassword: string}`
   - Validates password confirmation matches password
   - Creates admin user with appropriate permissions
   - Returns success/error response with user info

### Server-Client Flow

**Authentication Flow**:
1. User visits `/admin`
2. RootLayout calls `hasAdmin()` server function
3. Based on response, redirects to appropriate sub-route
4. User fills respective form component
5. First-user flow uses `createFirstAdmin()` server function
6. Login flow uses authentication system
7. Upon successful auth, user gains access to main dashboard

## Plugin Extension Capabilities

Plugins will have the ability to extend the admin dashboard in several ways:

- **New Pages**: Plugins can create additional pages within the admin dashboard, extending functionality beyond the core pages.
- **Settings Sections**: Plugins can define new sections within the settings page, allowing for plugin-specific configurations.
- **Dashboard Components**: The admin dashboard homepage will feature an array of highlighted components. Each plugin will have the ability to create highlighted components, similar to widgets that can be loaded into this page to provide quick access to plugin-specific features and data.

## Plugins Management

We will also include a **Plugins Page** that will fetch all plugins from the online registry. For security reasons, plugins cannot be installed directly from the plugins page, but users will be able to copy the installation command by clicking on a plugin, which they can then run in their terminal to safely install the plugin.
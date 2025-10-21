# DeesseJS Framework

## Project Vision

The primary goal of this project is to define a comprehensive set of primitive building blocks to establish core functionality, with the ultimate objective of making everything work through a plugin system. Every new feature that will be added will be in the form of a plugin.

## Core Architecture

The framework will be primarily based on a *completely modular admin dashboard*. Users will have access to an initial set of building blocks within the dashboard, but they'll be able to extend it as much as they want through a *plugin system* that we'll develop right after.

The framework will include a *native functional package* with a comprehensive set of primitives such as *Result*, *Option*, *Maybe*, and *Either* to provide robust error handling and data manipulation patterns.

When accessing the admin dashboard for the first time, users will be prompted to create a *superadmin account*. This means we'll also have an *extremely powerful admin system* that we'll develop in the future.

## Admin System & Authentication

The framework will include a *comprehensive admin user management system* built on better-auth. This system will provide full control over user accounts with features like creating users, managing roles, banning/unbanning users, session management, and user impersonation for debugging purposes.

The admin system features a *highly flexible permission system* where developers can define custom roles and granular permissions to fit their specific needs. Users can have multiple roles with different access levels across various resources.

## Technical Stack & UI

The framework will use *TailwindCSS* for styling, allowing users to customize the dashboard using their application's theme. Internally, the dashboard will utilize *shadcn/ui* components for all UI elements.

Users can access the admin dashboard from `/admin` in their project's navigation bar, of course they'll have the ability to modify this path as they wish.

## Plugin System

The framework will feature a *powerful plugin system* that allows any user to extend their project with new functionality. Users can add new packages directly into their code and create new pages within the admin dashboard with custom content and features.

From our side, we'll develop a *comprehensive set of dashboard components* that users can freely use to build their custom pages. Users will also have the ability to define settings and configurations for their plugins.

In the future, we'll develop a *plugin registry* where users can register new plugins. We'll be able to categorize plugins as *official*, *trusted*, or *community* plugins. Anyone will have the ability to create and share plugins.

## Configuration

All project configuration will be present in a *deesse.config.json* file that will centralize all framework settings and customization options.

## User System & Customer Integration

We'll develop a *native authentication and user management system* built on better-auth, essentially creating a local version of Clerk. This system will include comprehensive user management and payment processing capabilities.

Additionally, we'll develop a *feature template system* where users can run commands in the terminal and have multiple pages automatically created to implement specific functionality directly. For example, running `npx deesse-cli add auth` would automatically create pages, email templates, and related components for authentication.

We'll also provide a *direct template system* that allows users to initialize a project with a set of pre-built, ready-to-use features, significantly reducing setup time and providing immediate value.

Each user will have a *role* and a set of *permissions* within the application, along with individual *preferences* stored for the application. Users will have a *personal profile* where they can modify their profile picture, name, email, password, and other personal information.

The most important innovation is that we'll implement a *unified system where users and customers are not distinct entities but rather an evolution of the same concept*. Each user will have a *customer status* that determines what they pay for and what advantages they receive, creating a seamless transition between free users and paying customers.

## Database & Functions

The project provides two types of functions that give direct access to the database through a context-based system. The first are *queries* that allow retrieving data. The second are *mutations* that allow modifying data.

Both of these functions will take as their first parameter a *zod object* and as their second parameter an *async handler function*. This handler function takes as its first parameter an *injected context* and as its second parameter the *args in their raw form*.

The mutations will also return a list of *client keys to revalidate*, and we'll add a specific hook that will automatically revalidate these keys, creating a sort of *reactive interface*.

### Examples

**Query example:**
```typescript
query({
  id: z.string()
}, async (ctx, args) => {
  ...
});
```

**Mutation example:**
```typescript
mutation({
  data: z.object({
    title: z.string(),
    content: z.string()
  })
}, async (ctx, args) => {
  ...
});
```

## Data Collections

Users will have the ability to define data tables in the code in the form of *collections*, similar to PayloadCMS.

At the admin interface level, there will be a */collections* page in the admin dashboard where all collections are displayed. Each collection has a set of *elements* that are the database entries. When clicking on a specific element, users can *edit and modify* it directly.

The collections system will include *granular permissions* to define whether the current admin can modify a specific element or a specific field within an element, providing fine-grained control over data access and editing capabilities.

## Authentication Components

The framework will provide *authentication components* to protect routes based on whether users are logged in or not. There will also be *specific components to hide parts of a page* based on user status, allowing developers to show or hide content depending on user roles, permissions, or customer status.
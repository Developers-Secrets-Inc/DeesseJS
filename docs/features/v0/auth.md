# Authentication Features

## Better Auth Configuration

The system provides a comprehensive Better Auth configuration integrated directly into the DeesseJS framework.

### Auth Configuration

**deesse.config.ts**:
- Include an `auth` object in your DeesseJS configuration for Better Auth setup
- This object will contain most of the Better Auth configuration options
- Provides a centralized location for all authentication-related settings


### Auth Route Handler

**Server Route**: `/app/api/auth/[...all]/route.ts`
- Next.js dynamic route handler for Better Auth API endpoints
- Automatically handles all authentication-related API calls (login, logout, session, etc.)
- Uses Better Auth's built-in route handling with Next.js middleware

```typescript
// Next.js API route handler
import { handler } from "@deesse/auth";

// The handler function provides both POST and GET methods
export { POST, GET } = handler();
```

### Auth Configuration Export

**Configuration Access**: `import { auth } from "@deesse/auth"`
- Better Auth configuration object can be imported from `@deesse/auth`
- Provides the complete auth configuration for server-side setup
- Database adapter is configured based on the database configuration from `deesse.config.ts`
- Additional Better Auth options are provided from the project's auth configuration object
- Admin plugin is included by default to support admin dashboard functionality

### Integration Example

```typescript
// deesse.config.ts
import { buildConfig } from "deesse/config";
import { auth } from "@deesse/auth";

export default buildConfig({
  secret: process.env.DEESEE_SECRET || "your-secret-key-here",
  admin: {
    defaultLanguage: "fr"
  },
  auth: {
    // Better Auth configuration options
    providers: [
      // Configure authentication providers (Google, GitHub, email/password, etc.)
    ],
    session: {
      // Session configuration
    },
    security: {
      // Security settings
    }
    // Other Better Auth options...
  },
  plugins: [
    // Other plugins...
  ]
});
```

```typescript
// Server-side usage
import { auth } from "@deesse/auth";

// The auth object contains the complete Better Auth configuration
// Database adapter is configured based on deesse.config.ts database settings
// Auth options are merged from deesse.config.ts auth section
// Admin plugin is automatically included for admin dashboard functionality

// Example: Initialize Better Auth in your application
export { auth } from "@deesse/auth";

// The auth object is ready to use with all configuration applied
// Includes admin plugin for user management and admin dashboard features
```



```typescript
// Admin client usage (for admin dashboard)
import { authClient } from "@deesse/auth";

// Admin functions are automatically available through authClient
const {
  admin,
  createUser,
  banUser,
  unbanUser,
  impersonateUser,
  // other admin functions...
} = authClient.admin;

// Example admin dashboard usage
async function handleUserBan(userId: string) {
  await authClient.admin.banUser(userId);
}
```

```typescript
// Next.js API route handler
import { handler } from "@deesse/auth";

export { handler } from "@deesse/auth";

// The handler function automatically exports POST and GET methods
// No need to manually configure toNextJsHandler
```

```typescript
// Client component usage
import { authClient } from "@deesse/auth"

// Use authClient for client-side authentication
const { user, signIn, signOut } = authClient

// Example in a React component
function UserProfile() {
  return (
    <div>
      {authClient.user ? (
        <button onClick={authClient.signOut}>Sign Out</button>
      ) : (
        <button onClick={() => authClient.signIn("email")}>Sign In</button>
      )}
    </div>
  )
}
```

## Better Auth Integration

The system uses Better Auth for authentication, providing a modern, secure, and extensible authentication solution. Better Auth is seamlessly integrated into the database operations through the context object.

### Session Access in Database Operations

**Direct Session Access**:
- Better Auth integrates seamlessly with the database functions
- The context object `ctx` automatically contains a `session` property: `ctx.session`
- No need to call `auth.api.getSession()` manually - the session is automatically available
- Session data includes user information, roles, and authentication state

### Usage Pattern in Database Functions

```typescript
// In a mutation or query handler - direct session access
export const getUsers = query(
  {}, // Empty args schema for this example
  async (ctx) => {
    // Session is directly available via ctx.session
    const session = ctx.session

    // Session contains user data and authentication state
    if (session?.user) {
      // User is authenticated
      return {
        authenticated: true,
        user: session.user,
        roles: session.user.roles || []
      }
    } else {
      // User is not authenticated
      return {
        authenticated: false
      }
    }
  }
)

// Example mutation with session-based authorization
export const updateUser = mutation(
  {
    userId: zod.number(),
    data: zod.object({
      name: zod.string().optional(),
      email: zod.string().email().optional()
    })
  },
  async (ctx, args) => {
    // Direct session access via ctx.session
    const session = ctx.session

    // Check if user is authenticated and authorized
    if (!session?.user || session.user.id !== args.userId) {
      throw new Error("Unauthorized: You can only update your own profile")
    }

    // Perform update with authorization
    const updated = await db.users.update({
      where: { id: args.userId },
      data: args.data
    })

    return { success: true, data: updated }
  }
)
```

### Session Properties

The session object contains:
- **user**: User object with ID, email, name, and roles
- **expires**: Session expiration timestamp
- **token**: Access token for API calls
- **permissions**: Array of user permissions

### Integration Features

- **Automatic Middleware**: Better Auth automatically handles session validation
- **Cookie Management**: Secure session cookies with proper expiration
- **Multi-device Support**: Sessions work across web and mobile
- **Security**: Built-in protection against common authentication vulnerabilities

### Database Integration

Better Auth integrates seamlessly with the database functions:
- **ctx.session**: Always contains current user session if authenticated
- **Role-based Access**: Session roles are used for permission validation
- **Session Validation**: Automatic session verification on every operation
- **Logout Support**: Built-in logout functionality that clears sessions

## Role-based Access Control

Each user will have a role that defines a set of permissions. The entire role and permissions system can be managed directly from the admin dashboard where administrators can define new roles and create custom permissions.

## Role Management

- **Custom Roles**: Create and define custom roles with specific permission sets
- **Dynamic Permissions**: Freely define new permissions without system limitations
- **User Assignment**: Assign roles to users with one-to-many relationships
- **Role Hierarchy**: Support for role inheritance and permission cascading
- **Real-time Updates**: Roles and permissions changes are immediately effective across the platform

## Admin Dashboard Integration

- **Role Management Interface**: Complete interface for creating, editing, and managing roles
- **Permission Builder**: Tool for building granular permission sets
- **Bulk Operations**: Efficient bulk role assignment and management
- **Audit Logs**: Track role and permission changes with comprehensive logging
- **User Overview**: View which users have which roles and monitor permission usage
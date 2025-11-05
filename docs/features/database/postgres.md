# PostgreSQL Configuration

## Overview

DeesseJS supports PostgreSQL as its primary database provider using Drizzle ORM for efficient database operations.

## Basic Configuration

### Using the `postgres` Helper

```typescript
import { buildConfig, postgres } from "deesse";

export default buildConfig({
  // ... other config
  db: postgres({
    connectionString: process.env.DATABASE_URL!,
    pool: {
      min: 2,
      max: 10,
      idleTimeoutMillis: 30000
    },
    casing: 'snake_case',
    ssl: false
  }),
  collections: [
    // ... your collections
  ]
});
```

## Configuration Options

### Required Parameters

#### `connectionString`
- **Type**: `string`
- **Description**: PostgreSQL connection string
- **Required**: Yes
- **Example**: `"postgresql://user:pass@localhost:5432/database"`

### Optional Pool Configuration

#### `pool.min`
- **Type**: `number`
- **Default**: `2`
- **Description**: Minimum number of connections in the pool

#### `pool.max`
- **Type**: `number`
- **Default**: `10`
- **Description**: Maximum number of connections in the pool

#### `pool.idleTimeoutMillis`
- **Type**: `number`
- **Default**: `30000`
- **Description**: How long a connection can be idle before being removed

### Optional Database Options

#### `casing`
- **Type**: `'snake_case' | 'camel_case'`
- **Default**: `'snake_case'`
- **Description**: Database column naming convention

#### `ssl`
- **Type**: `boolean`
- **Default**: `false` (development), `true` (production)
- **Description**: Enable SSL connections

#### `schema`
- **Type**: `string`
- **Default**: `'public'`
- **Description**: Database schema name

## Environment-Specific Configurations

### Development
```typescript
db: postgres({
  connectionString: 'postgresql://dev:dev@localhost:5432/devdb',
  min: 1,
  max: 5,
  idleTimeoutMillis: 1000,
  casing: 'snake_case',
  ssl: false
})
```

### Production
```typescript
db: postgres({
  connectionString: process.env.DATABASE_URL!,
  min: 5,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  casing: 'snake_case',
  ssl: true,
  schema: 'public'
})
```

## Connection String Format

### Standard Format
```
postgresql://username:password@host:port/database
```

### SSL Support
```
postgresql://username:password@host:port/database?sslmode=require
```

### Connection Parameters
```typescript
db: postgres({
  connectionString: 'postgresql://user:pass@localhost:5432/db',
  // Alternative connection parameters
  host: 'localhost',
  port: 5432,
  user: 'username',
  password: 'password',
  database: 'dbname'
})
```

## Environment Variables

### Required
```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/database"
```

### Optional
```bash
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_IDLE_TIMEOUT=30000
DB_SSL=true
```

## Best Practices

### Development
- Use small pool sizes (1-5 connections)
- Disable SSL for local development
- Enable `autoSync` for schema synchronization
- Use simple connection strings

### Production
- Use larger pool sizes (10-20+ connections)
- Enable SSL for security
- Set appropriate timeouts
- Use environment variables for credentials

### Security
- Never commit database credentials to version control
- Use environment-specific configurations
- Enable SSL in production
- Use read-only replicas for read operations

## Troubleshooting

### Common Issues

#### Connection Timeouts
```typescript
db: postgres({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000, // Increase timeout
  idleTimeoutMillis: 60000        // Increase idle timeout
})
```

#### Pool Exhaustion
```typescript
db: postgres({
  connectionString: process.env.DATABASE_URL,
  min: 5,    // Increase min connections
  max: 50    // Increase max connections
})
```

#### SSL Issues
```typescript
db: postgres({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // For self-signed certificates
  }
})
```

## Migration Support

The system automatically handles database schema migrations when `autoSync` is enabled:

```typescript
export default buildConfig({
  environment: 'development', // Auto-sync enabled by default
  autoSync: true,            // Or explicitly set
  db: postgres({ /* ... */ }),
  // Collections will be automatically synchronized
});
```

Note: `autoSync` is disabled in production for safety. Use `drizzle-kit` for production migrations.
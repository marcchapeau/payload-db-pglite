# payload-db-pglite

[![npm version](https://img.shields.io/npm/v/payload-db-pglite.svg)](https://www.npmjs.com/package/payload-db-pglite)

A [PGlite](https://github.com/electric-sql/pglite) database adapter for [PayloadCMS](https://payloadcms.com).

PGlite is a WASM Postgres build that runs in Node.js, Bun, and the browser, with no need to install any other dependencies. It's perfect for development, testing, and edge deployments.

## Features

- 🚀 **Zero-config**: No PostgreSQL server required
- 🔄 **Drop-in replacement**: Compatible with existing Payload PostgreSQL workflows
- 🧠 **In-memory option**: Perfect for testing and development
- 📁 **File-based storage**: Persistent database stored in your project
- ⚡ **Fast**: Runs directly in your Node.js process
- 🌐 **Edge-ready**: Works in serverless and edge environments

## Installation

```bash
npm install payload-db-pglite @electric-sql/pglite
```

## Quick Start

### 1. Configure Payload

Update your `payload.config.ts`:

```ts
import { buildConfig } from 'payload'
import { pgliteAdapter } from 'payload-db-pglite'

export default buildConfig({
  // ... other config
  db: pgliteAdapter({
    dataDir: './database', // or 'memory://' for in-memory
  }),
})
```

### 2. Configure Next.js (if using)

Add to your `next.config.mjs`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@electric-sql/pglite'],
}

export default nextConfig
```

### 3. Start developing

```bash
npm run dev
```

That's it! PGlite will automatically create and manage your database.

## Transactions

Transactions are **disabled by default** because PGlite uses a single connection.
Real transactions on a single connection would cause deadlocks. If you understand
the implications, you can opt in:

```ts
pgliteAdapter({
  dataDir: './database',
  transactionOptions: { isolationLevel: 'read committed' },
})
```

## Configuration Options

```ts
interface PGliteAdapterArgs {
  /** Directory where PGlite stores its data. Use 'memory://' for in-memory. @default './pglite-data' */
  dataDir?: string
  /** ID type to use for documents. @default 'serial' */
  idType?: 'serial' | 'uuid'
  /** Enable automatic schema push in development. @default true */
  push?: boolean
  /** Store blocks as JSON instead of relational structure. @default false */
  blocksAsJSON?: boolean
  /** PostgreSQL extensions to enable. @default [] */
  extensions?: string[]
  /** The schema name to use. */
  schemaName?: string
  /** Migration directory path. */
  migrationDir?: string
  /** Production migrations. */
  prodMigrations?: Array<{ name: string; up: Function; down: Function }>
  /** Transform schema before/after initialization. */
  beforeSchemaInit?: PostgresSchemaHook[]
  afterSchemaInit?: PostgresSchemaHook[]
  /** Table name suffixes. */
  localesSuffix?: string
  relationshipsSuffix?: string
  versionsSuffix?: string
  /** Transaction configuration. Pass false to disable (default). */
  transactionOptions?: false | PgTransactionConfig
  /** Drizzle logger. */
  logger?: DrizzleConfig['logger']
}
```

## Usage Examples

### Development with File Storage

```ts
export default buildConfig({
  db: pgliteAdapter({
    dataDir: './database',
    push: true,
  }),
})
```

### Testing with In-Memory Database

```ts
export default buildConfig({
  db: pgliteAdapter({
    dataDir: 'memory://',
    push: true,
  }),
})
```

### Production with Migrations

```ts
export default buildConfig({
  db: pgliteAdapter({
    dataDir: process.env.DATABASE_DIR || './database',
    push: false,
    prodMigrations: [
      // Your production migrations
    ],
  }),
})
```

## Deployment

### Vercel

```ts
export default buildConfig({
  db: pgliteAdapter({
    dataDir: '/tmp/database',
  }),
})
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN mkdir -p /app/database
CMD ["npm", "start"]
```

## Development Workflow

1. **Start fresh**: Delete the `dataDir` folder to reset your database
2. **Schema changes**: Enable `push: true` for automatic schema updates in development
3. **Migrations**: Use `payload migrate:create` to generate migration files
4. **Production**: Set `push: false` and use `prodMigrations` for production deployments

## Troubleshooting

### "Module not found" errors

Make sure to add `@electric-sql/pglite` to `serverExternalPackages` in your Next.js config.

### Database locked errors

PGlite databases can only be opened by one process at a time. Make sure you're not running multiple instances pointing to the same `dataDir`.

### Performance considerations

- In-memory databases (`memory://`) are fastest but don't persist data
- File-based databases are slightly slower but provide persistence
- PGlite is single-threaded, so it's best for small to medium applications

## Contributing

Contributions are welcome! Please feel free to submit a [Pull Request](https://github.com/marcchapeau/payload-db-pglite/pulls).

## License

MIT License — see [LICENSE](./LICENSE) file for details.

## Related

- [PGlite](https://github.com/electric-sql/pglite) — WASM PostgreSQL build
- [PayloadCMS](https://payloadcms.com) — Headless CMS
- [@payloadcms/db-postgres](https://www.npmjs.com/package/@payloadcms/db-postgres) — Official PostgreSQL adapter

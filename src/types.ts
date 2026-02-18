import type { PGlite } from '@electric-sql/pglite'
import type {
  BasePostgresAdapter,
  MigrateDownArgs,
  MigrateUpArgs,
  PostgresSchemaHook,
} from '@payloadcms/drizzle/postgres'
import type { DrizzleConfig } from 'drizzle-orm'
import type { PgTransactionConfig } from 'drizzle-orm/pg-core'

/**
 * Configuration options for the PGlite database adapter.
 */
export interface PGliteAdapterArgs {
  afterSchemaInit?: PostgresSchemaHook[]
  allowIDOnCreate?: boolean
  beforeSchemaInit?: PostgresSchemaHook[]
  blocksAsJSON?: boolean
  /** Directory where PGlite stores its data. Use `'memory://'` for in-memory. */
  dataDir?: string
  extensions?: string[]
  generateSchemaOutputFile?: string
  idType?: 'serial' | 'uuid'
  localesSuffix?: string
  logger?: DrizzleConfig['logger']
  migrationDir?: string
  prodMigrations?: {
    down: (args: MigrateDownArgs) => Promise<void>
    name: string
    up: (args: MigrateUpArgs) => Promise<void>
  }[]
  push?: boolean
  relationshipsSuffix?: string
  schemaName?: string
  tablesFilter?: string[]
  /**
   * Transaction configuration. Defaults to `false` because PGlite is
   * single-connection and real transactions would cause deadlocks.
   */
  transactionOptions?: false | PgTransactionConfig
  versionsSuffix?: string
}

/**
 * PGlite adapter instance type.
 * Extends the base Postgres adapter with PGlite-specific fields.
 */
export type PGliteAdapter = {
  pglite: PGlite
  pgliteDataDir: string
} & BasePostgresAdapter

/** Internal connect options — not part of the public API. */
export interface ConnectOptions {
  hotReload?: boolean
}

import {
  beginTransaction,
  buildCreateMigration,
  commitTransaction,
  count,
  countGlobalVersions,
  countVersions,
  create,
  createBlocksToJsonMigrator,
  createGlobal,
  createGlobalVersion,
  createSchemaGenerator,
  createVersion,
  deleteMany,
  deleteOne,
  deleteVersions,
  find,
  findDistinct,
  findGlobal,
  findGlobalVersions,
  findOne,
  findVersions,
  migrate,
  migrateDown,
  migrateFresh,
  migrateRefresh,
  migrateReset,
  migrateStatus,
  operatorMap,
  queryDrafts,
  rollbackTransaction,
  updateGlobal,
  updateGlobalVersion,
  updateJobs,
  updateMany,
  updateOne,
  updateVersion,
  upsert,
} from '@payloadcms/drizzle'

import {
  columnToCodeConverter,
  countDistinct,
  createDatabase,
  createExtensions,
  createJSONQuery,
  defaultDrizzleSnapshot,
  deleteWhere,
  dropDatabase,
  execute,
  init,
  insert,
  requireDrizzleKit,
} from '@payloadcms/drizzle/postgres'

import { pgEnum, pgSchema, pgTable } from 'drizzle-orm/pg-core'
import { createDatabaseAdapter, defaultBeginTransaction, findMigrationDir } from 'payload'
import { fileURLToPath } from 'url'

import { connect } from './connect.js'
import { destroy } from './destroy.js'
import type { PGliteAdapterArgs, PGliteAdapter } from './types.js'

const filename = fileURLToPath(import.meta.url)

/**
 * Create a PGlite database adapter for PayloadCMS.
 */
export function pgliteAdapter(args: PGliteAdapterArgs = {}) {
  const postgresIDType = args.idType || 'serial'
  const payloadIDType = postgresIDType === 'serial' ? 'number' : 'text'
  const allowIDOnCreate = args.allowIDOnCreate ?? false

  // PGlite is single-connection: default to disabled transactions to avoid deadlocks.
  // Users can still opt-in by passing a PgTransactionConfig value.
  const effectiveTransactionOptions = args.transactionOptions ?? false

  function adapter({ payload }: { payload: any }) {
    const migrationDir = findMigrationDir(args.migrationDir)

    let resolveInitializing: (() => void) | undefined
    let rejectInitializing: (() => void) | undefined
    let adapterSchema: any

    const initializing = new Promise<void>((res, rej) => {
      resolveInitializing = res
      rejectInitializing = rej
    })

    if (args.schemaName) {
      adapterSchema = pgSchema(args.schemaName)
    } else {
      adapterSchema = {
        enum: pgEnum,
        table: pgTable,
      }
    }

    const extensions = (args.extensions ?? []).reduce(
      (acc, name) => {
        acc[name] = true
        return acc
      },
      {} as Record<string, boolean>,
    )

    const sanitizeStatements = ({
      sqlExecute,
      statements,
    }: {
      sqlExecute: string
      statements: string[]
    }) => {
      return `${sqlExecute}\n ${statements.join('\n')}\`)`
    }

    const executeMethod = 'execute'

    const adapter = (createDatabaseAdapter as any)({
      name: 'postgres',
      afterSchemaInit: args.afterSchemaInit ?? [],
      allowIDOnCreate,
      beforeSchemaInit: args.beforeSchemaInit ?? [],
      blocksAsJSON: args.blocksAsJSON ?? false,
      createDatabase,
      createExtensions,
      createMigration: buildCreateMigration({
        executeMethod,
        filename,
        sanitizeStatements,
      }),
      defaultDrizzleSnapshot,
      disableCreateDatabase: true,
      drizzle: undefined as any,
      enums: {},
      extensions,
      features: { json: true },
      fieldConstraints: {},
      findDistinct,
      generateSchema: createSchemaGenerator({
        columnToCodeConverter,
        corePackageSuffix: 'pg-core',
        defaultOutputFile: args.generateSchemaOutputFile,
        enumImport: 'pgEnum',
        schemaImport: 'pgSchema',
        tableImport: 'pgTable',
      }),
      idType: postgresIDType,
      initializing,
      localesSuffix: args.localesSuffix || '_locales',
      logger: args.logger,
      operators: operatorMap,
      pgSchema: adapterSchema,

      // PGlite-specific
      pglite: undefined as any,
      pgliteDataDir: args.dataDir || './pglite-data',

      prodMigrations: args.prodMigrations,
      push: args.push as any,
      relations: {},
      relationshipsSuffix: args.relationshipsSuffix || '_rels',
      schema: {},
      schemaName: args.schemaName,
      sessions: {},
      tableNameMap: new Map(),
      tables: {},
      tablesFilter: args.tablesFilter,
      transactionOptions: effectiveTransactionOptions,
      versionsSuffix: args.versionsSuffix || '_v',

      // Conditionally enable real transactions
      beginTransaction:
        effectiveTransactionOptions === false ? defaultBeginTransaction() : beginTransaction,
      commitTransaction,
      connect,
      count,
      countDistinct,
      countGlobalVersions,
      countVersions,
      create,
      createGlobal,
      createGlobalVersion,
      createJSONQuery,
      createVersion,
      defaultIDType: payloadIDType,
      deleteMany,
      deleteOne,
      deleteVersions,
      deleteWhere,
      destroy,
      dropDatabase,
      execute,
      find,
      findGlobal,
      findGlobalVersions,
      findOne,
      findVersions,
      foreignKeys: new Set(),
      indexes: new Set(),
      init,
      insert,
      migrate,
      migrateDown,
      migrateFresh,
      migrateRefresh,
      migrateReset,
      migrateStatus,
      migrationDir,
      packageName: 'payload-db-pglite',
      payload,
      queryDrafts,
      rawRelations: {},
      rawTables: {},
      updateJobs,
      rejectInitializing: rejectInitializing!,
      requireDrizzleKit,
      resolveInitializing: resolveInitializing!,
      rollbackTransaction,
      updateGlobal,
      updateGlobalVersion,
      updateMany,
      updateOne,
      updateVersion,
      upsert,
    }) as unknown as PGliteAdapter

    ;(adapter as any).blocksToJsonMigrator = createBlocksToJsonMigrator({
      adapter: adapter as any,
      executeMethod,
      sanitizeStatements,
    })

    return adapter
  }

  return {
    name: 'postgres',
    allowIDOnCreate,
    defaultIDType: payloadIDType,
    init: adapter,
  }
}

// Re-exports
export { sql } from 'drizzle-orm'
export type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/drizzle/postgres'
export type { PGliteAdapterArgs, PGliteAdapter } from './types.js'

import { pushDevSchema } from '@payloadcms/drizzle'
import { drizzle } from 'drizzle-orm/pglite'
import { PGlite } from '@electric-sql/pglite'
import path from 'path'
import type { PGliteAdapter, ConnectOptions } from './types.js'

/**
 * Connect to PGlite database.
 * Initializes the PGlite instance and sets up Drizzle ORM.
 */
export const connect: PGliteAdapter['connect'] = async function connect(
  this: PGliteAdapter,
  options: ConnectOptions = { hotReload: false },
): Promise<void> {
  const { hotReload } = options

  try {
    if (!this.pglite) {
      const useMemory =
        !this.pgliteDataDir ||
        this.pgliteDataDir === ':memory:' ||
        this.pgliteDataDir === 'memory://'

      const dataDir = useMemory
        ? 'memory://'
        : path.resolve(process.cwd(), this.pgliteDataDir || './pglite-data')

      this.pglite = new PGlite(dataDir)
      await this.pglite.waitReady
    }

    const logger = this.logger || false

    this.drizzle = drizzle({
      client: this.pglite,
      logger,
      schema: this.schema,
    })

    if (!hotReload) {
      if (process.env.PAYLOAD_DROP_DATABASE === 'true') {
        this.payload.logger.info(
          `---- DROPPING TABLES SCHEMA(${this.schemaName || 'public'}) ----`,
        )
        await this.dropDatabase({ adapter: this })
        this.payload.logger.info('---- DROPPED TABLES ----')
      }
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))

    this.payload.logger.error({
      err,
      msg: `Error: cannot connect to PGlite. Details: ${err.message}`,
    })

    if (typeof this.rejectInitializing === 'function') {
      this.rejectInitializing()
    }

    throw new Error(`Error: cannot connect to PGlite: ${err.message}`)
  }

  await this.createExtensions()

  // Push schema in development mode
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.PAYLOAD_MIGRATING !== 'true' &&
    this.push !== false
  ) {
    await pushDevSchema(this as any)
  }

  if (typeof this.resolveInitializing === 'function') {
    this.resolveInitializing()
  }

  // Run production migrations if configured
  if (process.env.NODE_ENV === 'production' && this.prodMigrations) {
    await this.migrate({ migrations: this.prodMigrations })
  }
}

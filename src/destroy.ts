import type { PGliteAdapter } from './types.js'

/**
 * Destroy the PGlite database connection and reset adapter state.
 */
export const destroy: PGliteAdapter['destroy'] = async function destroy(
  this: PGliteAdapter,
): Promise<void> {
  if (this.pglite) {
    try {
      await this.pglite.close()
    } catch {
      // Ignore close errors — PGlite may already be closed
    }
  }

  if (this.enums) {
    this.enums = {}
  }
  this.schema = {}
  this.tables = {}
  this.relations = {}
  this.fieldConstraints = {}
  this.drizzle = undefined as any
  this.pglite = undefined as any

  this.initializing = new Promise<void>((res, rej) => {
    this.resolveInitializing = res
    this.rejectInitializing = rej
  })
}

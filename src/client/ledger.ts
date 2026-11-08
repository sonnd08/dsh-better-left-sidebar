/**
 * Replaces a shipped single-slot entry without changing it. The plugin registers a second entry at a lower priority,
 * which the renderer selects. DSH does not have a published way to do this, so this module reads the slot ledger.
 * @module dsh-better-left-sidebar/client/ledger
 */

/** Priority of the replacement entries; the renderer selects the lowest number. */
const SHADOW_PRIORITY = -100

/** One registration as the slot ledger stores it. */
export interface LedgerEntry {
  component: unknown
  readonly options?: { readonly priority?: number | undefined } | undefined
  readonly children?: Readonly<Record<string, unknown>> | undefined
  readonly inject?: unknown
  readonly store?: unknown
  readonly locale?: string | undefined
}

/** The slot ledger surface that this module needs (ctx.slots). */
export interface LedgerSlots {
  entries(key: string): readonly LedgerEntry[]
  subscribe(key: string, listener: () => void): () => void
  register(options: Record<string, unknown>, component: never): () => void
}

/**
 * Give the replacement entry the child slots of the shipped entry.
 *
 * The ledger refuses a second declaration of a child slot, and it releases each child that it can list when an entry
 * goes away. The shipped entry owns these children, so the ledger must not list them for the replacement. The table is
 * not enumerable for that reason. The renderer and other plugins read a child by its key, so they still find it.
 * A chain or session child needs an enumerable table; the sidebar slots have none.
 * @param shipped - child table of the shipped entry.
 * @returns the table to register.
 */
function unlistedChildren(shipped: Readonly<Record<string, unknown>>): Record<string, unknown> {
  const table: Record<string, unknown> = {}
  for (const key of Object.keys(shipped)) Object.defineProperty(table, key, { value: shipped[key], enumerable: false })
  return table
}

/**
 * Show `component` in a single slot instead of its shipped entry, and follow that entry when it is registered again.
 * @param slots - the slot ledger.
 * @param name - slot name.
 * @param component - the replacement component. It gets the props of the shipped entry.
 * @param locale - dictionary namespace of its `t` prop; the namespace of the shipped entry when undefined.
 * @returns a function that removes the replacement.
 */
export function shadowSlot(slots: LedgerSlots, name: string, component: unknown, locale?: string): () => void {
  let source: LedgerEntry | undefined
  let dispose: (() => void) | undefined
  // A registration notifies this slot's listeners synchronously, and this function is one of them.
  let busy = false
  const remove = (): void => {
    dispose?.()
    dispose = undefined
    source = undefined
  }
  const sync = (): void => {
    if (busy) return
    const shipped = slots.entries(name).find(entry => (entry.options?.priority ?? 0) > SHADOW_PRIORITY)
    if (shipped === source) return
    busy = true
    try {
      remove()
      if (shipped === undefined) return
      const resolvedLocale = locale ?? shipped.locale
      dispose = slots.register({
        name,
        priority: SHADOW_PRIORITY,
        children: unlistedChildren(shipped.children ?? {}),
        ...(shipped.inject === undefined ? {} : { inject: shipped.inject }),
        ...(shipped.store === undefined ? {} : { store: shipped.store }),
        ...(resolvedLocale === undefined ? {} : { locale: resolvedLocale }),
      }, component as never)
      source = shipped
    } finally {
      busy = false
    }
  }
  const unsubscribe = slots.subscribe(name, sync)
  sync()
  return () => {
    unsubscribe()
    remove()
  }
}

/**
 * Row order of the sidebar sections. Each section sorts by last update or keeps an order the user made by drag.
 * @module dsh-better-left-sidebar/client/order
 */

/** How a section sorts its rows. */
export type SortMode = 'updated' | 'manual'

/** The sections that can sort. */
export type SectionId = 'pinned' | 'recents'

/** Sort state of one section. */
export interface SectionSort {
  readonly mode: SortMode
  /** Row ids in the order the user made; empty until the first switch to manual order. */
  readonly order: readonly string[]
}

/** Sort state of all sections. */
export type SectionSorts = Readonly<Record<SectionId, SectionSort>>

/** The state before the user changes anything. */
export const DEFAULT_SORTS: SectionSorts = {
  pinned: { mode: 'updated', order: [] },
  recents: { mode: 'updated', order: [] },
}

/**
 * Order rows newest first.
 * @param ids - rows to order.
 * @param updatedAt - last update time of a row.
 * @returns a new array, newest first, with the row id as the tie-break.
 */
export function byUpdated(ids: readonly string[], updatedAt: (id: string) => number): string[] {
  return [...ids].sort((a, b) => updatedAt(b) - updatedAt(a) || a.localeCompare(b))
}

/**
 * Apply a saved order to the current rows. Rows that the saved order does not know go first, newest first.
 * @param ids - current rows.
 * @param saved - saved order; it can contain rows that no longer exist.
 * @param updatedAt - last update time of a row.
 * @returns a new array that contains each current row one time.
 */
export function manualOrder(ids: readonly string[], saved: readonly string[], updatedAt: (id: string) => number): string[] {
  const current = new Set(ids)
  const known = new Set(saved)
  const added = byUpdated(ids.filter(id => !known.has(id)), updatedAt)
  return [...added, ...[...known].filter(id => current.has(id))]
}

/**
 * Move a row next to another row.
 * @param ids - rows in their shown order.
 * @param id - the row to move.
 * @param target - the row to move next to.
 * @param place - the side of the target.
 * @returns a new array; `ids` unchanged in content when `id` and `target` are the same row.
 */
export function moveRow(ids: readonly string[], id: string, target: string, place: 'before' | 'after'): string[] {
  if (id === target) return [...ids]
  const rest = ids.filter(row => row !== id)
  const index = rest.indexOf(target)
  if (index < 0) return [...ids]
  rest.splice(place === 'before' ? index : index + 1, 0, id)
  return rest
}

function parseSection(value: unknown): SectionSort | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  const { mode, order } = value as { mode?: unknown; order?: unknown }
  if ((mode !== 'updated' && mode !== 'manual') || !Array.isArray(order)) return undefined
  return { mode, order: order.filter((id): id is string => typeof id === 'string') }
}

/**
 * Read sort state from its stored text.
 * @param text - stored JSON, or null when nothing is stored.
 * @returns the state; a damaged section gets its default.
 */
export function parseSorts(text: string | null): SectionSorts {
  if (text === null) return DEFAULT_SORTS
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch (error) {
    // Damaged local preferences are not worth an error: the user sees the default order.
    void error
    return DEFAULT_SORTS
  }
  if (typeof value !== 'object' || value === null) return DEFAULT_SORTS
  const { pinned, recents } = value as { pinned?: unknown; recents?: unknown }
  return {
    pinned: parseSection(pinned) ?? DEFAULT_SORTS.pinned,
    recents: parseSection(recents) ?? DEFAULT_SORTS.recents,
  }
}

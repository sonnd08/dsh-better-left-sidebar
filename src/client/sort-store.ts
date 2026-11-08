/**
 * Keeps the sort state of the sidebar sections in the browser.
 * @module dsh-better-left-sidebar/client/sort-store
 */
import { parseSorts, type SectionId, type SectionSorts, type SortMode } from './order.ts'

const STORAGE_KEY = 'dsh-better-left-sidebar:sections'

/** The store that the conversation column reads. */
export interface SortStore {
  getSnapshot(): SectionSorts
  subscribe(listener: () => void): () => void
  /** Select a mode. The first switch to manual order starts from `shown`. */
  setMode(section: SectionId, mode: SortMode, shown: readonly string[]): void
  /** Save the order of a section that the user changed by drag. */
  setOrder(section: SectionId, order: readonly string[]): void
}

function read(): SectionSorts {
  try {
    return parseSorts(localStorage.getItem(STORAGE_KEY))
  } catch (error) {
    // Blocked storage: the sections work for this page load with the default order.
    void error
    return parseSorts(null)
  }
}

function write(sorts: SectionSorts): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorts))
  } catch (error) {
    // Blocked or full storage: the order stays for this page load only.
    void error
  }
}

/**
 * Create the store from the saved state.
 * @returns a store that saves each change.
 */
export function createSortStore(): SortStore {
  let sorts = read()
  const listeners = new Set<() => void>()
  const commit = (next: SectionSorts): void => {
    sorts = next
    write(next)
    for (const listener of listeners) listener()
  }
  return {
    getSnapshot: () => sorts,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    setMode: (section, mode, shown) => {
      const current = sorts[section]
      if (current.mode === mode) return
      commit({ ...sorts, [section]: { mode, order: current.order.length === 0 ? [...shown] : current.order } })
    },
    setOrder: (section, order) => {
      commit({ ...sorts, [section]: { ...sorts[section], order: [...order] } })
    },
  }
}

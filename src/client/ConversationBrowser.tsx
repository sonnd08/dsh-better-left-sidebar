/**
 * Conversation column with four sections in this order: search, new chat, pinned and recents. Pinned and recents each
 * sort by last update or by an order that the user makes by drag.
 * @module dsh-better-left-sidebar/client/ConversationBrowser
 */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type DragEvent, type ReactNode } from 'react'
import {
  IconCloseOutlineRegular, IconEllipsisOutlineRegular, IconNewChatOutlineMedium, IconSearchOutlineMedium,
  Menu, ShortcutKeys, StateDot,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { StateDotState } from '@deepseek-ai/dsh-client-ui-primitives'
import type { WorkspaceBrowserProps } from '@deepseek-ai/dsh-client-ui-workspace/client'
import type { BrowserKey } from './locales.ts'
import { byUpdated, manualOrder, moveRow, type SectionId, type SortMode } from './order.ts'
import type { OpenChatRef } from './pin-shortcut.ts'
import type { SortStore } from './sort-store.ts'
import { classes } from './classes.ts'
import css from './ConversationBrowser.module.css'

const SEARCH_DEBOUNCE_MS = 250
/** The maximum length of the Host search query, in UTF-16 code units. */
const SEARCH_QUERY_MAX = 500
/** Column slide time; an element that is not visible yet cannot take the focus. */
const EXPAND_SLIDE_MS = 300
const CLOCK_INTERVAL_MS = 60_000

type Translate = (key: BrowserKey, values?: Record<string, string | number>) => string
type BrowserProps = Omit<WorkspaceBrowserProps, 't'> & { t: Translate }
type RowSlots = Pick<BrowserProps, 'renderSlot' | 'openSessionMenu' | 'useContextMenu' | 'useContextMenuTarget' | 'useSessionAccess' | 'requestSessionRename' | 'open'>
type DropPlace = 'before' | 'after'

/** One row as the sections show it. */
interface RowModel {
  readonly id: string
  readonly title: string
  readonly updatedAt: number
  readonly state: StateDotState
  readonly snippet?: string | undefined
}

function compactTime(updatedAt: number, now: number, t: Translate): string {
  const minutes = Math.floor((now - updatedAt) / 60_000)
  if (minutes < 1) return t('time.now')
  if (minutes < 60) return t('time.minutes', { n: minutes })
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return t('time.hours', { n: hours })
  const days = Math.floor(hours / 24)
  if (days < 30) return t('time.days', { n: days })
  const months = Math.floor(days / 30)
  return months < 12 ? t('time.months', { n: months }) : t('time.years', { n: Math.floor(months / 12) })
}

/** Accept the native drag in the whole document while a row moves, so the release does not animate as refused. */
function useDragAcceptance(active: boolean): void {
  useEffect(() => {
    if (!active) return
    const accept = (event: globalThis.DragEvent): void => {
      event.preventDefault()
      if (event.dataTransfer !== null) event.dataTransfer.dropEffect = 'move'
    }
    const drop = (event: globalThis.DragEvent): void => { event.preventDefault() }
    document.addEventListener('dragover', accept)
    document.addEventListener('drop', drop)
    return () => {
      document.removeEventListener('dragover', accept)
      document.removeEventListener('drop', drop)
    }
  }, [active])
}

/** How a row takes part in a section drag. */
interface RowDrag {
  readonly active: boolean
  readonly marker: DropPlace | undefined
  start(): void
  hover(place: DropPlace): void
  end(): void
}

function rowHalf(event: DragEvent<HTMLElement>): DropPlace {
  const rect = event.currentTarget.getBoundingClientRect()
  return event.clientY < rect.top + rect.height / 2 ? 'before' : 'after'
}

function SessionRow({ row, selected, now, drag, t, renderSlot, openSessionMenu, useContextMenu, useContextMenuTarget, useSessionAccess, requestSessionRename, open }: RowSlots & {
  row: RowModel
  selected: boolean
  now: number
  drag?: RowDrag | undefined
  t: Translate
}) {
  const { getTriggerProps } = useContextMenu()
  const menuOpen = useContextMenuTarget(target => target?.kind === 'session' && target.value.sessionId === row.id)
  const renamable = useSessionAccess(row.id as never, 'session/rename')
  // On macOS the click that activates the window arrives as the second click of a double click.
  const renameArmed = useRef(false)
  const opened = (): void => { open(row.id as never) }
  return (
    <div
      className={classes(css.row, selected && css.selected, menuOpen && css.menuOpen,
        drag?.marker === 'before' && css.dropBefore, drag?.marker === 'after' && css.dropAfter)}
      role="treeitem"
      aria-selected={selected}
      tabIndex={0}
      data-row-id={row.id}
      onClick={opened}
      {...getTriggerProps({ kind: 'session', value: { sessionId: row.id as never, displayTitle: row.title } }, { onKeyDown: (event) => {
        if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) return
        event.preventDefault()
        opened()
      } })}
      draggable={drag !== undefined}
      onDragStart={drag === undefined ? undefined : (event) => {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', row.id)
        drag.start()
      }}
      onDragEnd={drag?.end}
      onDragOver={drag === undefined ? undefined : (event) => {
        if (!drag.active) return
        event.preventDefault()
        drag.hover(rowHalf(event))
      }}
    >
      <span className={css.leading}>
        {row.state === 'idle'
          ? renderSlot('sidebar.session.row.leading', { sessionId: row.id as never })
          : <StateDot state={row.state} />}
      </span>
      <span
        className={css.title}
        onMouseDown={(event) => { if (event.detail === 1) renameArmed.current = true }}
        onDoubleClick={!renamable ? undefined : (event) => {
          event.stopPropagation()
          if (!renameArmed.current) return
          renameArmed.current = false
          requestSessionRename(row.id as never, row.title)
        }}
      >
        {row.title}
        {row.snippet !== undefined && <span className={css.snippet}>{row.snippet}</span>}
      </span>
      <span className={css.resting}>
        <span className={css.time}>{compactTime(row.updatedAt, now, t)}</span>
        {renderSlot('sidebar.session.row.trailing', { sessionId: row.id as never })}
      </span>
      <span className={css.actions} onClick={(event) => { event.stopPropagation() }}>
        <button
          type="button"
          className={css.iconButton}
          aria-label={t('row.actions', { name: row.title })}
          data-context-menu-trigger=""
          onPointerDown={(event) => { event.stopPropagation() }}
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect()
            openSessionMenu(row.id as never, row.title, { x: rect.left, y: rect.bottom }, 'toggle')
          }}
        >
          <IconEllipsisOutlineRegular size={14} />
        </button>
        {renderSlot('sidebar.workspaces.session.row.action', { sessionId: row.id as never, displayTitle: row.title })}
      </span>
    </div>
  )
}

function SortMenu({ name, mode, onPick, t }: { name: string; mode: SortMode; onPick(mode: SortMode): void; t: Translate }) {
  const [open, setOpen] = useState(false)
  return (
    <span className={classes(css.sectionMenu, open && css.sectionMenuOpen)}>
      <Menu
        open={open}
        onClose={() => { setOpen(false) }}
        portal
        align="end"
        autoFocus
        selectedId={mode}
        items={[{ id: 'updated', label: t('sort.updated') }, { id: 'manual', label: t('sort.manual') }]}
        onSelect={(id) => {
          setOpen(false)
          onPick(id as SortMode)
        }}
        anchor={(
          <button type="button" className={css.iconButton} aria-label={t('section.options', { name })} aria-haspopup="menu" aria-expanded={open}
            onClick={() => { setOpen(value => !value) }}>
            <IconEllipsisOutlineRegular size={14} />
          </button>
        )}
      />
    </span>
  )
}

function Section({ id, title, empty, rows, store, currentId, now, t, slots }: {
  id: SectionId
  title: string
  empty: string
  rows: readonly RowModel[]
  store: SortStore
  currentId: string | undefined
  now: number
  t: Translate
  slots: RowSlots
}) {
  const sort = useSyncExternalStore(store.subscribe, store.getSnapshot)[id]
  const byId = useMemo(() => new Map(rows.map(row => [row.id, row])), [rows])
  const updatedAt = (rowId: string): number => byId.get(rowId)?.updatedAt ?? 0
  const ids = rows.map(row => row.id)
  const ordered = sort.mode === 'manual' ? manualOrder(ids, sort.order, updatedAt) : byUpdated(ids, updatedAt)
  const [drag, setDrag] = useState<{ id: string; over?: { id: string; place: DropPlace } } | null>(null)
  useDragAcceptance(drag !== null)
  const manual = sort.mode === 'manual'
  return (
    <section className={css.section} aria-label={title}>
      <header className={css.sectionHeader}>
        <span className={css.sectionTitle}>{title}</span>
        <SortMenu name={title} mode={sort.mode} t={t} onPick={(mode) => { store.setMode(id, mode, ordered) }} />
      </header>
      {ordered.length === 0 && <div className={css.empty}>{empty}</div>}
      <div role="tree" aria-label={title}>
        {ordered.map((rowId) => {
          const row = byId.get(rowId)
          if (row === undefined) return null
          const rowDrag: RowDrag | undefined = !manual ? undefined : {
            active: drag !== null,
            marker: drag?.over?.id === rowId && drag.id !== rowId ? drag.over.place : undefined,
            start: () => { setDrag({ id: rowId }) },
            hover: (place) => { setDrag(value => value === null ? value : { id: value.id, over: { id: rowId, place } }) },
            end: () => {
              if (drag?.over !== undefined) store.setOrder(id, moveRow(ordered, drag.id, drag.over.id, drag.over.place))
              setDrag(null)
            },
          }
          return <SessionRow key={rowId} {...slots} row={row} selected={rowId === currentId} now={now} drag={rowDrag} t={t} />
        })}
      </div>
    </section>
  )
}

function statesOf(useSessionStatus: BrowserProps['useSessionStatus']) {
  const statuses = useSessionStatus(snapshot => snapshot)
  return (id: string, running: boolean): StateDotState => {
    const status = statuses.get(id as never)
    if (status?.pendingInteraction !== undefined) return 'warning'
    if (status?.running ?? running) return 'ongoing'
    return status?.completionUnread === true ? 'done' : 'idle'
  }
}

function titleOf(session: { readonly displayTitle?: string | undefined; readonly title?: string | undefined }, t: Translate): string {
  const title = session.displayTitle ?? session.title ?? ''
  return title === '' ? t('row.untitled') : title
}

/**
 * Create the column component for one sort store.
 * @param store - sort state of the sections.
 * @param openChat - receives the chat that the main view shows.
 * @returns the component for the `sidebar.workspaces` slot.
 */
export function createConversationBrowser(store: SortStore, openChat: OpenChatRef) {
  return function ConversationBrowser(props: BrowserProps): ReactNode {
    const {
      wide, expandSidebar, useSessions, useWorkspaces, usePanelInfo, useSessionStatus, useRemoteAccess, useShortcuts,
      useWorkspaceShortcuts, startSession, searchSessions, searchResultLimit, t,
    } = props
    const list = useSessions(state => state)
    const archivedIds = useWorkspaces(state => state.archivedSessionIds)
    const pinnedIds = useWorkspaces(state => state.pinnedSessionIds)
    const panelActive = usePanelInfo(info => info.activePanelId !== null)
    const canStart = useRemoteAccess('session/create')
    const newShortcut = useShortcuts(rows => rows.find(row => row.id === 'session.new'))
    const searchRequest = useWorkspaceShortcuts(state => state.searchRequest)
    const stateOf = statesOf(useSessionStatus)
    const [now, setNow] = useState(() => Date.now())
    useEffect(() => {
      const timer = window.setInterval(() => { setNow(Date.now()) }, CLOCK_INTERVAL_MS)
      return () => { window.clearInterval(timer) }
    }, [])

    const [query, setQuery] = useState('')
    const [content, setContent] = useState<{ query: string; items: readonly { sessionId: string; snippet: string }[]; pending: boolean }>({ query: '', items: [], pending: false })
    const input = useRef<HTMLInputElement>(null)
    const normalized = query.slice(0, SEARCH_QUERY_MAX).trim()
    useEffect(() => {
      if (normalized === '') return
      const controller = new AbortController()
      setContent({ query: normalized, items: [], pending: true })
      const timer = window.setTimeout(() => {
        searchSessions(normalized, controller.signal).then((result) => {
          if (!controller.signal.aborted) setContent({ query: normalized, items: result.items, pending: false })
        }).catch(() => {
          if (!controller.signal.aborted) setContent({ query: normalized, items: [], pending: false })
        })
      }, SEARCH_DEBOUNCE_MS)
      return () => {
        window.clearTimeout(timer)
        controller.abort()
      }
    }, [normalized, searchSessions])

    const lastSearchRequest = useRef(searchRequest)
    useEffect(() => {
      if (lastSearchRequest.current === searchRequest) return
      lastSearchRequest.current = searchRequest
      if (wide) { input.current?.focus(); return }
      expandSidebar()
      const timer = window.setTimeout(() => { input.current?.focus() }, EXPAND_SLIDE_MS)
      return () => { window.clearTimeout(timer) }
    }, [searchRequest, wide, expandSidebar])

    const archived = new Set<string>(archivedIds)
    const pinned = new Set<string>(pinnedIds)
    const sessions: Readonly<Record<string, (typeof list.byId)[keyof typeof list.byId] | undefined>> = list.byId
    const visible: readonly string[] = list.ids.filter((id) => {
      const session = sessions[id]
      return session !== undefined && !session.blank && !archived.has(id)
    })
    const modelOf = (id: string, snippet?: string): RowModel | undefined => {
      const session = sessions[id]
      if (session === undefined) return undefined
      return { id, title: titleOf(session, t), updatedAt: session.updatedAt, state: stateOf(id, session.running), snippet }
    }
    const models = (ids: readonly string[]): RowModel[] => ids.flatMap((id) => {
      const model = modelOf(id)
      return model === undefined ? [] : [model]
    })
    const currentId = panelActive
      ? undefined
      : Object.values(list.byId).find(session => (session.retainedBy.mainView ?? 0) > 0)?.id
    const openRow = currentId !== undefined && visible.includes(currentId) ? modelOf(currentId) : undefined
    const openId = openRow?.id
    const openTitle = openRow?.title
    useEffect(() => {
      openChat.current = openId === undefined || openTitle === undefined ? undefined : { id: openId, title: openTitle }
    }, [openId, openTitle])
    const slots: RowSlots = {
      renderSlot: props.renderSlot,
      openSessionMenu: props.openSessionMenu,
      useContextMenu: props.useContextMenu,
      useContextMenuTarget: props.useContextMenuTarget,
      useSessionAccess: props.useSessionAccess,
      requestSessionRename: props.requestSessionRename,
      open: props.open,
    }

    const searching = normalized !== ''
    const needle = normalized.toLocaleLowerCase()
    const titleMatches = !searching ? [] : visible.filter(id => titleOf(sessions[id]!, t).toLocaleLowerCase().includes(needle))
    const titleSet = new Set(titleMatches)
    const contentItems = content.query === normalized ? content.items : []
    const searchRows = !searching ? [] : [
      ...models(titleMatches),
      ...contentItems.flatMap((item) => {
        if (titleSet.has(item.sessionId) || archived.has(item.sessionId)) return []
        const model = modelOf(item.sessionId, item.snippet)
        return model === undefined ? [] : [model]
      }),
    ].slice(0, searchResultLimit)
    const searchPending = searching && (content.query !== normalized || content.pending)

    return (
      <div className={css.root}>
        <div className={css.searchBox}>
          <IconSearchOutlineMedium size={14} className={css.searchIcon} />
          <input
            ref={input}
            className={css.searchInput}
            value={query}
            maxLength={SEARCH_QUERY_MAX}
            placeholder={t('search.placeholder')}
            aria-label={t('search.placeholder')}
            onChange={(event) => { setQuery(event.target.value) }}
            onKeyDown={(event) => { if (event.key === 'Escape') setQuery('') }}
          />
          {query !== '' && (
            <button type="button" className={css.iconButton} aria-label={t('search.clear')} onClick={() => { setQuery('') }}>
              <IconCloseOutlineRegular size={14} />
            </button>
          )}
        </div>
        {canStart && (
          <button type="button" className={css.newChat} aria-keyshortcuts={newShortcut?.aria} onClick={() => { startSession() }}>
            <IconNewChatOutlineMedium size={14} />
            <span className={css.newChatLabel}>{t('newChat')}</span>
            {newShortcut !== undefined && newShortcut.keys.length > 0 && (
              <span className={css.newChatShortcut} aria-hidden="true"><ShortcutKeys keys={newShortcut.keys} /></span>
            )}
          </button>
        )}
        <div className={css.scroll}>
          {searching
            ? (
              <div role="tree" aria-label={t('search.placeholder')}>
                {searchRows.map(row => <SessionRow key={row.id} {...slots} row={row} selected={row.id === currentId} now={now} t={t} />)}
                {searchRows.length === 0 && <div className={css.empty}>{t(searchPending ? 'search.pending' : 'search.none')}</div>}
              </div>
            )
            : (
              <>
                <Section id="pinned" title={t('section.pinned')} empty={t('section.pinned.empty')} rows={models(visible.filter(id => pinned.has(id)))}
                  store={store} currentId={currentId} now={now} t={t} slots={slots} />
                <Section id="recents" title={t('section.recents')} empty={t('section.recents.empty')} rows={models(visible.filter(id => !pinned.has(id)))}
                  store={store} currentId={currentId} now={now} t={t} slots={slots} />
              </>
            )}
        </div>
      </div>
    )
  }
}

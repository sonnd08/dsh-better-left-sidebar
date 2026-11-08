/**
 * Sidebar shell: a small icon rail and, beside it, the conversation column. The native shell puts the panel rows
 * above the session list. This shell moves them, the settings and the footer actions into the rail.
 * @module dsh-better-left-sidebar/client/RailShell
 */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  FishLogo, IconAppsAddOutlineRegular, IconNewChatOutlineRegular, IconPanelLeftOutlineRegular,
  isDarwinDesktop, Menu, Tooltip, useModalLayer,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { SidebarRootComponentProps } from '@deepseek-ai/dsh-client-ui-sidebar/client'
import { classes } from './classes.ts'
import css from './RailShell.module.css'

/** Time after a collapse before the wide content leaves; the same as the native shell. */
const COLLAPSE_SETTLE_MS = 150
/** The native panel that the More menu cannot hide. */
const FIXED_PANEL_ID = 'plugins'
const RAIL_ICON_SIZE = 18

type RailProps = Pick<SidebarRootComponentProps, 'usePanelInfo' | 'selectPanel' | 'renderSlot'>

/** One panel button. Each button reads only its own selection state. */
function RailPanel({ id, label, usePanelInfo, selectPanel, renderSlot }: RailProps & { id: string; label: string }) {
  const active = usePanelInfo(info => info.activePanelId === id)
  return (
    <Tooltip label={label} delayMs={500} side="right">
      <button
        type="button"
        className={classes(css.railButton, active && css.railActive)}
        aria-label={label}
        aria-current={active ? 'page' : undefined}
        onClick={() => { selectPanel(id as never) }}
      >
        {renderSlot('sidebar.panellist', { size: RAIL_ICON_SIZE, active }, { only: id })}
      </button>
    </Tooltip>
  )
}

/**
 * Render the sidebar column.
 * @param props - the props of the native sidebar entry, and the update and settings buttons in `footer`.
 * @returns the rail and the conversation column.
 */
export function RailShell({
  collapsed, width, drawer, startSession, toggleSidebar, selectPanel, setPinned,
  useRemoteAccess, usePanels, useEntryPins, useEntryActions, useShortcuts, usePanelInfo, t, renderSlot, footer,
}: SidebarRootComponentProps & { footer: ReactNode }) {
  const panels = usePanels(snapshot => snapshot)
  const unpinned = useEntryPins(ids => ids)
  const activePanelId = usePanelInfo(info => info.activePanelId)
  const hasEntryActions = useEntryActions(registered => registered)
  const toggleShortcut = useShortcuts(rows => rows.find(row => row.id === 'sidebar.left.toggle'))
  const canStartSession = useRemoteAccess('session/create')
  const toggleLabel = collapsed ? t('toggle.open') : t('toggle.collapse')
  const [settled, setSettled] = useState(collapsed)
  useEffect(() => {
    if (drawer || !collapsed) { setSettled(collapsed); return }
    const timer = window.setTimeout(() => { setSettled(true) }, COLLAPSE_SETTLE_MS)
    return () => { window.clearTimeout(timer) }
  }, [collapsed, drawer])
  const wide = drawer || !collapsed || !settled
  const lastWideWidth = useRef(width)
  if (drawer || !collapsed) lastWideWidth.current = width
  const column = useRef<HTMLDivElement>(null)
  useModalLayer(column, drawer && !collapsed, toggleSidebar)
  const [moreOpen, setMoreOpen] = useState(false)
  const closeMore = (): void => { setMoreOpen(false) }
  const darwinDesktop = isDarwinDesktop()

  const toggle = (
    <Tooltip label={toggleLabel} shortcutKeys={toggleShortcut?.keys} delayMs={500} side="right" portal={drawer}>
      <button
        data-sidebar-toggle
        data-modal-autofocus={drawer || undefined}
        type="button"
        className={css.toggle}
        aria-label={toggleLabel}
        aria-keyshortcuts={toggleShortcut?.aria}
        onClick={() => { toggleSidebar() }}
      >
        <IconPanelLeftOutlineRegular size={16} />
      </button>
    </Tooltip>
  )

  return (
    <div
      ref={column}
      role={drawer ? 'dialog' : undefined}
      data-shortcut-modal={drawer ? 'sidebar' : undefined}
      aria-modal={drawer && !collapsed ? true : undefined}
      aria-label={drawer ? t('navigation.label') : undefined}
      tabIndex={drawer ? -1 : undefined}
      className={classes(css.root, !wide && css.collapsed, !drawer && collapsed && wide && css.fading)}
      style={wide ? { width: !drawer && collapsed ? lastWideWidth.current : width } : undefined}
    >
      {darwinDesktop && <div className={css.topStrip} data-window-drag>{toggle}</div>}
      <div className={css.body}>
        <nav className={css.rail} aria-label={t('panels.label')}>
          {!darwinDesktop && toggle}
          <span className={css.brand} aria-hidden="true">
            {renderSlot('sidebar.brand.mark', { size: 24 }, { fallback: <FishLogo size={24} /> })}
          </span>
          {!wide && canStartSession && (
            <Tooltip label={t('session.new.label')} delayMs={500} side="right">
              <button type="button" className={css.railButton} aria-label={t('session.new.label')} onClick={() => { startSession() }}>
                <IconNewChatOutlineRegular size={RAIL_ICON_SIZE} />
              </button>
            </Tooltip>
          )}
          {panels.filter(({ id }) => id === FIXED_PANEL_ID || !unpinned.includes(id)).map(({ id, label }) => (
            <RailPanel key={id} id={id} label={label} usePanelInfo={usePanelInfo} selectPanel={selectPanel} renderSlot={renderSlot} />
          ))}
          {hasEntryActions && (
            <Menu open={moreOpen} onClose={closeMore} portal autoFocus side="right"
              anchor={(
                <Tooltip label={t('panels.more')} delayMs={500} side="right">
                  <button type="button" className={css.railButton} aria-label={t('panels.more')} aria-haspopup="menu" aria-expanded={moreOpen}
                    onClick={() => { setMoreOpen(value => !value) }}>
                    <IconAppsAddOutlineRegular size={RAIL_ICON_SIZE} />
                  </button>
                </Tooltip>
              )}>
              {renderSlot('sidebar.panellist.actions', {
                entries: panels.filter(({ id }) => id !== FIXED_PANEL_ID)
                  .map(({ id, label }) => ({ id, label, pinned: !unpinned.includes(id), active: id === activePanelId })),
                onOpen: (id: string) => { selectPanel(id as never) },
                onPinnedChange: setPinned,
                onDismiss: closeMore,
              })}
            </Menu>
          )}
          <span className={css.railSpacer} />
          {renderSlot('sidebar.footer.action', { wide: false })}
          {footer}
          {renderSlot('sidebar.settings', { wide: false })}
        </nav>
        <div className={css.main}>
          {renderSlot('sidebar.workspaces', { wide, expandSidebar: () => { if (collapsed) toggleSidebar() } })}
        </div>
      </div>
    </div>
  )
}

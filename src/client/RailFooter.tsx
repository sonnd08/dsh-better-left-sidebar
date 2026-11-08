/**
 * Update and settings buttons of the rail. In its narrow form the native footer hides the update button and keeps
 * Settings inside the account menu, so this component reads both from the `sidebar.settings` ledger entry.
 * @module dsh-better-left-sidebar/client/RailFooter
 */
import { useMemo, useSyncExternalStore } from 'react'
import {
  IconDownloadOutlineRegular, IconLoadingOutlineRegular, IconSettingsOutlineMedium, Tooltip,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { LedgerEntry, LedgerSlots } from './ledger.ts'
import css from './RailShell.module.css'

const SETTINGS_SLOT = 'sidebar.settings'
const LAUNCHER_SLOT = 'settings.launcher'
const BUSY_PHASES: ReadonlySet<string> = new Set(['checking', 'downloading', 'verifying', 'installing'])

type Translate = (key: string, values?: Record<string, string | number>) => string

/** Desktop update state as the native settings entry publishes it. */
interface UpdateView {
  readonly presentation?: { readonly phase: string; readonly version?: string; readonly percent?: number } | undefined
  readonly failed: boolean
  readonly opening: boolean
}

/** The part of the native settings props that this component uses. */
interface SettingsFace {
  openDesktopUpdate?(): void
  readonly hooks?: {
    readonly desktopUpdate?: { getSnapshot(): UpdateView; subscribe(listener: () => void): () => void }
  }
}

const NO_UPDATE: UpdateView = { failed: false, opening: false }
const noUpdates = { getSnapshot: () => NO_UPDATE, subscribe: () => () => {} }

function settingsFace(entry: LedgerEntry | undefined): SettingsFace {
  return typeof entry?.inject === 'function' ? entry.inject() as SettingsFace : {}
}

function updateLabel({ presentation, failed }: UpdateView, t: Translate): string {
  if (failed || presentation === undefined || presentation.phase === 'error') return t('desktop.update.retry')
  const label = presentation.phase === 'downloading'
    ? t('desktop.update.progress', { percent: presentation.percent ?? 0 })
    : t(`desktop.update.${presentation.phase}`)
  return presentation.version === undefined ? label : t('desktop.update.versionDetail', { label, version: presentation.version })
}

/**
 * Create the footer buttons.
 * @param slots - the slot ledger.
 * @param t - translator of the native `settings` dictionary.
 * @returns the component that shows the buttons.
 */
export function createRailFooter(slots: LedgerSlots, t: Translate) {
  const subscribeSettings = (listener: () => void): (() => void) => slots.subscribe(SETTINGS_SLOT, listener)
  const subscribeLauncher = (listener: () => void): (() => void) => slots.subscribe(LAUNCHER_SLOT, listener)
  const settingsEntry = (): LedgerEntry | undefined => slots.entries(SETTINGS_SLOT)[0]
  const hasLauncher = (): boolean => slots.entries(LAUNCHER_SLOT).length > 0
  return function RailFooter() {
    const entry = useSyncExternalStore(subscribeSettings, settingsEntry)
    // Without an account launcher the native footer already shows its own gear.
    const showGear = useSyncExternalStore(subscribeLauncher, hasLauncher)
    const face = useMemo(() => settingsFace(entry), [entry])
    const source = face.hooks?.desktopUpdate ?? noUpdates
    const update = useSyncExternalStore(source.subscribe, source.getSnapshot)
    const phase = update.presentation?.phase
    const showUpdate = update.failed || (phase !== undefined && phase !== 'idle')
    const busy = update.opening || (phase !== undefined && BUSY_PHASES.has(phase))
    const openSettings = (): void => {
      const store = entry?.store as { create?: () => { actions: { open(): void } } } | undefined
      store?.create?.().actions.open()
    }
    return (
      <>
        {showUpdate && (
          <Tooltip label={updateLabel(update, t)} delayMs={500} side="right">
            <button type="button" className={css.railUpdate} aria-label={updateLabel(update, t)} aria-disabled={busy}
              onClick={() => { if (!busy) face.openDesktopUpdate?.() }}>
              {busy ? <IconLoadingOutlineRegular className={css.railSpinner} size={18} /> : <IconDownloadOutlineRegular size={18} />}
            </button>
          </Tooltip>
        )}
        {showGear && (
          <Tooltip label={t('trigger')} delayMs={500} side="right">
            <button type="button" className={css.railButton} aria-label={t('trigger')} aria-haspopup="dialog" onClick={openSettings}>
              <IconSettingsOutlineMedium size={18} />
            </button>
          </Tooltip>
        )}
      </>
    )
  }
}

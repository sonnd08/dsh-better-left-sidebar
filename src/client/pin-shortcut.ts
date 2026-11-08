/**
 * Keyboard command that pins or unpins the open chat. It runs the Pin action of the row menu, so the plugin that owns
 * a chat decides how to pin it.
 * @module dsh-better-left-sidebar/client/pin-shortcut
 */

/** Row id prefix and menu target kind of the Claude and Codex chats of dsh-agent-bridge. */
const EXTERNAL_PREFIX = 'ext:'
const EXTERNAL_MENU_KIND = 'agent-bridge.session'
const NATIVE_MENU_KIND = 'session'
const PIN_ACTION_SUFFIX = '/pin'
const COMMAND_ID = 'better-left-sidebar.pin'
/** The native command that has Cmd+P as its default. */
const FILES_COMMAND_ID = 'workspace.files'
/** The preference revision moves while commands register, so a save can be stale. */
const STALE_RETRIES = 3
/** A browser keeps Cmd+P for print, so a browser page uses the second binding. */
const KEY_CANDIDATES = [{ code: 'KeyP', modifiers: ['primary'] }, { code: 'KeyP', modifiers: ['primary', 'alt'] }]

/** The chat that the main view shows. */
export interface OpenChat {
  readonly id: string
  readonly title: string
}

/** Holds the open chat for the command. The conversation column writes it. */
export interface OpenChatRef {
  current: OpenChat | undefined
}

/** The part of the context menu service that the command uses. */
export interface PinMenus {
  resolve(target: { kind: string; value: { sessionId: string; displayTitle: string } }): {
    readonly source: { getSnapshot(): readonly { readonly id: string; readonly disabled?: boolean }[] }
    readonly ready: Promise<void>
    select(id: string): void
    dispose(): void
  }
}

/** The part of the shortcut service that the command uses. */
export interface PinShortcuts {
  readonly catalog: ShortcutSource<readonly { readonly id: string; readonly modified: boolean }[]>
  readonly config: ShortcutSource<{ readonly status: string; readonly revision: unknown }>
  register(command: Record<string, unknown>): () => void
  describeBinding(binding: (typeof KEY_CANDIDATES)[number]): { readonly issue: unknown }
  edit(edit: Record<string, unknown>, revision: unknown): Promise<ShortcutSave>
}

/** Result of one preference edit. */
interface ShortcutSave {
  readonly status: string
  readonly snapshot: { readonly revision: unknown }
  readonly conflicts?: readonly string[]
}

interface ShortcutSource<T> {
  getSnapshot(): T
  subscribe(listener: () => void): () => void
}

/**
 * Run the Pin or Unpin action of a chat.
 * @param menus - the context menu service.
 * @param chat - the chat to change.
 * @returns a promise that settles after the action started; it does nothing when the chat has no enabled action.
 */
export async function togglePin(menus: PinMenus, chat: OpenChat): Promise<void> {
  const resolution = menus.resolve({
    kind: chat.id.startsWith(EXTERNAL_PREFIX) ? EXTERNAL_MENU_KIND : NATIVE_MENU_KIND,
    value: { sessionId: chat.id, displayTitle: chat.title },
  })
  try {
    await resolution.ready
    const action = resolution.source.getSnapshot().find(item => item.id.endsWith(PIN_ACTION_SUFFIX) && item.disabled !== true)
    if (action !== undefined) resolution.select(action.id)
  } finally {
    resolution.dispose()
  }
}

/**
 * Save one preference edit, and save again with the newest revision when the store reports a stale revision.
 * @param shortcuts - the shortcut service.
 * @param edit - the preference edit.
 * @param revision - the accepted preference revision.
 * @returns the result of the last save.
 */
async function saveEdit(shortcuts: PinShortcuts, edit: Record<string, unknown>, revision: unknown): Promise<ShortcutSave> {
  let result = await shortcuts.edit(edit, revision)
  for (let attempt = 0; result.status === 'stale' && attempt < STALE_RETRIES; attempt += 1) {
    result = await shortcuts.edit(edit, result.snapshot.revision)
  }
  return result
}

/**
 * Save the key of the command. The store refuses a key that disables a default of another command, so a refusal that
 * names the Files command clears that default and saves again.
 * @param shortcuts - the shortcut service.
 * @param binding - the key to save.
 * @param revision - the accepted preference revision.
 */
async function saveKey(shortcuts: PinShortcuts, binding: (typeof KEY_CANDIDATES)[number], revision: unknown): Promise<void> {
  const edit = { type: 'set', id: COMMAND_ID, binding }
  const first = await saveEdit(shortcuts, edit, revision)
  if (first.status !== 'conflict' || first.conflicts?.includes(FILES_COMMAND_ID) !== true) return
  const cleared = await saveEdit(shortcuts, { type: 'set', id: FILES_COMMAND_ID, binding: null }, first.snapshot.revision)
  if (cleared.status === 'saved') await saveEdit(shortcuts, edit, cleared.snapshot.revision)
}

/**
 * Give the command its key one time. The native Files command has Cmd+P as a default, and the registry refuses a second
 * default on the same key, so the key is saved as a preference. The check for a saved preference keeps a key that the
 * user selected later.
 * @param shortcuts - the shortcut service.
 * @returns a function that stops the wait for the preferences.
 */
function claimKey(shortcuts: PinShortcuts): () => void {
  let claimed = false
  const attempt = (): void => {
    if (claimed) return
    const config = shortcuts.config.getSnapshot()
    const row = shortcuts.catalog.getSnapshot().find(entry => entry.id === COMMAND_ID)
    if (config.status !== 'ready' || row === undefined) return
    claimed = true
    if (row.modified) return
    const binding = KEY_CANDIDATES.find(candidate => shortcuts.describeBinding(candidate).issue === null)
    if (binding === undefined) return
    void saveKey(shortcuts, binding, config.revision).catch((error: unknown) => {
      console.error('better-left-sidebar: could not save the pin shortcut', error)
    })
  }
  const stopConfig = shortcuts.config.subscribe(attempt)
  const stopCatalog = shortcuts.catalog.subscribe(attempt)
  attempt()
  return () => {
    stopConfig()
    stopCatalog()
  }
}

/**
 * Register the command.
 * @param shortcuts - the shortcut service.
 * @param menus - the context menu service.
 * @param chat - the open chat.
 * @param text - the command label and the reason that shows when no chat is open.
 * @returns a function that removes the command.
 */
export function registerPinShortcut(shortcuts: PinShortcuts, menus: PinMenus, chat: OpenChatRef, text: { label(): string; noChat(): string }): () => void {
  const unregister = shortcuts.register({
    id: COMMAND_ID,
    label: text.label,
    aliases: ['pin chat', 'unpin chat'],
    defaults: {},
    regions: ['page', 'editable'],
    modals: ['sidebar'],
    resolve: () => {
      const open = chat.current
      if (open === undefined) return { status: 'blocked', reason: text.noChat() }
      return { status: 'handled', run: () => togglePin(menus, open) }
    },
  })
  const stopClaim = claimKey(shortcuts)
  return () => {
    stopClaim()
    unregister()
  }
}

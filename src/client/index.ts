/**
 * dsh-better-left-sidebar, client half. Shows a small icon rail and a conversation column in the left sidebar.
 * @module dsh-better-left-sidebar/client
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import { createConversationBrowser } from './ConversationBrowser.tsx'
import { shadowSlot, type LedgerSlots } from './ledger.ts'
import { en, zh } from './locales.ts'
import { RailShell } from './RailShell.tsx'
import { createSortStore } from './sort-store.ts'

/** Services this plugin needs. */
export const inject = ['slots', 'locale']

const NS = 'better-left-sidebar'

/**
 * Register the replacement sidebar.
 * @param ctx - client context.
 */
export function apply(ctx: ClientContext): void {
  const slots = ctx.slots as unknown as LedgerSlots
  ctx.effect(() => ctx.locale.register(NS as never, { en, zh } as never), 'better-left-sidebar: dictionaries')
  ctx.effect(() => shadowSlot(slots, 'sidebar', RailShell), 'better-left-sidebar: shell')
  ctx.effect(() => shadowSlot(slots, 'sidebar.workspaces', createConversationBrowser(createSortStore()), NS), 'better-left-sidebar: conversations')
}

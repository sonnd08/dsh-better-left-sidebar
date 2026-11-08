/**
 * Text of the conversation column.
 * @module dsh-better-left-sidebar/client/locales
 */

/** English dictionary. */
export const en = {
  'search.placeholder': 'Search chats',
  'search.clear': 'Clear search',
  'search.none': 'No matching chats',
  'search.pending': 'Searching',
  'newChat': 'New chat',
  'section.pinned': 'Pinned',
  'section.recents': 'Recents',
  'section.options': '{name} options',
  'section.pinned.empty': 'No pinned chats',
  'section.recents.empty': 'No chats yet',
  'sort.updated': 'Last updated',
  'sort.manual': 'Manual order',
  'row.untitled': 'New chat',
  'row.actions': 'Actions for {name}',
  'shortcut.pin': 'Pin or unpin chat',
  'shortcut.noChat': 'Open a chat first',
  'time.now': 'now',
  'time.minutes': '{n}m',
  'time.hours': '{n}h',
  'time.days': '{n}d',
  'time.months': '{n}mo',
  'time.years': '{n}y',
} as const

/** Key of one text. */
export type BrowserKey = keyof typeof en

/** Chinese dictionary. */
export const zh: Record<BrowserKey, string> = {
  'search.placeholder': '搜索对话',
  'search.clear': '清除搜索',
  'search.none': '没有匹配的对话',
  'search.pending': '正在搜索',
  'newChat': '新对话',
  'section.pinned': '已置顶',
  'section.recents': '最近',
  'section.options': '{name} 选项',
  'section.pinned.empty': '没有置顶的对话',
  'section.recents.empty': '还没有对话',
  'sort.updated': '最后更新',
  'sort.manual': '手动排序',
  'row.untitled': '新对话',
  'row.actions': '{name} 的操作',
  'shortcut.pin': '置顶或取消置顶对话',
  'shortcut.noChat': '请先打开一个对话',
  'time.now': '刚刚',
  'time.minutes': '{n}分钟',
  'time.hours': '{n}小时',
  'time.days': '{n}天',
  'time.months': '{n}个月',
  'time.years': '{n}年',
}

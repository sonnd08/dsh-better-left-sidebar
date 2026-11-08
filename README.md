# dsh-better-left-sidebar

A [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin that changes the left sidebar to a small icon rail and a large conversation column.

The column has four sections, in this order:

1. **Search** finds chats by title and by message content.
2. **New chat** starts a chat.
3. **Pinned** shows the pinned chats.
4. **Recents** shows the other chats.

The rail holds the panels, the More menu, the update button, the settings gear and the `…` menu with the other options. The update button shows only when the app has an update.

## Pin the open chat

Push Cmd+P (Ctrl+P on Windows and Linux) to pin or unpin the open chat. This key replaces the native shortcut of the Files panel. You can change both keys in the shortcut settings of the app.

## Sort a section

Each of Pinned and Recents has a `…` menu. Move the pointer onto the section title to show it.

| Option | Result |
| --- | --- |
| Last updated | The newest chat is first. This is the default. |
| Manual order | Drag a row to a new position. A new chat goes to the top. |

The plugin stores the sort state in the browser storage of the app.

## Install

This procedure needs the DeepSeek Harness desktop app. The `lib/` folder in this repository contains a built plugin.

1. Clone this repository.

   ```bash
   git clone https://github.com/sonnd08/dsh-better-left-sidebar.git
   ```

2. Add the plugin to the desktop profile. Use the absolute path of the clone.

   ```bash
   "/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh" plugin --profile desktop add link:/absolute/path/to/dsh-better-left-sidebar
   ```

3. Restart the app.

## Build from source

The build uses the tools of a DeepSeek Harness source checkout.

1. Put this folder in `local/plugins/` of the checkout.
2. Add `node_modules/.bin` of the checkout to `PATH`.
3. Run `tsdown`.
4. Run `node --test tests/*.test.mjs`.
5. Run `tsc -p tsconfig.client.json`.

## Compatibility

- The plugin was tested with DeepSeek Harness 0.2.2-rc.1 on macOS only.
- The plugin reads the slot ledger of DeepSeek Harness, which is not a published API. A new DeepSeek Harness version can break it. If the replacement crashes, the app falls back to the native sidebar.
- [dsh-agent-bridge](https://github.com/wiiwings1988/dsh-agent-bridge) works with this plugin. Its Claude and Codex chats show in the sections.

## Known limits

- The column does not group chats by workspace.
- The column does not show archived chats. To restore an archived chat, disable this plugin and use the native sidebar.
- The Add workspace shortcut does nothing, because the native browser owned that picker.
- The sort state stays on one device, because the plugin stores it in the browser.

## License

MIT

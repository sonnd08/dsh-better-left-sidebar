import test from 'node:test'
import assert from 'node:assert/strict'
import { registerPinShortcut, togglePin } from '../src/client/pin-shortcut.ts'

function menus(items) {
  const calls = { targets: [], selected: [], disposed: 0 }
  return {
    calls,
    resolve(target) {
      calls.targets.push(target)
      return {
        source: { getSnapshot: () => items },
        ready: Promise.resolve(),
        select: id => calls.selected.push(id),
        dispose: () => { calls.disposed += 1 },
      }
    },
  }
}

test('togglePin selects the Pin action of a native chat', async () => {
  const service = menus([{ id: 'session.rename/rename' }, { id: 'session.pin/pin' }])
  await togglePin(service, { id: 'abc', title: 'A' })
  assert.equal(service.calls.targets[0].kind, 'session')
  assert.deepEqual(service.calls.selected, ['session.pin/pin'])
  assert.equal(service.calls.disposed, 1)
})

test('togglePin uses the bridge target for a Claude or Codex chat', async () => {
  const service = menus([{ id: 'agent-bridge.pin/pin' }])
  await togglePin(service, { id: 'ext:claude:1', title: 'B' })
  assert.equal(service.calls.targets[0].kind, 'agent-bridge.session')
  assert.deepEqual(service.calls.selected, ['agent-bridge.pin/pin'])
})

test('togglePin does nothing when the action is absent or disabled', async () => {
  const service = menus([{ id: 'session.pin/pin', disabled: true }])
  await togglePin(service, { id: 'abc', title: 'A' })
  assert.deepEqual(service.calls.selected, [])
  assert.equal(service.calls.disposed, 1)
})

function shortcuts({ modified = false, status = 'ready', blocked = [], refusals = [] } = {}) {
  const edits = []
  let revision = 1
  const source = value => ({ getSnapshot: () => value, subscribe: () => () => {} })
  return {
    edits,
    catalog: source([{ id: 'better-left-sidebar.pin', modified }]),
    config: source({ status, revision: 'r1' }),
    register: () => () => {},
    describeBinding: binding => ({ issue: blocked.includes(binding.modifiers.length) ? 'reserved' : null }),
    edit: async (edit, seen) => {
      edits.push([edit, seen])
      const refusal = refusals.shift()
      if (refusal === 'stale') return { status: 'stale', snapshot: { revision: 'fresh' } }
      if (refusal !== undefined) return { status: 'conflict', conflicts: refusal, snapshot: { revision: seen } }
      revision += 1
      return { status: 'saved', snapshot: { revision: `r${revision}` } }
    },
  }
}

const text = { label: () => 'Pin', noChat: () => 'None' }

test('the command saves Cmd+P one time', () => {
  const service = shortcuts()
  registerPinShortcut(service, menus([]), { current: undefined }, text)
  assert.deepEqual(service.edits, [[{ type: 'set', id: 'better-left-sidebar.pin', binding: { code: 'KeyP', modifiers: ['primary'] } }, 'r1']])
})

test('the command keeps a key that the user selected', () => {
  const service = shortcuts({ modified: true })
  registerPinShortcut(service, menus([]), { current: undefined }, text)
  assert.deepEqual(service.edits, [])
})

test('the command waits for the preferences and uses the next key when one is reserved', () => {
  const waiting = shortcuts({ status: 'loading' })
  registerPinShortcut(waiting, menus([]), { current: undefined }, text)
  assert.deepEqual(waiting.edits, [])
  const web = shortcuts({ blocked: [1] })
  registerPinShortcut(web, menus([]), { current: undefined }, text)
  assert.deepEqual(web.edits[0][0].binding.modifiers, ['primary', 'alt'])
})

const flush = () => new Promise(resolve => setTimeout(resolve, 0))
const PIN = { type: 'set', id: 'better-left-sidebar.pin', binding: { code: 'KeyP', modifiers: ['primary'] } }

test('the command clears the Files default when the store refuses the key', async () => {
  const service = shortcuts({ refusals: [['workspace.files']] })
  registerPinShortcut(service, menus([]), { current: undefined }, text)
  await flush()
  assert.deepEqual(service.edits, [
    [PIN, 'r1'],
    [{ type: 'set', id: 'workspace.files', binding: null }, 'r1'],
    [PIN, 'r2'],
  ])
})

test('the command does not clear a default of another command', async () => {
  const service = shortcuts({ refusals: [['other.command']] })
  registerPinShortcut(service, menus([]), { current: undefined }, text)
  await flush()
  assert.deepEqual(service.edits, [[PIN, 'r1']])
})

test('the command saves again with the newest revision after a stale result', async () => {
  const service = shortcuts({ refusals: ['stale'] })
  registerPinShortcut(service, menus([]), { current: undefined }, text)
  await flush()
  assert.deepEqual(service.edits, [[PIN, 'r1'], [PIN, 'fresh']])
})

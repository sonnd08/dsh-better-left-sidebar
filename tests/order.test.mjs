import test from 'node:test'
import assert from 'node:assert/strict'
import { byUpdated, DEFAULT_SORTS, manualOrder, moveRow, parseSorts } from '../src/client/order.ts'

const times = { a: 1, b: 3, c: 2, d: 4 }
const updatedAt = id => times[id]

test('byUpdated puts the newest row first', () => {
  assert.deepEqual(byUpdated(['a', 'b', 'c'], updatedAt), ['b', 'c', 'a'])
})

test('manualOrder keeps the saved order and puts new rows first', () => {
  assert.deepEqual(manualOrder(['a', 'b', 'c', 'd'], ['c', 'a'], updatedAt), ['d', 'b', 'c', 'a'])
})

test('manualOrder ignores saved rows that no longer exist', () => {
  assert.deepEqual(manualOrder(['a'], ['z', 'a'], updatedAt), ['a'])
})

test('moveRow moves a row before or after a target', () => {
  assert.deepEqual(moveRow(['a', 'b', 'c'], 'c', 'a', 'before'), ['c', 'a', 'b'])
  assert.deepEqual(moveRow(['a', 'b', 'c'], 'a', 'c', 'after'), ['b', 'c', 'a'])
})

test('moveRow changes nothing for the same row or an unknown target', () => {
  assert.deepEqual(moveRow(['a', 'b'], 'a', 'a', 'after'), ['a', 'b'])
  assert.deepEqual(moveRow(['a', 'b'], 'a', 'z', 'after'), ['a', 'b'])
})

test('parseSorts reads saved state and replaces damaged sections', () => {
  assert.equal(parseSorts(null), DEFAULT_SORTS)
  assert.equal(parseSorts('not json'), DEFAULT_SORTS)
  assert.deepEqual(parseSorts('{"pinned":{"mode":"manual","order":["a",1]},"recents":{"mode":"bad","order":[]}}'), {
    pinned: { mode: 'manual', order: ['a'] },
    recents: DEFAULT_SORTS.recents,
  })
})

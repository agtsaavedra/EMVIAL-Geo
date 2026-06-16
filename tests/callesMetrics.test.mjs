import test from 'node:test'
import assert from 'node:assert/strict'

import { loadPureModule } from './helpers/loadModule.mjs'

const {
  formatearCuadrasOperativas,
} = loadPureModule('src/domain/cuadras.js', [
  'formatearCuadrasOperativas',
])

test('redondea cuadras automaticas a medias cuadras', () => {
  assert.equal(formatearCuadrasOperativas(1.87), '2')
  assert.equal(formatearCuadrasOperativas(1.7), '1.5')
  assert.equal(formatearCuadrasOperativas(1.6), '1.5')
  assert.equal(formatearCuadrasOperativas(1.55), '1.5')
  assert.equal(formatearCuadrasOperativas(1.5), '1.5')
  assert.equal(formatearCuadrasOperativas(0.2), '0.5')
  assert.equal(formatearCuadrasOperativas(0), '')
})

import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const {
  crearNominatimClient,
} = require('../electron/geocoding/nominatimClient.js')

function crearRespuestaJson(valor) {
  return {
    status: 200,
    async text() {
      return JSON.stringify(valor)
    },
  }
}

test('cachea busquedas de direccion', async () => {
  const dir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'emvial-cache-')
  )
  const cachePath = path.join(dir, 'cache.json')
  let llamadas = 0

  const client = crearNominatimClient({
    cachePath,
    fetchImpl: async () => {
      llamadas += 1
      return crearRespuestaJson([
        {
          display_name: 'Av Colon 3200',
          lat: '-38',
          lon: '-57',
        },
      ])
    },
  })

  const primera =
    await client.buscarDireccion('Av Colon 3200')
  const segunda =
    await client.buscarDireccion('  av   colon 3200 ')

  assert.equal(llamadas, 1)
  assert.equal(primera[0].display_name, segunda[0].display_name)
})

test('cachea reverse geocoding por coordenada redondeada', async () => {
  const dir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'emvial-cache-')
  )
  const cachePath = path.join(dir, 'cache.json')
  let llamadas = 0

  const client = crearNominatimClient({
    cachePath,
    fetchImpl: async () => {
      llamadas += 1
      return crearRespuestaJson({
        display_name: 'ARENales 2300',
      })
    },
  })

  const primera =
    await client.obtenerDireccion(
      -38.000001,
      -57.000001
    )
  const segunda =
    await client.obtenerDireccion(
      -38.000002,
      -57.000002
    )

  assert.equal(llamadas, 1)
  assert.equal(primera, segunda)
})

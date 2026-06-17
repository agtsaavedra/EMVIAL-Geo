import test from 'node:test'
import assert from 'node:assert/strict'

import {
  mensajeExportacion,
  contarPorGeometria,
  formatearConteoGeometrias,
  primerasIntervencionesPreview,
  detalleImportacionGIS,
} from '../src/hooks/app/actions/topbarActionHelpers.mjs'

test('formatea mensajes de exportacion segun resultado', () => {
  assert.equal(
    mensajeExportacion('SHP', {
      ok: false,
    }),
    'No hay intervenciones con geometria valida para exportar en SHP.'
  )

  assert.equal(
    mensajeExportacion('GeoJSON', {
      ok: true,
      exportadas: 2,
      omitidas: 1,
    }),
    'GeoJSON exportado: 2 intervenciones. Omitidas sin geometria valida: 1.'
  )

  assert.equal(
    mensajeExportacion('KML', {
      ok: true,
      omitidas: 0,
    }),
    'KML exportado correctamente.'
  )
})

test('resume geometria e intervenciones para importacion GIS', () => {
  const intervenciones = [
    {
      nombre: 'Linea 1',
      barrio: 'Centro',
      geometriaTipo: 'Linea',
    },
    {
      obra: 'PAVIMENTACION',
      barrio: '',
      geometriaTipo: 'Punto',
    },
  ]

  assert.deepEqual(
    contarPorGeometria(intervenciones),
    {
      Linea: 1,
      Punto: 1,
    }
  )
  assert.equal(
    formatearConteoGeometrias({
      Linea: 1,
      Punto: 1,
    }),
    'Linea: 1 | Punto: 1'
  )
  assert.equal(
    primerasIntervencionesPreview(intervenciones),
    '1. Linea 1 - Centro\n2. PAVIMENTACION - Sin barrio'
  )

  const detalle = detalleImportacionGIS({
    periodoActivo: '2026-06',
    resultado: {
      total: 3,
      importables: 2,
      omitidas: 1,
      intervenciones,
    },
  })

  assert.match(detalle, /Periodo destino: 2026-06/)
  assert.match(detalle, /Geometrias: Linea: 1 \| Punto: 1/)
  assert.match(detalle, /Antes de importar se creara un backup preventivo/)
})

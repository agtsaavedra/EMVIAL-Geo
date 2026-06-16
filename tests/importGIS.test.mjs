import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

import { loadPureModule } from './helpers/loadModule.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

const {
  crearImportIntervencionDTO,
} = loadPureModule(
  'src/services/importIntervencionDTO.js',
  ['crearImportIntervencionDTO']
)

const formInicial = {
  nombre: '',
  mesTerminacion: '',
  obra: 'MICROBACHEO',
  ubicacion: '',
  barrio: '',
  estado: 'Finalizada',
  fuente: 'Carga manual',
  inspector: '',
  realizo: '',
  cuadras: '',
  metrosLineales: '',
  metrosCuadrados: '',
  descripcion: '',
  direccion: '',
  latitud: '',
  longitud: '',
  geometriaTipo: 'Punto',
  geometria: [],
}

function cargarImportGIS() {
  const source = fs
    .readFileSync(
      path.join(repoRoot, 'src/services/importGIS.js'),
      'utf-8'
    )
    .replace(
      /import\s+\{\s*formInicial\s*\}\s+from\s+'@constants\/formInicial'\s*/m,
      ''
    )
    .replace(
      /import\s+\{\s*crearImportIntervencionDTO,\s*\}\s+from\s+'@services\/importIntervencionDTO'\s*/m,
      ''
    )
    .replaceAll(
      /export async function\s+([a-zA-Z0-9_]+)/g,
      'async function $1'
    )

  const factory = new Function(
    'formInicial',
    'crearImportIntervencionDTO',
    `${source}\nreturn { importarArchivoGIS };`
  )

  return factory(
    formInicial,
    crearImportIntervencionDTO
  )
}

function archivoGeoJSON(nombre, geojson) {
  return {
    name: nombre,
    text: async () => JSON.stringify(geojson),
  }
}

const { importarArchivoGIS } = cargarImportGIS()

test('importa GeoJSON de punto como intervencion interna', async () => {
  const resultado = await importarArchivoGIS(
    archivoGeoJSON('puntos.geojson', {
      type: 'Feature',
      properties: {
        nombre: 'Punto importado',
        obra: 'ALUMBRADO LED',
        ubicacion: 'San Lorenzo 1800',
        barrio: 'AREA CENTRO',
      },
      geometry: {
        type: 'Point',
        coordinates: [-57.55, -38.01],
      },
    }),
    '2026-06'
  )

  assert.equal(resultado.total, 1)
  assert.equal(resultado.importables, 1)
  assert.equal(resultado.omitidas, 0)

  const [intervencion] = resultado.intervenciones
  assert.equal(intervencion.periodo, '2026-06')
  assert.equal(intervencion.nombre, 'Punto importado')
  assert.equal(intervencion.obra, 'ALUMBRADO LED')
  assert.equal(intervencion.geometriaTipo, 'Punto')
  assert.equal(intervencion.latitud, '-38.010000')
  assert.equal(intervencion.longitud, '-57.550000')
  assert.deepEqual(intervencion.geometria, [[-38.01, -57.55]])
})

test('importa GeoJSON de linea y conserva propiedades operativas', async () => {
  const resultado = await importarArchivoGIS(
    archivoGeoJSON('lineas.geojson', {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            NOMBRE: 'Linea secundaria',
            OBRA: 'MICROBACHEO',
            UBICACION: 'AV COLON 2100/2300',
            BARRIO: 'CENTRO',
            m_lineal: '180.5',
            cuadras: '2',
            FUENTE: 'SHP municipal',
          },
          geometry: {
            type: 'LineString',
            coordinates: [
              [-57.55, -38.01],
              [-57.56, -38.02],
            ],
          },
        },
      ],
    }),
    '2026-07'
  )

  assert.equal(resultado.importables, 1)

  const [intervencion] = resultado.intervenciones
  assert.equal(intervencion.geometriaTipo, 'Línea')
  assert.equal(intervencion.metrosLineales, '180.5')
  assert.equal(intervencion.cuadras, '2')
  assert.equal(intervencion.fuente, 'SHP municipal')
  assert.deepEqual(intervencion.geometria, [
    [-38.01, -57.55],
    [-38.02, -57.56],
  ])
  assert.equal(intervencion.latitud, '-38.020000')
  assert.equal(intervencion.longitud, '-57.560000')
})

test('importa poligonos cerrados quitando el punto repetido final', async () => {
  const resultado = await importarArchivoGIS(
    archivoGeoJSON('poligonos.geojson', {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            obra: 'PAVIMENTACION',
            metrosCuadrados: '50',
          },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-57.55, -38.01],
              [-57.56, -38.01],
              [-57.56, -38.02],
              [-57.55, -38.01],
            ]],
          },
        },
      ],
    }),
    '2026-08'
  )

  const [intervencion] = resultado.intervenciones
  assert.equal(resultado.importables, 1)
  assert.equal(intervencion.geometriaTipo, 'Polígono')
  assert.equal(intervencion.metrosCuadrados, '50')
  assert.equal(intervencion.geometria.length, 3)
})

test('omite features sin geometria GIS suficiente', async () => {
  const resultado = await importarArchivoGIS(
    archivoGeoJSON('mixto.geojson', {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [[-57.55, -38.01]],
          },
        },
        {
          type: 'Feature',
          properties: {
            nombre: 'Valida',
          },
          geometry: {
            type: 'Point',
            coordinates: [-57.55, -38.01],
          },
        },
      ],
    }),
    '2026-09'
  )

  assert.equal(resultado.total, 2)
  assert.equal(resultado.importables, 1)
  assert.equal(resultado.omitidas, 1)
  assert.equal(resultado.intervenciones[0].nombre, 'Valida')
})

import test from 'node:test'
import assert from 'node:assert/strict'

import { loadPureModule } from './helpers/loadModule.mjs'

const {
  crearFilaExcelIntervencion,
  crearIntervencionExportDTO,
  crearPropiedadesGeoJSON,
  crearPropiedadesShp,
  normalizarTipoGeometria,
} = loadPureModule(
  'src/services/exportIntervencionDTO.js',
  [
    'crearFilaExcelIntervencion',
    'crearIntervencionExportDTO',
    'crearPropiedadesGeoJSON',
    'crearPropiedadesShp',
    'normalizarTipoGeometria',
  ]
)

const intervencionBase = {
  id: 'abc-1',
  periodo: '',
  nombre: 'Linea secundaria',
  mesTerminacion: '2026-06',
  obra: 'MICROBACHEO',
  ubicacion: 'AV COLON 2100/2300 e/ BUENOS AIRES y ARENALES',
  barrio: 'AREA CENTRO',
  estado: 'Finalizada',
  inspector: 'GM',
  realizo: 'Coop. Test',
  cuadras: '2',
  metrosLineales: '215.5',
  metrosCuadrados: '',
  fuente: 'Carga manual',
  direccion: 'Av Colon 2200',
  latitud: '-38.0',
  longitud: '-57.5',
  geometriaTipo: 'Línea',
  geometria: [
    [-38.0, -57.5],
    [-38.01, -57.51],
  ],
  descripcion: 'Observacion',
  syncStatus: 'pending',
  version: 7,
  deletedAt: '2026-01-01',
}

test('normaliza tipos de geometria con y sin tilde', () => {
  assert.equal(normalizarTipoGeometria('Línea'), 'Linea')
  assert.equal(normalizarTipoGeometria('Linea'), 'Linea')
  assert.equal(normalizarTipoGeometria('Polígono'), 'Poligono')
  assert.equal(normalizarTipoGeometria('Punto'), 'Punto')
})

test('crea DTO exportable sin campos internos', () => {
  const dto = crearIntervencionExportDTO(
    intervencionBase,
    '2026-06'
  )

  assert.equal(dto.periodo, '2026-06')
  assert.equal(dto.geometriaTipo, 'Linea')
  assert.equal(dto.puntos, 2)
  assert.equal(dto.cuadras, 2)
  assert.equal(dto.metrosLineales, 215.5)
  assert.equal(dto.metrosCuadrados, null)
  assert.equal('syncStatus' in dto, false)
  assert.equal('version' in dto, false)
  assert.equal('deletedAt' in dto, false)
})

test('crea fila Excel con geometria serializada', () => {
  const fila = crearFilaExcelIntervencion(
    intervencionBase,
    '2026-06'
  )

  assert.equal(fila.Periodo, '2026-06')
  assert.equal(fila['Tipo de geometria'], 'Linea')
  assert.equal(fila['Cantidad de puntos'], 2)
  assert.equal(
    fila.Geometria,
    JSON.stringify(intervencionBase.geometria)
  )
})

test('crea propiedades GIS limpias y SHP con nombres cortos', () => {
  const geojson = crearPropiedadesGeoJSON(
    intervencionBase,
    '2026-06'
  )
  const shp = crearPropiedadesShp(
    intervencionBase,
    '2026-06'
  )

  assert.equal(geojson.observaciones, 'Observacion')
  assert.equal(geojson.geometriaTipo, 'Linea')
  assert.equal('syncStatus' in geojson, false)

  for (const key of Object.keys(shp)) {
    assert.ok(
      key.length <= 10,
      `${key} supera el limite recomendado para DBF`
    )
  }

  assert.equal(shp.geom_tipo, 'Linea')
  assert.equal(shp.m_lineal, '215.5')
})

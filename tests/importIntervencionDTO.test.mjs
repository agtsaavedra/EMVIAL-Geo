import test from 'node:test'
import assert from 'node:assert/strict'

import { loadPureModule } from './helpers/loadModule.mjs'

const {
  crearImportIntervencionDTO,
} = loadPureModule(
  'src/services/importIntervencionDTO.js',
  ['crearImportIntervencionDTO']
)

test('normaliza propiedades GIS con alias de GeoJSON y SHP', () => {
  const dto = crearImportIntervencionDTO(
    {
      NOMBRE: 'Linea importada',
      mes_term: '2026-06',
      OBRA: 'MICROBACHEO',
      UBICACION: 'AV COLON 2100/2300',
      BARRIO: 'AREA CENTRO',
      inspect: 'GM',
      REALIZO: 'Coop. Test',
      cuadras: '2',
      m_lineal: '215.5',
      m2: '',
      FUENTE: 'SHP municipal',
      DIRECCION: 'Av Colon 2200',
      obs: 'Observacion GIS',
    },
    {
      obraDefault: 'PAVIMENTACION',
    }
  )

  assert.deepEqual(dto, {
    nombre: 'Linea importada',
    mesTerminacion: '2026-06',
    obra: 'MICROBACHEO',
    ubicacion: 'AV COLON 2100/2300',
    barrio: 'AREA CENTRO',
    estado: 'Finalizada',
    inspector: 'GM',
    realizo: 'Coop. Test',
    cuadras: '2',
    metrosLineales: '215.5',
    metrosCuadrados: '',
    fuente: 'SHP municipal',
    direccion: 'Av Colon 2200',
    descripcion: 'Observacion GIS',
  })
})

test('usa obra por defecto y descarta metricas no numericas', () => {
  const dto = crearImportIntervencionDTO(
    {
      location: 'San Lorenzo 1800',
      metrosLineales: 'mucho',
      metrosCuadrados: '10.5',
    },
    {
      obraDefault: 'PAVIMENTACION',
    }
  )

  assert.equal(dto.obra, 'PAVIMENTACION')
  assert.equal(dto.ubicacion, 'San Lorenzo 1800')
  assert.equal(dto.metrosLineales, '')
  assert.equal(dto.metrosCuadrados, '10.5')
})

test('lee etiquetas con espacios provenientes de KML HTML', () => {
  const dto = crearImportIntervencionDTO({
    Obra: 'CORDON CUNETA',
    Ubicacion: 'Funes 3900',
    'Mes terminacion': '2026-07',
    'Metros lineales': '120',
    'Metros cuadrados': '30',
    Realizo: 'Equipo A',
    Observaciones: 'Desde KML',
  })

  assert.equal(dto.obra, 'CORDON CUNETA')
  assert.equal(dto.ubicacion, 'Funes 3900')
  assert.equal(dto.mesTerminacion, '2026-07')
  assert.equal(dto.metrosLineales, '120')
  assert.equal(dto.metrosCuadrados, '30')
  assert.equal(dto.realizo, 'Equipo A')
  assert.equal(dto.descripcion, 'Desde KML')
})

import test from 'node:test'
import assert from 'node:assert/strict'

import {
  crearFormularioEdicionDesdeBase,
  obtenerPuntoSeleccionadoDesdeFormulario,
  tieneCambiosSinGuardar,
} from '../src/hooks/form/formStateCore.cjs'

const formBase = {
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

test('crea formulario de edicion con defaults operativos', () => {
  const form = crearFormularioEdicionDesdeBase(
    formBase,
    {
      id: '1',
      nombre: 'Linea',
      ubicacion: 'COLON 2100/2300',
      latitud: '-38.01',
      longitud: '-57.55',
    }
  )

  assert.equal(form.id, '1')
  assert.equal(form.nombre, 'Linea')
  assert.equal(form.obra, 'MICROBACHEO')
  assert.equal(form.estado, 'Finalizada')
  assert.equal(form.fuente, 'Carga manual')
  assert.equal(form.geometriaTipo, 'Punto')
})

test('obtiene punto seleccionado desde latitud y longitud', () => {
  assert.deepEqual(
    obtenerPuntoSeleccionadoDesdeFormulario({
      latitud: '-38.01',
      longitud: '-57.55',
    }),
    [-38.01, -57.55]
  )

  assert.equal(
    obtenerPuntoSeleccionadoDesdeFormulario({
      latitud: '',
      longitud: '-57.55',
    }),
    null
  )
})

test('detecta cambios sin guardar en edicion y carga nueva', () => {
  const original = crearFormularioEdicionDesdeBase(
    formBase,
    {
      id: '1',
      nombre: 'Original',
    }
  )

  assert.equal(
    tieneCambiosSinGuardar(original, original),
    false
  )

  assert.equal(
    tieneCambiosSinGuardar(
      {
        ...original,
        nombre: 'Editado',
      },
      original
    ),
    true
  )

  assert.equal(
    tieneCambiosSinGuardar(
      {
        nombre: '',
        ubicacion: '',
        descripcion: '',
        latitud: '',
        longitud: '',
        geometria: [],
      },
      null
    ),
    false
  )

  assert.equal(
    tieneCambiosSinGuardar(
      {
        nombre: '',
        ubicacion: '',
        descripcion: '',
        latitud: '',
        longitud: '',
        geometria: [[-57.55, -38.01]],
      },
      null
    ),
    true
  )
})

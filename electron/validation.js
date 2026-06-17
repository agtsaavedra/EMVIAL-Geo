const path = require('node:path')

const ARCHIVOS_DATOS_PERMITIDOS = new Set([
  'barrios.geojson',
  'calles-mar-del-plata.geojson',
])

const TIPOS_GEOMETRIA = new Map([
  ['punto', 'Punto'],
  ['linea', 'Línea'],
  ['línea', 'Línea'],
  ['poligono', 'Polígono'],
  ['polígono', 'Polígono'],
])

const LONGITUDES = {
  id: 160,
  nombre: 180,
  mesTerminacion: 20,
  obra: 120,
  ubicacion: 800,
  barrio: 120,
  fuente: 120,
  inspector: 120,
  realizo: 160,
  cuadras: 40,
  metrosLineales: 40,
  metrosCuadrados: 40,
  descripcion: 3000,
  direccion: 800,
  latitud: 40,
  longitud: 40,
  periodo: 20,
  syncStatus: 40,
  updatedBy: 160,
  __historialAccion: 30,
  __historialOrigenId: 160,
}

const CAMPOS_TEXTO = [
  'id',
  'nombre',
  'mesTerminacion',
  'obra',
  'ubicacion',
  'barrio',
  'fuente',
  'inspector',
  'realizo',
  'cuadras',
  'metrosLineales',
  'metrosCuadrados',
  'descripcion',
  'direccion',
  'latitud',
  'longitud',
  'periodo',
  'syncStatus',
  'updatedBy',
  '__historialAccion',
  '__historialOrigenId',
]

function validarPeriodo(periodo) {
  if (!periodo) return ''

  const normalizado = String(periodo).trim()

  if (!/^\d{4}-\d{2}$/.test(normalizado)) {
    throw new Error('Periodo invalido.')
  }

  const mes = Number.parseInt(normalizado.slice(5), 10)

  if (mes < 1 || mes > 12) {
    throw new Error('Periodo invalido.')
  }

  return normalizado
}

function validarId(id) {
  const normalizado = normalizarTexto(id, 'id')

  if (!normalizado) {
    throw new Error('Id invalido.')
  }

  return normalizado
}

function validarArchivoDatos(nombreArchivo) {
  const normalizado = String(nombreArchivo || '').trim()

  if (
    !normalizado ||
    normalizado !== path.basename(normalizado) ||
    normalizado.includes('/') ||
    normalizado.includes('\\') ||
    !ARCHIVOS_DATOS_PERMITIDOS.has(normalizado)
  ) {
    throw new Error('Archivo de datos no permitido.')
  }

  return normalizado
}

function normalizarTexto(valor, campo) {
  if (valor === null || valor === undefined) return ''

  const normalizado = String(valor).trim()
  const maximo = LONGITUDES[campo] || 500

  if (normalizado.length > maximo) {
    throw new Error(`Campo ${campo} demasiado largo.`)
  }

  return normalizado
}

function normalizarFecha(valor, campo) {
  if (!valor) return campo === 'deletedAt' ? null : ''

  const fecha = new Date(valor)

  if (Number.isNaN(fecha.getTime())) {
    throw new Error(`Fecha ${campo} invalida.`)
  }

  return fecha.toISOString()
}

function normalizarVersion(valor) {
  const version = Number.parseInt(valor, 10)

  if (!Number.isFinite(version) || version < 1) {
    return 1
  }

  return version
}

function normalizarTipoGeometria(valor) {
  const clave = String(valor || 'Punto')
    .trim()
    .toLowerCase()

  const tipo = TIPOS_GEOMETRIA.get(clave)

  if (!tipo) {
    throw new Error('Tipo de geometria invalido.')
  }

  return tipo
}

function normalizarCoordenada(valor, campo) {
  const numero =
    typeof valor === 'number'
      ? valor
      : Number.parseFloat(String(valor).replace(',', '.'))

  if (!Number.isFinite(numero)) {
    throw new Error(`Coordenada ${campo} invalida.`)
  }

  if (
    (campo === 'latitud' && (numero < -90 || numero > 90)) ||
    (campo === 'longitud' && (numero < -180 || numero > 180))
  ) {
    throw new Error(`Coordenada ${campo} fuera de rango.`)
  }

  return numero
}

function normalizarPunto(punto) {
  if (!Array.isArray(punto) || punto.length < 2) {
    throw new Error('Punto de geometria invalido.')
  }

  return [
    normalizarCoordenada(punto[0], 'latitud'),
    normalizarCoordenada(punto[1], 'longitud'),
  ]
}

function normalizarGeometria(intervencion, tipo) {
  let geometria = Array.isArray(intervencion.geometria)
    ? intervencion.geometria.map(normalizarPunto)
    : []

  if (
    tipo === 'Punto' &&
    geometria.length === 0 &&
    intervencion.latitud !== undefined &&
    intervencion.longitud !== undefined &&
    String(intervencion.latitud).trim() !== '' &&
    String(intervencion.longitud).trim() !== ''
  ) {
    geometria = [[
      normalizarCoordenada(intervencion.latitud, 'latitud'),
      normalizarCoordenada(intervencion.longitud, 'longitud'),
    ]]
  }

  if (tipo === 'Línea' && geometria.length < 2) {
    throw new Error('La linea debe tener al menos dos puntos.')
  }

  if (tipo === 'Polígono' && geometria.length < 3) {
    throw new Error('El poligono debe tener al menos tres puntos.')
  }

  return geometria
}

function validarMetadataHistorial(intervencion) {
  if (
    intervencion.__historialAccion &&
    !['duplicar'].includes(intervencion.__historialAccion)
  ) {
    throw new Error('Accion de historial invalida.')
  }
}

function validarIntervencion(intervencion) {
  if (
    !intervencion ||
    typeof intervencion !== 'object' ||
    Array.isArray(intervencion)
  ) {
    throw new Error('Intervencion invalida.')
  }

  validarMetadataHistorial(intervencion)

  const tipo = normalizarTipoGeometria(
    intervencion.geometriaTipo
  )
  const geometria = normalizarGeometria(
    intervencion,
    tipo
  )

  const normalizada = {
    estado: 'Finalizada',
    geometriaTipo: tipo,
    geometria,
    createdAt: normalizarFecha(
      intervencion.createdAt,
      'createdAt'
    ),
    updatedAt: normalizarFecha(
      intervencion.updatedAt,
      'updatedAt'
    ),
    deletedAt: normalizarFecha(
      intervencion.deletedAt,
      'deletedAt'
    ),
    version: normalizarVersion(intervencion.version),
  }

  CAMPOS_TEXTO.forEach((campo) => {
    const valor = normalizarTexto(
      intervencion[campo],
      campo
    )

    if (campo === 'periodo' && valor) {
      normalizada[campo] = validarPeriodo(valor)
      return
    }

    if (valor || campo === 'id') {
      normalizada[campo] = valor
    }
  })

  return normalizada
}

function validarIntervencionesMasivo(intervenciones) {
  if (!Array.isArray(intervenciones)) {
    throw new Error('Lista de intervenciones invalida.')
  }

  if (intervenciones.length > 5000) {
    throw new Error('Demasiadas intervenciones para importar.')
  }

  return intervenciones.map(validarIntervencion)
}

module.exports = {
  validarPeriodo,
  validarId,
  validarArchivoDatos,
  validarIntervencion,
  validarIntervencionesMasivo,
}

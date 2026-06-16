/**
 * Normalizacion de propiedades externas GIS hacia el modelo de intervencion.
 *
 * Acepta nombres largos de GeoJSON, nombres cortos de SHP/DBF y variantes
 * habituales de archivos externos sin exponer esos alias al resto de la app.
 */

function texto(valor) {
  if (valor === null || valor === undefined) {
    return ''
  }

  return String(valor).trim()
}

function normalizarClave(clave) {
  return texto(clave)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
}

function crearIndicePropiedades(properties = {}) {
  return Object.entries(properties || {}).reduce(
    (indice, [clave, valor]) => {
      indice[normalizarClave(clave)] = valor
      return indice
    },
    {}
  )
}

function obtener(indice, aliases = []) {
  for (const alias of aliases) {
    const clave = normalizarClave(alias)
    const valor = indice[clave]

    if (
      valor !== undefined &&
      valor !== null &&
      texto(valor) !== ''
    ) {
      return valor
    }
  }

  return ''
}

function numeroATexto(valorEntrada) {
  const valor = texto(valorEntrada)

  if (!valor) return ''

  const numero = Number(valor)
  return Number.isFinite(numero)
    ? String(valorEntrada)
    : ''
}

export function crearImportIntervencionDTO(
  properties = {},
  opciones = {}
) {
  const indice =
    crearIndicePropiedades(properties)
  const obraDefault =
    opciones.obraDefault || ''

  return {
    nombre: texto(
      obtener(indice, [
        'nombre',
        'name',
        'titulo',
        'title',
      ])
    ),
    mesTerminacion: texto(
      obtener(indice, [
        'mesTerminacion',
        'mes_terminacion',
        'mes terminacion',
        'mes_term',
        'fecha',
      ])
    ),
    obra:
      texto(
        obtener(indice, [
          'obra',
          'tipo_obra',
          'tipoobra',
        ])
      ) || obraDefault,
    ubicacion: texto(
      obtener(indice, [
        'ubicacion',
        'location',
        'referencia',
      ])
    ),
    barrio: texto(
      obtener(indice, [
        'barrio',
        'zona',
      ])
    ),
    estado: 'Finalizada',
    inspector: texto(
      obtener(indice, [
        'inspector',
        'inspect',
      ])
    ),
    realizo: texto(
      obtener(indice, [
        'realizo',
        'realizo_por',
        'ejecutor',
      ])
    ),
    cuadras: numeroATexto(
      obtener(indice, ['cuadras'])
    ),
    metrosLineales: numeroATexto(
      obtener(indice, [
        'metrosLineales',
        'metros_lineales',
        'metros lineales',
        'm_lineal',
        'ml',
      ])
    ),
    metrosCuadrados: numeroATexto(
      obtener(indice, [
        'metrosCuadrados',
        'metros_cuadrados',
        'metros cuadrados',
        'm2',
      ])
    ),
    fuente: texto(
      obtener(indice, [
        'fuente',
        'source',
      ])
    ),
    direccion: texto(
      obtener(indice, [
        'direccion',
        'address',
        'domicilio',
      ])
    ),
    descripcion: texto(
      obtener(indice, [
        'observaciones',
        'obs',
        'descripcion',
        'description',
      ])
    ),
  }
}

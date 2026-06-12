/**
 * Servicio de exportación Excel.
 *
 * Genera un archivo .xlsx con dos hojas:
 * - Intervenciones: detalle completo de cada carga del período.
 * - Estadísticas: resumen por tipo de obra.
 *
 * Las métricas `metrosLineales` y `metrosCuadrados` ya vienen calculadas o
 * corregidas manualmente desde el formulario, por eso este servicio solo las
 * exporta tal como están guardadas.
 */

import * as XLSX from 'xlsx'

import {
  calcularStatsPorObra,
} from '@map/data/mapStats'
import {
  calcularStatsPeriodo,
} from '@services/periodoStats'

/**
 * Convierte la geometría de una intervención a texto JSON.
 *
 * Permite conservar puntos/líneas/polígonos dentro de una celda exportable.
 * Esto es útil para auditoría o para reconstruir geometrías si hiciera falta.
 */
function formatearGeometria(geometria) {
  if (
    !Array.isArray(geometria) ||
    geometria.length === 0
  ) {
    return ''
  }

  return JSON.stringify(geometria)
}

/**
 * Cuenta la cantidad de puntos asociados a la geometría de una intervención.
 */
function contarPuntos(intervencion) {
  return intervencion.geometria?.length || 0
}

/**
 * Normaliza valores vacíos para evitar `undefined` en Excel.
 */
function valorExcel(valor) {
  return valor ?? ''
}

/**
 * Convierte una intervención interna de la app a una fila tabular.
 */
function crearFilaIntervencion(
  item,
  periodoActivo
) {
  return {
    Periodo:
      valorExcel(item.periodo) ||
      valorExcel(periodoActivo),

    Nombre:
      valorExcel(item.nombre),

    'Mes de terminación':
      valorExcel(item.mesTerminacion),

    Obra:
      valorExcel(item.obra),

    Ubicación:
      valorExcel(item.ubicacion),

    Barrio:
      valorExcel(item.barrio),

    Estado:
      valorExcel(item.estado),

    Inspector:
      valorExcel(item.inspector),

    Realizó:
      valorExcel(item.realizo),

    Cuadras:
      valorExcel(item.cuadras),

    'Metros lineales':
      valorExcel(item.metrosLineales),

    'Metros cuadrados':
      valorExcel(item.metrosCuadrados),

    Fuente:
      valorExcel(item.fuente),

    Dirección:
      valorExcel(item.direccion),

    Latitud:
      valorExcel(item.latitud),

    Longitud:
      valorExcel(item.longitud),

    'Tipo de geometría':
      valorExcel(item.geometriaTipo),

    'Cantidad de puntos':
      contarPuntos(item),

    Observaciones:
      valorExcel(item.descripcion),

    Geometría:
      formatearGeometria(item.geometria),
  }
}

/**
 * Convierte una estadística por obra a una fila de Excel.
 */
function crearFilaEstadistica(item) {
  return {
    Obra:
      valorExcel(item.obra),

    Total:
      valorExcel(item.total),
  }
}

function crearFilasResumen(
  intervenciones,
  periodoActivo
) {
  const stats =
    calcularStatsPeriodo(intervenciones)

  return [
    ['Producto', 'EMVIAL Geo'],
    ['Periodo', periodoActivo || 'Sin periodo'],
    [
      'Fecha de exportacion',
      new Date().toLocaleString('es-AR'),
    ],
    ['Intervenciones', stats.total],
    ['Barrios', stats.porBarrio.length],
    ['Tipos de obra', stats.porObra.length],
    [
      'Metros lineales',
      stats.metrosLinealesTotal,
    ],
    [
      'Metros cuadrados',
      stats.metrosCuadradosTotal,
    ],
    ['Cuadras', stats.cuadrasTotal],
  ].map(([Indicador, Valor]) => ({
    Indicador,
    Valor,
  }))
}

/**
 * Exporta las intervenciones de un período a un archivo Excel.
 *
 * Devuelve true si pudo generar el archivo y false si no había datos.
 */
export function exportarExcelPeriodo(
  intervenciones = [],
  periodoActivo
) {
  if (!intervenciones.length) {
    return false
  }

  const filasIntervenciones =
    intervenciones.map((item) =>
      crearFilaIntervencion(
        item,
        periodoActivo
      )
    )

  const stats =
    calcularStatsPorObra(
      intervenciones
    )

  const filasStats =
    stats.map(crearFilaEstadistica)
  const filasResumen =
    crearFilasResumen(
      intervenciones,
      periodoActivo
    )

  const workbook =
    XLSX.utils.book_new()

  const hojaIntervenciones =
    XLSX.utils.json_to_sheet(
      filasIntervenciones
    )
  const hojaResumen =
    XLSX.utils.json_to_sheet(
      filasResumen
    )

  const hojaStats =
    XLSX.utils.json_to_sheet(
      filasStats
    )

  XLSX.utils.book_append_sheet(
    workbook,
    hojaResumen,
    'Resumen'
  )

  XLSX.utils.book_append_sheet(
    workbook,
    hojaIntervenciones,
    'Intervenciones'
  )

  XLSX.utils.book_append_sheet(
    workbook,
    hojaStats,
    'Estadísticas'
  )

  const nombreArchivo =
    `EMVIAL_${periodoActivo || 'sin_periodo'}.xlsx`

  XLSX.writeFile(
    workbook,
    nombreArchivo
  )

  return true
}

/**
 * Servicio de exportacion Excel.
 *
 * Genera un archivo .xlsx con tres hojas:
 * - Resumen: indicadores generales del periodo.
 * - Intervenciones: detalle completo de cada carga.
 * - Estadisticas: resumen por tipo de obra.
 *
 * Las metricas ya vienen calculadas o corregidas desde el formulario, por eso
 * este servicio solo las exporta tal como estan guardadas.
 */

import * as XLSX from 'xlsx'

import {
  calcularStatsPorObra,
} from '@map/data/mapStats'
import {
  crearFilaExcelIntervencion,
} from '@services/exportIntervencionDTO'
import {
  calcularStatsPeriodo,
} from '@services/periodoStats'

function valorExcel(valor) {
  return valor ?? ''
}

function crearFilaEstadistica(item) {
  return {
    Obra: valorExcel(item.obra),
    Total: valorExcel(item.total),
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
 * Exporta las intervenciones de un periodo a un archivo Excel.
 *
 * Devuelve true si pudo generar el archivo y false si no habia datos.
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
      crearFilaExcelIntervencion(
        item,
        periodoActivo
      )
    )

  const filasStats =
    calcularStatsPorObra(
      intervenciones
    ).map(crearFilaEstadistica)

  const filasResumen =
    crearFilasResumen(
      intervenciones,
      periodoActivo
    )

  const workbook =
    XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(filasResumen),
    'Resumen'
  )

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(
      filasIntervenciones
    ),
    'Intervenciones'
  )

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(filasStats),
    'Estadisticas'
  )

  const nombreArchivo =
    `EMVIAL_${periodoActivo || 'sin_periodo'}.xlsx`

  XLSX.writeFile(
    workbook,
    nombreArchivo
  )

  return true
}

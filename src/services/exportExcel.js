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

import {
  calcularStatsPorObra,
} from '@map/data/mapStats'
import {
  crearFilaExcelIntervencion,
} from '@services/exportIntervencionDTO'
import {
  calcularStatsPeriodo,
} from '@services/periodoStats'
import xlsxWriter from './xlsxWriter.cjs'

const {
  crearXlsxBlob,
} = xlsxWriter

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
function descargarBlob(blob, nombreArchivo) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = nombreArchivo
  link.click()

  URL.revokeObjectURL(url)
}

export async function exportarExcelPeriodo(
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

  const nombreArchivo =
    `EMVIAL_${periodoActivo || 'sin_periodo'}.xlsx`

  const blob = await crearXlsxBlob([
    {
      nombre: 'Resumen',
      filas: filasResumen,
    },
    {
      nombre: 'Intervenciones',
      filas: filasIntervenciones,
    },
    {
      nombre: 'Estadisticas',
      filas: filasStats,
    },
  ])

  descargarBlob(
    blob,
    nombreArchivo
  )

  return true
}

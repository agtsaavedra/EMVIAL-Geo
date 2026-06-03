/**
 * Servicio de exportación Excel.
 *
 * Genera un archivo .xlsx con dos hojas:
 * - Intervenciones: detalle completo de cada carga del período.
 * - Estadísticas: resumen por tipo de obra y geometría.
 */
import * as XLSX from 'xlsx'
import { calcularStatsPorObra } from '../map/data/mapStats'

/**
 * Convierte la geometría de una intervención a texto JSON.
 *
 * Permite conservar puntos/líneas/polígonos en una celda exportable.
 */
function formatearGeometria(geometria) {
  if (!geometria || !geometria.length) return ''

  return JSON.stringify(geometria)
}



/**
 * Cuenta la cantidad de puntos asociados a la geometría de una intervención.
 */
function contarPuntos(intervencion) {
  return intervencion.geometria?.length || 0
}

/**
 * Exporta las intervenciones de un período a un archivo Excel.
 *
 * Devuelve true si pudo generar el archivo y false si no había datos.
 */
export function exportarExcelPeriodo(intervenciones = [], periodoActivo) {
  if (!intervenciones.length) {
  return false
}

  const filasIntervenciones = intervenciones.map((item) => ({
    
    Periodo: item.periodo || periodoActivo || '',
    Nombre: item.nombre || '',
    'Mes de terminación': item.mesTerminacion || '',
    Obra: item.obra || '',
    Ubicación: item.ubicacion || '',
    Barrio: item.barrio || '',
    Estado: item.estado || '',
    Inspector: item.inspector || '',
    Realizó: item.realizo || '',
    Cuadras: item.cuadras || '',
    'Metros lineales': item.metrosLineales || '',
    'Metros cuadrados': item.metrosCuadrados || '',
    Fuente: item.fuente || '',
    Dirección: item.direccion || '',
    Latitud: item.latitud || '',
    Longitud: item.longitud || '',
    'Tipo de geometría': item.geometriaTipo || '',
    'Cantidad de puntos': contarPuntos(item),
    Observaciones: item.descripcion || '',
    Geometría: formatearGeometria(item.geometria),
  }))

  const stats = calcularStatsPorObra(intervenciones)

  const filasStats = stats.map((item) => ({
    Obra: item.obra,
    Total: item.total,
    Líneas: item.lineas,
    Puntos: item.puntos,
    Polígonos: item.poligonos,
  }))

  const workbook = XLSX.utils.book_new()

  const hojaIntervenciones =
    XLSX.utils.json_to_sheet(filasIntervenciones)

  const hojaStats =
    XLSX.utils.json_to_sheet(filasStats)

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

  const nombreArchivo = `EMVIAL_${periodoActivo || 'sin_periodo'}.xlsx`

  XLSX.writeFile(workbook, nombreArchivo)

  return true
}
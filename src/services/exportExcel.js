import * as XLSX from 'xlsx'
import { calcularStatsPorObra } from '../map/mapStats'

function formatearGeometria(geometria) {
  if (!geometria || !geometria.length) return ''

  return JSON.stringify(geometria)
}



function contarPuntos(intervencion) {
  return intervencion.geometria?.length || 0
}

export function exportarExcelPeriodo(intervenciones = [], periodoActivo) {
  if (!intervenciones.length) {
    alert('No hay intervenciones para exportar en este período.')
    return
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
}
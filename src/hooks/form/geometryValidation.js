import {
  esGeometriaLinea,
  esGeometriaPoligono,
  esGeometriaPunto,
} from './geometryType'

export function obtenerErrorGeometria(form) {
  const cantidadPuntos =
    form.geometria?.length || 0

  if (
    esGeometriaPunto(form.geometriaTipo) &&
    (!form.latitud || !form.longitud)
  ) {
    return 'Primero selecciona una ubicacion en el mapa o busca una direccion.'
  }

  if (
    esGeometriaLinea(form.geometriaTipo) &&
    cantidadPuntos < 2
  ) {
    return 'Para una linea necesitas marcar al menos 2 puntos en el mapa.'
  }

  if (
    esGeometriaPoligono(form.geometriaTipo) &&
    cantidadPuntos < 3
  ) {
    return 'Para un poligono necesitas marcar al menos 3 puntos en el mapa.'
  }

  return ''
}

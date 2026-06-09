/**
 * Servicio de métricas geométricas.
 *
 * Centraliza cálculos derivados de la geometría dibujada en el mapa.
 *
 * Métricas actuales:
 * - longitud bruta de líneas, en metros;
 * - área aproximada de polígonos, en metros cuadrados.
 *
 * Importante:
 * - La geometría interna de la app usa coordenadas [lat, lng].
 * - La longitud suma cada segmento consecutivo.
 * - Si el usuario dibuja ida y vuelta sobre la misma calle, se cuenta dos veces.
 * - El área usa una proyección local aproximada, suficiente para polígonos urbanos.
 */

const RADIO_TIERRA_METROS = 6371000

/**
 * Convierte grados a radianes.
 *
 * Las fórmulas geográficas trabajan con radianes, no con grados decimales.
 */
function gradosARadianes(grados) {
  return grados * (Math.PI / 180)
}

/**
 * Calcula la distancia geodésica aproximada entre dos puntos [lat, lng].
 *
 * Usa la fórmula de Haversine, suficiente para medir tramos urbanos con buena
 * precisión operativa sin sumar dependencias externas.
 */
function calcularDistanciaEntrePuntosMetros(
  puntoA,
  puntoB
) {
  if (!Array.isArray(puntoA) || !Array.isArray(puntoB)) {
    return 0
  }

  const [lat1, lng1] = puntoA
  const [lat2, lng2] = puntoB

  const lat1Num = Number(lat1)
  const lng1Num = Number(lng1)
  const lat2Num = Number(lat2)
  const lng2Num = Number(lng2)

  if (
    !Number.isFinite(lat1Num) ||
    !Number.isFinite(lng1Num) ||
    !Number.isFinite(lat2Num) ||
    !Number.isFinite(lng2Num)
  ) {
    return 0
  }

  const deltaLat =
    gradosARadianes(lat2Num - lat1Num)

  const deltaLng =
    gradosARadianes(lng2Num - lng1Num)

  const lat1Rad =
    gradosARadianes(lat1Num)

  const lat2Rad =
    gradosARadianes(lat2Num)

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLng / 2) ** 2

  const c =
    2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )

  return RADIO_TIERRA_METROS * c
}

/**
 * Calcula la longitud bruta de una línea en metros.
 *
 * Recorre cada par de puntos consecutivos:
 * punto 1 → punto 2
 * punto 2 → punto 3
 * etc.
 */
export function calcularLongitudLineaMetros(
  geometria
) {
  if (
    !Array.isArray(geometria) ||
    geometria.length < 2
  ) {
    return 0
  }

  let totalMetros = 0

  for (
    let index = 1;
    index < geometria.length;
    index += 1
  ) {
    totalMetros +=
      calcularDistanciaEntrePuntosMetros(
        geometria[index - 1],
        geometria[index]
      )
  }

  return totalMetros
}

/**
 * Calcula el centro latitudinal del polígono.
 *
 * Se usa para una proyección local simple: convertir grados a metros tomando
 * como referencia la latitud media del polígono.
 */
function calcularLatitudMedia(
  geometria
) {
  const sumaLatitudes =
    geometria.reduce(
      (acumulado, punto) =>
        acumulado + Number(punto[0]),
      0
    )

  return sumaLatitudes / geometria.length
}

/**
 * Convierte un punto [lat, lng] a coordenadas planas aproximadas en metros.
 *
 * Esta conversión es adecuada para áreas urbanas chicas/medianas. No pretende
 * reemplazar un cálculo geodésico GIS avanzado, pero es suficiente para
 * estimaciones operativas dentro de Mar del Plata / EMVIAL.
 */
function proyectarPuntoAMetros(
  punto,
  latitudReferencia
) {
  const [lat, lng] = punto

  const latNum = Number(lat)
  const lngNum = Number(lng)

  if (
    !Number.isFinite(latNum) ||
    !Number.isFinite(lngNum)
  ) {
    return null
  }

  const latRad =
    gradosARadianes(latNum)

  const lngRad =
    gradosARadianes(lngNum)

  const latRefRad =
    gradosARadianes(latitudReferencia)

  const x =
    RADIO_TIERRA_METROS *
    lngRad *
    Math.cos(latRefRad)

  const y =
    RADIO_TIERRA_METROS *
    latRad

  return [x, y]
}

/**
 * Calcula el área aproximada de un polígono en metros cuadrados.
 *
 * Usa fórmula de Shoelace sobre una proyección local en metros.
 * La geometría puede venir abierta o cerrada; no es necesario repetir el
 * primer punto al final.
 */
export function calcularAreaPoligonoMetrosCuadrados(
  geometria
) {
  if (
    !Array.isArray(geometria) ||
    geometria.length < 3
  ) {
    return 0
  }

  const latitudReferencia =
    calcularLatitudMedia(geometria)

  const puntosProyectados =
    geometria
      .map((punto) =>
        proyectarPuntoAMetros(
          punto,
          latitudReferencia
        )
      )
      .filter(Boolean)

  if (puntosProyectados.length < 3) {
    return 0
  }

  let suma = 0

  for (
    let index = 0;
    index < puntosProyectados.length;
    index += 1
  ) {
    const [x1, y1] =
      puntosProyectados[index]

    const [x2, y2] =
      puntosProyectados[
        (index + 1) %
          puntosProyectados.length
      ]

    suma += x1 * y2 - x2 * y1
  }

  return Math.abs(suma) / 2
}

/**
 * Formatea metros lineales para guardar en el formulario.
 *
 * Se guarda como string porque los inputs del formulario trabajan como campos
 * controlados de texto/número.
 */
export function formatearMetrosFormulario(
  metros
) {
  if (!Number.isFinite(metros) || metros <= 0) {
    return ''
  }

  return metros.toFixed(2)
}

/**
 * Formatea metros cuadrados para guardar en el formulario.
 *
 * Mantiene dos decimales para consistencia con metros lineales. El usuario
 * puede editar/redondear manualmente luego desde el formulario.
 */
export function formatearMetrosCuadradosFormulario(
  metrosCuadrados
) {
  if (
    !Number.isFinite(metrosCuadrados) ||
    metrosCuadrados <= 0
  ) {
    return ''
  }

  return metrosCuadrados.toFixed(2)
}

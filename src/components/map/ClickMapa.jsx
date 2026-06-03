import { useMapEvents } from 'react-leaflet'

import { detectarBarrio } from '@map/data/barrios'

function ClickMapa({
  form,
  setForm,
  setPuntoSeleccionado,
  obtenerDireccion,
  setCursorLinea,
  modoDibujo,
  setEdicionGeometricaIniciada,
}) {
  // =====================================================
  // HELPERS
  // =====================================================

  function esLineaOPoligono() {
    return ['Línea', 'Polígono'].includes(
      form.geometriaTipo
    )
  }

  function limpiarPreview() {
    setCursorLinea(null)
  }

  function clickSobreControlOModal(e) {
    const originalTarget =
      e.originalEvent?.target

    return (
      originalTarget?.closest?.(
        '.leaflet-control'
      ) ||
      originalTarget?.closest?.(
        '.leaflet-popup'
      ) ||
      originalTarget?.closest?.(
        '.popup-content'
      )
    )
  }

  async function actualizarDireccionPrimerPunto(
    lat,
    lon
  ) {
    const direccionPrimerPunto =
      await obtenerDireccion(lat, lon)

    setForm((prev) => ({
      ...prev,
      direccion: direccionPrimerPunto,
    }))
  }

  function agregarPuntoAGeometria({
    punto,
    lat,
    lon,
    barrioDetectado,
  }) {
    const esPrimerPunto =
      !form.geometria ||
      form.geometria.length === 0

    setForm((prev) => {
      const geometriaActual =
        prev.geometria || []

      return {
        ...prev,

        barrio: esPrimerPunto
          ? barrioDetectado
          : prev.barrio,

        latitud: esPrimerPunto
          ? lat.toFixed(6)
          : prev.latitud,

        longitud: esPrimerPunto
          ? lon.toFixed(6)
          : prev.longitud,

        geometria: [
          ...geometriaActual,
          punto,
        ],
      }
    })

    return esPrimerPunto
  }

  async function seleccionarPuntoUnico({
    punto,
    lat,
    lon,
    barrioDetectado,
  }) {
    setPuntoSeleccionado(punto)

    const direccion =
      await obtenerDireccion(lat, lon)

    setForm((prev) => ({
      ...prev,

      barrio: barrioDetectado,
      direccion,

      latitud: lat.toFixed(6),
      longitud: lon.toFixed(6),

      geometria: [punto],
    }))
  }

  // =====================================================
  // EVENTOS DEL MAPA
  // =====================================================

  useMapEvents({
    // -----------------------------------------------------
    // MOUSEMOVE
    // -----------------------------------------------------
    // Actualiza la preview punteada solo cuando:
    // - el modo dibujo está activo
    // - se está dibujando línea/polígono
    // - ya existe al menos un punto marcado

    mousemove(e) {
      if (!modoDibujo) {
        limpiarPreview()
        return
      }

      if (!esLineaOPoligono()) {
        limpiarPreview()
        return
      }

      if (
        !form.geometria ||
        form.geometria.length === 0
      ) {
        limpiarPreview()
        return
      }

      setCursorLinea([
        e.latlng.lat,
        e.latlng.lng,
      ])
    },

    // -----------------------------------------------------
    // MOUSEOUT
    // -----------------------------------------------------
    // Si el mouse sale del mapa,
    // ocultamos la línea punteada.

    mouseout() {
      limpiarPreview()
    },

    // -----------------------------------------------------
    // CLICK
    // -----------------------------------------------------
    // Maneja el click real sobre el mapa:
    // - punto único
    // - sumar puntos a línea
    // - sumar puntos a polígono
    //
    // Si el modo dibujo está apagado, no hace nada.

    async click(e) {
      if (!modoDibujo) {
        limpiarPreview()
        return
      }

      if (clickSobreControlOModal(e)) {
        return
      }

      // A partir de acá sabemos que fue un click real
      // sobre el mapa y que modifica geometría.
      setEdicionGeometricaIniciada(true)

      const lat = e.latlng.lat
      const lon = e.latlng.lng
      const punto = [lat, lon]

      const barrioDetectado =
        detectarBarrio(lat, lon)

      if (esLineaOPoligono()) {
        const esPrimerPunto =
          agregarPuntoAGeometria({
            punto,
            lat,
            lon,
            barrioDetectado,
          })

        if (esPrimerPunto) {
          await actualizarDireccionPrimerPunto(
            lat,
            lon
          )
        }

        setPuntoSeleccionado(punto)
        return
      }

      await seleccionarPuntoUnico({
        punto,
        lat,
        lon,
        barrioDetectado,
      })
    },
  })

  return null
}

export default ClickMapa

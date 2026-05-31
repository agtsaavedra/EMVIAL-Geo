import { useMapEvents } from 'react-leaflet'
import { detectarBarrio } from '../../map/barrios'

function ClickMapa({
  form,
  setForm,
  setPuntoSeleccionado,
  obtenerDireccion,
  setCursorLinea,
  modoDibujo,
  setEdicionGeometricaIniciada,
}) {
  useMapEvents({
    mousemove(e) {
      // Si el modo dibujo está apagado, nunca mostramos preview.
      if (!modoDibujo) {
        setCursorLinea(null)
        return
      }

      const dibujandoLineaOPoligono = ['Línea', 'Polígono'].includes(
        form.geometriaTipo
      )

      if (!dibujandoLineaOPoligono) {
        setCursorLinea(null)
        return
      }

      if (!form.geometria || form.geometria.length === 0) {
        setCursorLinea(null)
        return
      }

      setCursorLinea([e.latlng.lat, e.latlng.lng])
    },

    mouseout() {
      // Cuando el mouse sale del mapa, ocultamos la línea punteada.
      setCursorLinea(null)
    },

    async click(e) {
      if (!modoDibujo) {
        setCursorLinea(null)
        return
      }

      const originalTarget = e.originalEvent?.target

      if (
        originalTarget?.closest?.('.leaflet-control') ||
        originalTarget?.closest?.('.leaflet-popup') ||
        originalTarget?.closest?.('.popup-content')
      ) {
        return
      }

      // Recién acá sabemos que fue un click real sobre el mapa
      setEdicionGeometricaIniciada(true)

      const lat = e.latlng.lat
      const lon = e.latlng.lng
      const punto = [lat, lon]
      const barrioDetectado = detectarBarrio(lat, lon)

      const esLineaOPoligono = ['Línea', 'Polígono'].includes(
        form.geometriaTipo
      )

      if (esLineaOPoligono) {
        const esPrimerPunto = !form.geometria || form.geometria.length === 0

        setForm((prev) => {
          const geometriaActual = prev.geometria || []

          return {
            ...prev,
            barrio: esPrimerPunto ? barrioDetectado : prev.barrio,
            latitud: esPrimerPunto ? lat.toFixed(6) : prev.latitud,
            longitud: esPrimerPunto ? lon.toFixed(6) : prev.longitud,
            geometria: [...geometriaActual, punto],
          }
        })

        if (esPrimerPunto) {
          const direccionPrimerPunto = await obtenerDireccion(lat, lon)

          setForm((prev) => ({
            ...prev,
            direccion: direccionPrimerPunto,
          }))
        }

        setPuntoSeleccionado(punto)
        return
      }

      setPuntoSeleccionado(punto)

      const direccion = await obtenerDireccion(lat, lon)

      setForm((prev) => ({
        ...prev,
        barrio: barrioDetectado,
        direccion,
        latitud: lat.toFixed(6),
        longitud: lon.toFixed(6),
        geometria: [punto],
      }))
    },
  })

  return null
}

export default ClickMapa
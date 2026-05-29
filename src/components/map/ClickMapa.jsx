import { useMapEvents } from 'react-leaflet'
import { detectarBarrio } from '../../map/barrios'

function ClickMapa({
  form,
  setForm,
  setPuntoSeleccionado,
  obtenerDireccion,
  setCursorLinea,
}) {
  useMapEvents({
    mousemove(e) {
      const dibujandoLineaOPoligono = ['Línea', 'Polígono'].includes(
        form.geometriaTipo
      )

      if (!dibujandoLineaOPoligono) return
      if (!form.geometria || form.geometria.length === 0) return

      setCursorLinea([e.latlng.lat, e.latlng.lng])
    },

    mouseout() {
      setCursorLinea(null)
    },

    async click(e) {
      const originalTarget = e.originalEvent?.target

      if (originalTarget?.closest?.('.leaflet-control')) return

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
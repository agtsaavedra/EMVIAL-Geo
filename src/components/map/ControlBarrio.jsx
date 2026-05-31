import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

import {
  barriosGeojson,
  centroMarDelPlata,
  obtenerNombreBarrio,
} from '../../map/barrios'

function ControlBarrio({
  barrioSeleccionado,
  setBarrioSeleccionado,
  setPuntoSeleccionado,
}) {
  const map = useMap()

  useEffect(() => {
    // Ordenar barrios alfabéticamente
    const barriosOrdenados = [
      ...new Set(
        barriosGeojson.features.map(
          obtenerNombreBarrio
        )
      ),
    ].sort()

    // Crear control Leaflet
    const control = L.control({
      position: 'topright',
    })

    control.onAdd = () => {
      const container = L.DomUtil.create(
        'div',
        'map-control'
      )

      const select = L.DomUtil.create(
        'select',
        '',
        container
      )

      // opción "todos"
      const optionAll =
        document.createElement('option')

      optionAll.value = ''
      optionAll.textContent =
        'Ver todos los barrios'

      select.appendChild(optionAll)

      // barrios
      barriosOrdenados.forEach((barrio) => {
        const option =
          document.createElement('option')

        option.value = barrio
        option.textContent = barrio

        select.appendChild(option)
      })

      select.value =
        barrioSeleccionado || ''

      // evitar propagación al mapa
      L.DomEvent.disableClickPropagation(
        container
      )

      L.DomEvent.disableScrollPropagation(
        container
      )

      select.addEventListener(
        'change',
        (event) => {
          event.preventDefault()
          event.stopPropagation()

          const barrio =
            event.target.value

          setBarrioSeleccionado(
            barrio
          )

          setPuntoSeleccionado(null)

          // resetear vista
          if (!barrio) {
            map.setView(
              centroMarDelPlata,
              13
            )
            return
          }

          // zoom a barrio
          const feature =
            barriosGeojson.features.find(
              (item) =>
                obtenerNombreBarrio(
                  item
                ) === barrio
            )

          if (feature) {
            const bounds =
              L.geoJSON(
                feature
              ).getBounds()

            map.fitBounds(bounds, {
              padding: [25, 25],
            })
          }
        }
      )

      return container
    }

    control.addTo(map)

    return () => {
      control.remove()
    }
  }, [
    map,
    barrioSeleccionado,
    setBarrioSeleccionado,
    setPuntoSeleccionado,
  ])

  return null
}

export default ControlBarrio
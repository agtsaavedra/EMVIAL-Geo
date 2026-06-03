import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

import {
  barriosGeojson,
  centroMarDelPlata,
  obtenerNombreBarrio,

} from '@map/data/barrios'

function ControlBarrio({
  barrioSeleccionado,
  setBarrioSeleccionado,
  setPuntoSeleccionado,
  intervenciones,
}) {
  const map = useMap()



  useEffect(() => {

      const conteoPorBarrio =
    intervenciones.reduce((acc, intervencion) => {
      const barrio = intervencion.barrio

      if (!barrio) return acc

      acc[barrio] = (acc[barrio] || 0) + 1

      return acc
    }, {})
    // Ordenar barrios alfabéticamente
    const todosLosBarrios = [
      ...new Set(
        barriosGeojson.features.map(
          obtenerNombreBarrio
        )
      ),
    ].sort()

    const barriosConIntervenciones =
      todosLosBarrios.filter(
        (barrio) =>
          (conteoPorBarrio[barrio] || 0) > 0
      )

    const barriosSinIntervenciones =
      todosLosBarrios.filter(
        (barrio) =>
          !conteoPorBarrio[barrio]
      )

    const barriosOrdenados = [
      ...barriosConIntervenciones,
      ...barriosSinIntervenciones,
    ]

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
        const cantidad =
          conteoPorBarrio[barrio] || 0

        option.textContent =
          cantidad > 0
            ? `${barrio} (${cantidad})`
            : barrio

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
      intervenciones,
      
  ])

  return null
}

export default ControlBarrio
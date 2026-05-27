import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMapEvents,
  useMap,
} from 'react-leaflet'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import '../utils/mapIcons'
import L from 'leaflet'
import barriosGeojsonRaw from '../data/barrios.geojson?raw'

const barriosGeojson = JSON.parse(barriosGeojsonRaw)
const centroMarDelPlata = [-38.0055, -57.5426]

function obtenerNombreBarrio(feature) {
  if (!feature || !feature.properties) return 'Sin nombre'

  return (
    feature.properties.soc_fomen ||
    feature.properties.nombre ||
    feature.properties.NOMBRE ||
    feature.properties.BARRIO ||
    feature.properties.barrio ||
    'Sin nombre'
  )
}

function estiloBarrio(feature, barrioSeleccionado) {
  const nombre = obtenerNombreBarrio(feature)
  const seleccionado = barrioSeleccionado && nombre === barrioSeleccionado
  const color = feature?.properties?.colorb || '#2563eb'

  return {
    color: seleccionado ? '#111827' : color,
    weight: seleccionado ? 4 : 2,
    fillColor: color,
    fillOpacity: seleccionado ? 0.42 : 0.14,
  }
}

function configurarBarrio(feature, layer) {
  const nombre = obtenerNombreBarrio(feature)

  layer.bindTooltip(nombre, {
    permanent: false,
    direction: 'center',
  })

  layer.on({
    mouseover: () => {
      layer.setStyle({
        weight: 3,
        fillOpacity: 0.35,
      })
    },
    mouseout: () => {
      layer.setStyle(estiloBarrio(feature, null))
    },
  })
}

function ClickMapa({ setForm, setPuntoSeleccionado, obtenerDireccion }) {
  useMapEvents({
    async click(e) {
      const originalTarget = e.originalEvent?.target

      if (originalTarget?.closest?.('.leaflet-control')) {
        return
      }

      const lat = e.latlng.lat
      const lon = e.latlng.lng

      setPuntoSeleccionado([lat, lon])

      const direccion = await obtenerDireccion(lat, lon)

      setForm((prev) => ({
        ...prev,
        direccion,
        latitud: lat.toFixed(6),
        longitud: lon.toFixed(6),
      }))
    },
  })

  return null
}

function ControlBarrio({
  barrioSeleccionado,
  setBarrioSeleccionado,
  setPuntoSeleccionado,
}) {
  const map = useMap()

  useEffect(() => {
    const barriosOrdenados = [
      ...new Set(
        barriosGeojson.features.map((feature) =>
          obtenerNombreBarrio(feature)
        )
      ),
    ].sort()

    const control = L.control({ position: 'topright' })

    control.onAdd = () => {
      const container = L.DomUtil.create('div', 'map-control leaflet-bar')
      const select = L.DomUtil.create('select', '', container)

      const opcionTodos = document.createElement('option')
      opcionTodos.value = ''
      opcionTodos.textContent = 'Ver todos los barrios'
      select.appendChild(opcionTodos)

      barriosOrdenados.forEach((barrio) => {
        const option = document.createElement('option')
        option.value = barrio
        option.textContent = barrio
        select.appendChild(option)
      })

      select.value = barrioSeleccionado || ''

      L.DomEvent.disableClickPropagation(container)
      L.DomEvent.disableScrollPropagation(container)

      select.addEventListener('change', (event) => {
        event.preventDefault()
        event.stopPropagation()

        const barrio = event.target.value

        setBarrioSeleccionado(barrio)
        setPuntoSeleccionado(null)

        if (!barrio) {
          map.setView(centroMarDelPlata, 13)
          return
        }

        const feature = barriosGeojson.features.find(
          (item) => obtenerNombreBarrio(item) === barrio
        )

        if (feature) {
          const bounds = L.geoJSON(feature).getBounds()
          map.fitBounds(bounds, { padding: [25, 25] })
        }
      })

      return container
    }

    control.addTo(map)

    return () => {
      control.remove()
    }
  }, [map, barrioSeleccionado, setBarrioSeleccionado, setPuntoSeleccionado])

  return null
}

function CentrarMapa({ punto }) {
  const map = useMap()

  useEffect(() => {
    if (punto) {
      map.setView(punto, 16)
    }
  }, [map, punto])

  return null
}

function MapView({
  intervencionesFiltradas = [],
  puntoSeleccionado,
  setPuntoSeleccionado,
  setForm,
  obtenerDireccion,
  barrioSeleccionado,
  setBarrioSeleccionado,
}) {
  const barriosFiltrados = {
    ...barriosGeojson,
    features: barrioSeleccionado
      ? barriosGeojson.features.filter(
          (feature) => obtenerNombreBarrio(feature) === barrioSeleccionado
        )
      : barriosGeojson.features,
  }

  return (
    <div className="map-real">
      <MapContainer
        center={centroMarDelPlata}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <GeoJSON
          key={barrioSeleccionado || 'todos-los-barrios'}
          data={barriosFiltrados}
          style={(feature) => estiloBarrio(feature, barrioSeleccionado)}
          onEachFeature={configurarBarrio}
        />

        <ControlBarrio
          barrioSeleccionado={barrioSeleccionado}
          setBarrioSeleccionado={setBarrioSeleccionado}
          setPuntoSeleccionado={setPuntoSeleccionado}
        />

        <ClickMapa
          setForm={setForm}
          setPuntoSeleccionado={setPuntoSeleccionado}
          obtenerDireccion={obtenerDireccion}
        />

        <CentrarMapa punto={puntoSeleccionado} />

        {puntoSeleccionado && (
          <Marker position={puntoSeleccionado}>
            <Popup>Ubicación seleccionada</Popup>
          </Marker>
        )}

        {intervencionesFiltradas
          .filter(
            (intervencion) =>
              intervencion.latitud && intervencion.longitud
          )
          .map((intervencion) => (
            <Marker
              key={intervencion.id}
              position={[
                parseFloat(intervencion.latitud),
                parseFloat(intervencion.longitud),
              ]}
            >
              <Popup>
                <strong>
                  {intervencion.area} — {intervencion.tipoIntervencion}
                </strong>
                <br />

                {intervencion.subtipo && (
                  <>
                    {intervencion.subtipo}
                    <br />
                  </>
                )}

                Estado: {intervencion.estado}
                <br />

                {intervencion.barrio && (
                  <>
                    Barrio: {intervencion.barrio}
                    <br />
                  </>
                )}

                {intervencion.fecha && (
                  <>
                    Fecha: {intervencion.fecha}
                    <br />
                  </>
                )}

                {intervencion.cantidad && (
                  <>
                    Cantidad: {intervencion.cantidad} {intervencion.unidad}
                    <br />
                  </>
                )}

                {intervencion.direccion}
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  )
}

export default MapView
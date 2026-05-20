import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import '../utils/mapIcons'
import L from 'leaflet'
import barriosGeojsonRaw from '../data/barrios.geojson?raw'

const barriosGeojson = JSON.parse(barriosGeojsonRaw)

const centroMarDelPlata = [-38.0055, -57.5426]

function estiloBarrio(feature, barrioSeleccionado) {
  const nombre = obtenerNombreBarrio(feature)
  const seleccionado = barrioSeleccionado && nombre === barrioSeleccionado

  const color = feature.properties.colorb || '#2563eb'

  return {
    color: seleccionado ? '#111827' : color,
    weight: seleccionado ? 4 : 2,
    fillColor: color,
    fillOpacity: seleccionado ? 0.45 : 0.22,
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

const barrios = {
  'Centro': [-38.0009, -57.5458],
  'La Perla': [-37.9928, -57.5486],
  'Nueva Pompeya': [-37.9878, -57.5611],
  'Los Troncos': [-38.0178, -57.5352],
  'Playa Grande': [-38.0199, -57.5311],
  'Puerto': [-38.0524, -57.5391],
  'Punta Mogotes': [-38.0761, -57.5447],
  'Peralta Ramos Oeste': [-38.0622, -57.5949],
  'Las Heras': [-38.0336, -57.5904],
  'San José': [-38.0121, -57.5594],
  'Don Bosco': [-38.0052, -57.5682],
  'Villa Primera': [-37.9872, -57.5593],
  'Caisamar': [-37.9596, -57.5844],
  'Constitución': [-37.9655, -57.5495],
  'Parque Luro': [-37.9755, -57.5539],
  'Alfar': [-38.0932, -57.5527],
}

function ClickMapa({ setForm, setPuntoSeleccionado, obtenerDireccion }) {
  useMapEvents({
    async click(e) {
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

function ControlBarrio({ barrioSeleccionado, setBarrioSeleccionado }) {
  const map = useMap()

  function cambiarBarrio(e) {
    const barrio = e.target.value
    setBarrioSeleccionado(barrio)

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
  }

  const barriosOrdenados = barriosGeojson.features
    .map((feature) => obtenerNombreBarrio(feature))
    .sort()

  return (
    <div
      className="map-control"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <select value={barrioSeleccionado} onChange={cambiarBarrio}>
        <option value="">Ver todos los barrios</option>

        {barriosOrdenados.map((barrio) => (
          <option key={barrio} value={barrio}>
            {barrio}
          </option>
        ))}
      </select>
    </div>
  )
}

function CentrarMapa({ punto }) {
  const map = useMap()

  if (punto) {
    map.setView(punto, 16)
  }

  return null
}

function MapView({
  activosFiltrados,
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

        {activosFiltrados
          .filter((activo) => activo.latitud && activo.longitud)
          .map((activo) => (
            <Marker
              key={activo.id}
              position={[
                parseFloat(activo.latitud),
                parseFloat(activo.longitud),
              ]}
            >
              <Popup>
                <strong>{activo.tipo}</strong>
                <br />
                {activo.direccion}
                <br />
                Estado: {activo.estado}
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  )
}

export default MapView
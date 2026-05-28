import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  Polyline,
  Polygon,
  useMapEvents,
  useMap,
} from 'react-leaflet'
import { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import '../utils/mapIcons'
import L from 'leaflet'
import * as turf from '@turf/turf'
import barriosGeojsonRaw from '../data/barrios.geojson?raw'
import MapActions from './MapActions'
import { obtenerColorIntervencion } from '../utils/mapColors'


const barriosGeojson = JSON.parse(barriosGeojsonRaw)
const centroMarDelPlata = [-38.0055, -57.5426]

function obtenerNombreBarrio(feature) {
  return feature?.properties?.soc_fomen || 'Sin nombre'
}

function detectarBarrio(lat, lon) {
  const punto = turf.point([lon, lat])

  const barrio = barriosGeojson.features.find((feature) =>
    turf.booleanPointInPolygon(punto, feature)
  )

  return barrio ? obtenerNombreBarrio(barrio) : ''
}

function estiloBarrio(feature, barrioSeleccionado) {
  const nombre = obtenerNombreBarrio(feature)
  const seleccionado = barrioSeleccionado && nombre === barrioSeleccionado
  const color = feature?.properties?.colorb || '#2563eb'

  return {
    color: seleccionado ? '#111827' : color,
    weight: seleccionado ? 4 : 2,
    fillColor: color,
    fillOpacity: seleccionado ? 0.42 : 0.12,
  }
}

function configurarBarrio(feature, layer) {
  const nombre = obtenerNombreBarrio(feature)

  layer.bindTooltip(nombre, {
    permanent: false,
    direction: 'center',
  })
}


function crearIconoColor(color) {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: ${color};
        border: 3px solid white;
        border-radius: 999px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.35);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}


function ClickMapa({
  form,
  setForm,
  setPuntoSeleccionado,
  obtenerDireccion,
  setCursorLinea,
}) {
  useMapEvents({
    mousemove(e) {
      if (!['Línea', 'Polígono'].includes(form.geometriaTipo)) return
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
      const barrioDetectado = detectarBarrio(lat, lon)

      if (form.geometriaTipo === 'Línea' || form.geometriaTipo === 'Polígono') {
        let direccionPrimerPunto = ''

        setForm((prev) => {
          const geometriaActual = prev.geometria || []
          const esPrimerPunto = geometriaActual.length === 0

          return {
            ...prev,
            barrio: esPrimerPunto ? barrioDetectado : prev.barrio,
            latitud: esPrimerPunto ? lat.toFixed(6) : prev.latitud,
            longitud: esPrimerPunto ? lon.toFixed(6) : prev.longitud,
            geometria: [...geometriaActual, [lat, lon]],
          }
        })

        if (!form.geometria || form.geometria.length === 0) {
          direccionPrimerPunto = await obtenerDireccion(lat, lon)

          setForm((prev) => ({
            ...prev,
            direccion: direccionPrimerPunto,
          }))
        }

        setPuntoSeleccionado([lat, lon])
        return
      }

      setPuntoSeleccionado([lat, lon])

      const direccion = await obtenerDireccion(lat, lon)

      setForm((prev) => ({
        ...prev,
        barrio: barrioDetectado,
        direccion,
        latitud: lat.toFixed(6),
        longitud: lon.toFixed(6),
        geometria: [[lat, lon]],
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
      ...new Set(barriosGeojson.features.map(obtenerNombreBarrio)),
    ].sort()

    const control = L.control({ position: 'topright' })

    control.onAdd = () => {
      const container = L.DomUtil.create('div', 'map-control leaflet-bar')
      const select = L.DomUtil.create('select', '', container)

      const optionAll = document.createElement('option')
      optionAll.value = ''
      optionAll.textContent = 'Ver todos los barrios'
      select.appendChild(optionAll)

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
    return () => control.remove()
  }, [map, barrioSeleccionado, setBarrioSeleccionado, setPuntoSeleccionado])

  return null
}

function CentrarMapa({ punto, geometriaTipo }) {
  const map = useMap()

  useEffect(() => {
    if (punto && geometriaTipo === 'Punto') {
      map.setView(punto, 16)
    }
  }, [map, punto, geometriaTipo])

  return null
}

function InvalidarTamañoMapa() {
  const map = useMap()

  useEffect(() => {
    const invalidar = () => {
      map.invalidateSize()
    }

    const timers = [
      setTimeout(invalidar, 100),
      setTimeout(invalidar, 300),
      setTimeout(invalidar, 600),
    ]

    window.addEventListener('resize', invalidar)

    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener('resize', invalidar)
    }
  })

  return null
}
function MapView({
  form,
  intervencionesFiltradas = [],
  intervencionEditandoId,
  puntoSeleccionado,
  setPuntoSeleccionado,
  setForm,
  obtenerDireccion,
  barrioSeleccionado,
  setBarrioSeleccionado,
  mostrarBarrios,
  setMostrarBarrios,
}) {
  const [cursorLinea, setCursorLinea] = useState(null)

  const barriosFiltrados = {
    ...barriosGeojson,
    features: barrioSeleccionado
      ? barriosGeojson.features.filter(
        (feature) => obtenerNombreBarrio(feature) === barrioSeleccionado
      )
      : barriosGeojson.features,
  }

  const intervencionesVisibles = intervencionesFiltradas.filter(
    (intervencion) => intervencion.id !== intervencionEditandoId
  )

const statsPorObra = Object.values(
  intervencionesVisibles.reduce((acc, intervencion) => {
    const obra = intervencion.obra || 'Sin obra'

    if (!acc[obra]) {
      acc[obra] = {
        obra,
        total: 0,
        lineas: 0,
        puntos: 0,
        poligonos: 0,
      }
    }

    acc[obra].total += 1

    if (intervencion.geometriaTipo === 'Línea') {
      acc[obra].lineas += 1
    }

    if (intervencion.geometriaTipo === 'Punto') {
      acc[obra].puntos += 1
    }

    if (intervencion.geometriaTipo === 'Polígono') {
      acc[obra].poligonos += 1
    }

    return acc
  }, {})
)

  const colorFormulario = obtenerColorIntervencion(form)

  const previewLinea =
    ['Línea', 'Polígono'].includes(form.geometriaTipo) &&
      form.geometria?.length > 0 &&
      cursorLinea
      ? [form.geometria[form.geometria.length - 1], cursorLinea]
      : null

  const cierrePoligono =
    form.geometriaTipo === 'Polígono' &&
      form.geometria?.length > 1 &&
      cursorLinea
      ? [cursorLinea, form.geometria[0]]
      : null

  function deshacerPunto() {
    let nuevoUltimoPunto = null

    setForm((prev) => {
      const nuevaGeometria = (prev.geometria || []).slice(0, -1)
      nuevoUltimoPunto = nuevaGeometria[nuevaGeometria.length - 1] || null

      return {
        ...prev,
        geometria: nuevaGeometria,
        latitud: nuevoUltimoPunto ? nuevoUltimoPunto[0].toFixed(6) : '',
        longitud: nuevoUltimoPunto ? nuevoUltimoPunto[1].toFixed(6) : '',
        barrio: nuevaGeometria.length === 0 ? '' : prev.barrio,
      }
    })

    setPuntoSeleccionado(nuevoUltimoPunto)
    setCursorLinea(null)
  }



  function limpiarUbicacion() {
    setForm((prev) => ({
      ...prev,
      direccion: '',
      latitud: '',
      longitud: '',
      barrio: '',
      geometria: [],
    }))

    setPuntoSeleccionado(null)
    setCursorLinea(null)
  }

  return (
    <div className="map-area">
      <div className="map-real">

        <MapContainer
          center={centroMarDelPlata}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <InvalidarTamañoMapa />
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {mostrarBarrios && (
            <GeoJSON
              key={barrioSeleccionado || 'todos-los-barrios'}
              data={barriosFiltrados}
              style={(feature) => estiloBarrio(feature, barrioSeleccionado)}
              onEachFeature={configurarBarrio}
            />
          )}

          <ControlBarrio
            barrioSeleccionado={barrioSeleccionado}
            setBarrioSeleccionado={setBarrioSeleccionado}
            setPuntoSeleccionado={setPuntoSeleccionado}
          />

          <ClickMapa
            form={form}
            setForm={setForm}
            setPuntoSeleccionado={setPuntoSeleccionado}
            obtenerDireccion={obtenerDireccion}
            setCursorLinea={setCursorLinea}
          />

          <CentrarMapa
            punto={puntoSeleccionado}
            geometriaTipo={form.geometriaTipo}
          />

          {form.geometriaTipo === 'Línea' && form.geometria?.length > 0 && (
            <Polyline
              positions={form.geometria}
              pathOptions={{ color: colorFormulario, weight: 5 }}
            />
          )}

          {form.geometriaTipo === 'Polígono' && form.geometria?.length > 2 && (
            <Polygon
              positions={form.geometria}
              pathOptions={{
                color: colorFormulario,
                weight: 4,
                fillColor: colorFormulario,
                fillOpacity: 0.25,
              }}
            />
          )}

          {previewLinea && (
            <Polyline
              positions={previewLinea}
              pathOptions={{
                color: colorFormulario,
                weight: 4,
                dashArray: '8 8',
                opacity: 0.7,
              }}
            />
          )}

          {cierrePoligono && (
            <Polyline
              positions={cierrePoligono}
              pathOptions={{
                color: colorFormulario,
                weight: 3,
                dashArray: '4 8',
                opacity: 0.55,
              }}
            />
          )}

          {puntoSeleccionado && form.geometriaTipo === 'Punto' && (
            <Marker
              position={puntoSeleccionado}
              icon={crearIconoColor(colorFormulario)}
            >
              <Popup>Ubicación seleccionada</Popup>
            </Marker>
          )}

          {intervencionesVisibles.map((intervencion) => {
            const color = obtenerColorIntervencion(intervencion)

            if (
              intervencion.geometriaTipo === 'Línea' &&
              intervencion.geometria?.length > 1
            ) {
              return (
                <Polyline
                  key={intervencion.id}
                  positions={intervencion.geometria}
                  pathOptions={{ color, weight: 5 }}
                >
                  <Popup>
                    <strong>{intervencion.obra}</strong>
                    <br />
                    {intervencion.nombre}
                    <br />
                    {intervencion.ubicacion}
                  </Popup>
                </Polyline>
              )
            }

            if (
              intervencion.geometriaTipo === 'Polígono' &&
              intervencion.geometria?.length > 2
            ) {
              return (
                <Polygon
                  key={intervencion.id}
                  positions={intervencion.geometria}
                  pathOptions={{
                    color,
                    weight: 4,
                    fillColor: color,
                    fillOpacity: 0.25,
                  }}
                >
                  <Popup>
                    <strong>{intervencion.obra}</strong>
                    <br />
                    {intervencion.nombre}
                    <br />
                    {intervencion.ubicacion}
                  </Popup>
                </Polygon>
              )
            }

            if (intervencion.latitud && intervencion.longitud) {
              return (
                <Marker
                  key={intervencion.id}
                  position={[
                    parseFloat(intervencion.latitud),
                    parseFloat(intervencion.longitud),
                  ]}
                  icon={crearIconoColor(color)}
                >
                  <Popup>
                    <strong>{intervencion.obra}</strong>
                    <br />
                    {intervencion.nombre}
                    <br />
                    {intervencion.ubicacion}
                  </Popup>
                </Marker>
              )
            }

            return null
          })}
        </MapContainer>
      </div>

      <MapActions
        mostrarBarrios={mostrarBarrios}
        setMostrarBarrios={setMostrarBarrios}
        geometriaTipo={form.geometriaTipo}
        cantidadPuntos={form.geometria?.length || 0}
        deshacerPunto={deshacerPunto}
        limpiarUbicacion={limpiarUbicacion}
        statsPorObra={statsPorObra}
      />
    </div>
  )
}

export default MapView
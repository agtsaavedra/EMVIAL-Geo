import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
} from 'react-leaflet'

import { useState } from 'react'
import 'leaflet/dist/leaflet.css'

import MapActions from './MapActions'
import ControlBarrio from './ControlBarrio'
import ClickMapa from './ClickMapa'
import MapCenter from './MapCenter'
import MapInvalidator from './MapInvalidator'
import IntervencionesLayer from './IntervencionesLayer'
import GeometryPreview from './GeometryPreview'

import { crearIconoColor } from '../../map/mapIcons'
import { obtenerColorIntervencion } from '../../map/mapColors'

import {
  centroMarDelPlata,
  estiloBarrio,
  configurarBarrio,
} from '../../map/barrios'

import {
  obtenerBarriosFiltrados,
  obtenerIntervencionesVisibles,
  obtenerStatsMapa,
} from '../../map/mapViewData'

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
  editarIntervencion,
}) {
  // =====================================================
  // ESTADO INTERNO DEL MAPA
  // =====================================================
  // Guarda la posición actual del mouse mientras se está
  // dibujando una línea o un polígono.
  // Esto permite mostrar una línea punteada de previsualización.
  const [cursorLinea, setCursorLinea] = useState(null)

  // =====================================================
  // DATOS DERIVADOS DEL MAPA
  // =====================================================
  // Estas funciones están separadas en mapViewData.js para que
  // MapView se encargue principalmente de coordinar y renderizar.

  // GeoJSON de barrios filtrado según el barrio seleccionado.
  const barriosFiltrados = obtenerBarriosFiltrados(barrioSeleccionado)

  // Intervenciones visibles en el mapa.
  // Si una intervención está siendo editada, se oculta su versión guardada
  // para evitar verla duplicada junto con la geometría activa del formulario.
  const intervencionesVisibles = obtenerIntervencionesVisibles(
    intervencionesFiltradas,
    intervencionEditandoId
  )

  // Estadísticas compactas por obra para la barra inferior del mapa.
  const statsPorObra = obtenerStatsMapa(intervencionesVisibles)

  // Color que se usa para la geometría que se está cargando/editando.
  const colorFormulario = obtenerColorIntervencion(form)

  // =====================================================
  // ACCIONES SOBRE GEOMETRÍA EN EDICIÓN
  // =====================================================

  function deshacerPunto() {
    let nuevoUltimoPunto = null

    setForm((prev) => {
      const nuevaGeometria = (prev.geometria || []).slice(0, -1)

      nuevoUltimoPunto =
        nuevaGeometria[nuevaGeometria.length - 1] || null

      return {
        ...prev,
        geometria: nuevaGeometria,
        latitud: nuevoUltimoPunto
          ? nuevoUltimoPunto[0].toFixed(6)
          : '',
        longitud: nuevoUltimoPunto
          ? nuevoUltimoPunto[1].toFixed(6)
          : '',
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

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="map-area">
      <div className="map-real">
        <MapContainer
          center={centroMarDelPlata}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          {/* Recalcula el tamaño real del mapa cuando cambia el layout */}
          <MapInvalidator />

          {/* Capa base OpenStreetMap */}
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Capa GeoJSON de barrios */}
          {mostrarBarrios && (
            <GeoJSON
              key={barrioSeleccionado || 'todos-los-barrios'}
              data={barriosFiltrados}
              style={(feature) =>
                estiloBarrio(feature, barrioSeleccionado)
              }
              onEachFeature={configurarBarrio}
            />
          )}

          {/* Selector Leaflet de barrios */}
          <ControlBarrio
            barrioSeleccionado={barrioSeleccionado}
            setBarrioSeleccionado={setBarrioSeleccionado}
            setPuntoSeleccionado={setPuntoSeleccionado}
          />

          {/* Captura clicks del usuario sobre el mapa */}
          <ClickMapa
            form={form}
            setForm={setForm}
            setPuntoSeleccionado={setPuntoSeleccionado}
            obtenerDireccion={obtenerDireccion}
            setCursorLinea={setCursorLinea}
          />

          {/* Centra el mapa cuando se selecciona un punto */}
          <MapCenter
            punto={puntoSeleccionado}
            geometriaTipo={form.geometriaTipo}
          />

          {/* Dibuja línea/polígono en edición y su preview punteada */}
          <GeometryPreview
            form={form}
            cursorLinea={cursorLinea}
            colorFormulario={colorFormulario}
          />

          {/* Marcador temporal cuando se está cargando/editando un punto */}
          {puntoSeleccionado && form.geometriaTipo === 'Punto' && (
            <Marker
              position={puntoSeleccionado}
              icon={crearIconoColor(colorFormulario)}
            >
              <Popup>Ubicación seleccionada</Popup>
            </Marker>
          )}

          {/* Intervenciones guardadas del periodo/filtros activos */}
          <IntervencionesLayer
            intervenciones={intervencionesVisibles}
            editarIntervencion={editarIntervencion}
          />
        </MapContainer>
      </div>

      {/* Barra inferior del mapa: capas, acciones y estadísticas */}
      <MapActions
        mostrarBarrios={mostrarBarrios}
        setMostrarBarrios={setMostrarBarrios}
        geometriaTipo={form.geometriaTipo}
        cantidadPuntos={form.geometria?.length || 0}
        deshacerPunto={deshacerPunto}
        limpiarUbicacion={limpiarUbicacion}
        statsPorObra={statsPorObra}
        hayUbicacion={
          Boolean(form.direccion) ||
          Boolean(form.latitud) ||
          Boolean(form.longitud) ||
          Boolean(form.geometria?.length)
        }
      />
    </div>
  )
}


export default MapView



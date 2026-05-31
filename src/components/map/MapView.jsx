import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
} from 'react-leaflet'
import MapBarrioFocus from './MapBarrioFocus'

import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'

import MapActions from './MapActions'
import ControlBarrio from './ControlBarrio'
import GeometryControl from './GeometryControl'
import ClickMapa from './ClickMapa'
import MapCenter from './MapCenter'
import MapInvalidator from './MapInvalidator'
import IntervencionesLayer from './IntervencionesLayer'
import GeometryPreview from './GeometryPreview'
import MapFocus from './MapFocus'

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
  intervencionEnfocada,
  modoDibujo,
  setModoDibujo,
  sidebarAbierto,
  enfocarIntervencion,
  assetsPanelAbierto,
}) {
  // =====================================================
  // ESTADO INTERNO DEL MAPA
  // =====================================================
  // Guarda la posición actual del mouse mientras se está
  // dibujando una línea o un polígono.
  // Esto permite mostrar una línea punteada de previsualización.
  const [cursorLinea, setCursorLinea] = useState(null)
  const [redibujandoGeometria, setRedibujandoGeometria] =
    useState(false)

  const geometriaOriginalRef = useRef(null)

  const [edicionGeometricaIniciada, setEdicionGeometricaIniciada] =
    useState(false)
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

  const ocultarIntervencionEditada =
    redibujandoGeometria ||
    (
      modoDibujo &&
      intervencionEditandoId &&
      form.geometriaTipo === 'Polígono'
    )

  const intervencionesMapa =
    ocultarIntervencionEditada
      ? intervencionesVisibles.filter(
        (intervencion) =>
          intervencion.id !== intervencionEditandoId
      )
      : intervencionesVisibles
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

if (intervencionEditandoId) {
  setRedibujandoGeometria(true)
  setEdicionGeometricaIniciada(true)
}
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

    // Si estoy editando una intervención existente,
    // oculto temporalmente la geometría guardada
    // para redibujarla desde cero.
    if (intervencionEditandoId) {
      setRedibujandoGeometria(true)
    }
  }

  function restaurarGeometriaOriginal() {
    const original = geometriaOriginalRef.current

    if (!original) return

    setForm((prev) => ({
      ...prev,
      geometriaTipo: original.geometriaTipo,
      geometria: original.geometria,
      direccion: original.direccion,
      latitud: original.latitud,
      longitud: original.longitud,
      barrio: original.barrio,
    }))

    setCursorLinea(null)
    setPuntoSeleccionado(null)

    setRedibujandoGeometria(false)
  }

  useEffect(() => {
    if (!intervencionEditandoId) {
      setRedibujandoGeometria(false)
    }
  }, [intervencionEditandoId])


  useEffect(() => {
    if (!intervencionEditandoId) {
      geometriaOriginalRef.current = null
      setEdicionGeometricaIniciada(false)
      return
    }

    const original = intervencionesFiltradas.find(
      (item) => item.id === intervencionEditandoId
    )

    if (!original) return

    geometriaOriginalRef.current = {
      geometriaTipo: original.geometriaTipo || 'Punto',
      geometria: original.geometria || [],
      direccion: original.direccion || '',
      latitud: original.latitud || '',
      longitud: original.longitud || '',
      barrio: original.barrio || '',
    }

    setEdicionGeometricaIniciada(false)
  }, [intervencionEditandoId, intervencionesFiltradas])

  function cambiarGeometriaTipo(tipo) {
    // Si todavía no empezó a editar geometría,
    // cambiar tipo NO destruye el original.
    if (
      intervencionEditandoId &&
      !edicionGeometricaIniciada
    ) {
      setForm((prev) => ({
        ...prev,
        geometriaTipo: tipo,
      }))

      return
    }

    setForm((prev) => ({
      ...prev,
      geometriaTipo: tipo,
      geometria: [],
      latitud: '',
      longitud: '',
    }))

    setPuntoSeleccionado(null)
    setCursorLinea(null)
  }
  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="map-area">
      <div
        className="map-real"
        onMouseLeave={() => {
          // Si el mouse sale físicamente del mapa,
          // ocultamos la preview punteada.
          setCursorLinea(null)
        }}
      >
        {modoDibujo && (
          <GeometryControl
            geometriaTipo={form.geometriaTipo}
            setGeometriaTipo={cambiarGeometriaTipo}
          />)}

        {modoDibujo && (
          <div className="drawing-mode-banner">
            <strong>✏️ Dibujo</strong>
            <span>
              {form.geometriaTipo === 'Punto'
                ? 'Seleccionar ubicación'
                : `${form.geometriaTipo} · ${form.geometria?.length || 0
                } pts`}
            </span>
          </div>
        )}
        <MapContainer
          center={centroMarDelPlata}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          attributionControl={false}

        >
          <MapBarrioFocus barrioSeleccionado={barrioSeleccionado} />
          {/* Recalcula el tamaño real del mapa cuando cambia el layout */}
          <MapInvalidator refreshKey={sidebarAbierto} />

          {/* Capa base OpenStreetMap */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution=""
          />



          {/* Capa GeoJSON de barrios */}
          {mostrarBarrios && (
            <GeoJSON
              key={barrioSeleccionado || 'todos-los-barrios'}
              data={barriosFiltrados}
              style={(feature) => ({
                ...estiloBarrio(feature, barrioSeleccionado),
                interactive: false,
              })}
            />
          )}

          {/* Selector Leaflet de barrios */}
          {mostrarBarrios && (
            <ControlBarrio
              barrioSeleccionado={barrioSeleccionado}
              setBarrioSeleccionado={setBarrioSeleccionado}
              setPuntoSeleccionado={setPuntoSeleccionado}
            />
          )}

          {/* Captura clicks del usuario sobre el mapa */}
          <ClickMapa
            form={form}
            setForm={setForm}
            setPuntoSeleccionado={setPuntoSeleccionado}
            obtenerDireccion={obtenerDireccion}
            setCursorLinea={setCursorLinea}
            modoDibujo={modoDibujo}
            setEdicionGeometricaIniciada={
              setEdicionGeometricaIniciada
            }
          />

          {/* Centra el mapa cuando se selecciona un punto */}
          <MapCenter
            punto={puntoSeleccionado}
            geometriaTipo={form.geometriaTipo}
          />

          <MapFocus intervencion={intervencionEnfocada} />

          {/* Dibuja línea/polígono en edición y su preview punteada */}
          {modoDibujo && form.geometria?.length > 0 && (
            <GeometryPreview
              form={form}
              cursorLinea={cursorLinea}
              colorFormulario={colorFormulario}
            />
          )}

          {/* Marcador temporal cuando se está cargando/editando un punto */}
          {modoDibujo && puntoSeleccionado && form.geometriaTipo === 'Punto' && (
            <Marker
              position={puntoSeleccionado}
              icon={crearIconoColor(colorFormulario)}
            >
              <Popup>Ubicación seleccionada</Popup>
            </Marker>
          )}

          {/* Intervenciones guardadas del periodo/filtros activos */}
          <IntervencionesLayer
            intervenciones={intervencionesMapa}
            editarIntervencion={editarIntervencion}
            enfocarIntervencion={enfocarIntervencion}
            modoDibujo={modoDibujo}
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
        modoDibujo={modoDibujo}
        intervenciones={intervencionesVisibles}
        assetsPanelAbierto={assetsPanelAbierto}

        seleccionarBarrioEstadistica={(barrio) => {
          setMostrarBarrios(true)
          setBarrioSeleccionado(barrio)
        }}
        setModoDibujo={(activo) => {
          setModoDibujo(activo)
          setCursorLinea(null)

          const editando =
            !!intervencionEditandoId

          // APAGA modo dibujo
          if (!activo) {
            // Si todavía no tocó el mapa,
            // volvemos al estado original.
            if (
              editando &&
              !edicionGeometricaIniciada
            ) {
              restaurarGeometriaOriginal()
              return
            }

            setRedibujandoGeometria(false)
            return
          }

          // ACTIVA modo dibujo
          if (
            editando &&
            form.geometriaTipo === 'Polígono'
          ) {
            setForm((prev) => ({
              ...prev,
              geometria: [],
            }))

            setPuntoSeleccionado(null)
            setRedibujandoGeometria(true)
          }
        }}
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



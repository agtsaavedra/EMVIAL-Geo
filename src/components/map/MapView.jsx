/**
 * Vista principal del mapa.
 *
 * Integra Leaflet, barrios, intervenciones, dibujo de geometrías, estadísticas
 * e imagen/PDF guía para calcar información territorial.
 */

import {
  MapContainer,
  TileLayer,
  Marker,
  Pane,
  Popup,
  GeoJSON,
} from 'react-leaflet'

import 'leaflet/dist/leaflet.css'
import {
  memo,
  useEffect,
  useMemo,
  useState,
} from 'react'
import MapBarrioFocus from './MapBarrioFocus'
import MapActions from './MapActions'
import ControlBarrio from './ControlBarrio'
import GeometryControl from './GeometryControl'
import ClickMapa from './ClickMapa'
import MapCenter from './MapCenter'
import MapInvalidator from './MapInvalidator'
import IntervencionesLayer from './IntervencionesLayer'
import GeometryPreview from './GeometryPreview'
import MapFocus from './MapFocus'
import GuideImageOverlay from './GuideImageOverlay'
import GuideOverlayControls from './GuideOverlayControls'

import { useGeometryEditing } from '@hooks/map/useGeometryEditing'

import { crearIconoColor } from '@map/config/mapIcons'
import { obtenerColorIntervencion } from '@map/config/mapColors'

import {
  centroMarDelPlata,
  cargarBarriosGeojson,
  estiloBarrio,
} from '@map/data/barrios'

import {
  obtenerBarriosFiltrados,
  obtenerIntervencionesVisibles,
  obtenerStatsMapa,
} from '@map/data/mapViewData'
// Punto de entrada visual del componente.
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
  intervencionHoverId,
  modoDibujo,
  setModoDibujo,
  modoConsulta,
  setModoConsulta,
  sidebarAbierto,
  enfocarIntervencion,
  assetsPanelAbierto,
  guideOverlay,
}) {
  const [barriosListos, setBarriosListos] =
    useState(false)

  useEffect(() => {
    let activo = true

    cargarBarriosGeojson().then(() => {
      if (activo) {
        setBarriosListos(true)
      }
    })

    return () => {
      activo = false
    }
  }, [])

  // =====================================================
  // LÓGICA DE EDICIÓN GEOMÉTRICA
  // useGeometryEditing:
  // - maneja preview de línea/polígono
  // - deshacer puntos
  // - limpiar ubicación/geometría
  // - restaurar geometría original
  // - cambio de tipo Punto/Línea/Polígono
  // - estado de redibujo al editar intervenciones existentes
  // =====================================================

  const {
    cursorLinea,
    setCursorLinea,

    redibujandoGeometria,
    setEdicionGeometricaIniciada,

    deshacerPunto,
    limpiarUbicacion,
    cambiarGeometriaTipo,
    manejarCambioModoDibujo,
  } = useGeometryEditing({
    form,
    setForm,
    intervencionesFiltradas,
    intervencionEditandoId,
    setPuntoSeleccionado,
  })

  // =====================================================
  // DATOS DERIVADOS DEL MAPA
  // =====================================================

  // GeoJSON de barrios filtrado según el barrio seleccionado.
  const barriosFiltrados =
    obtenerBarriosFiltrados(
      barrioSeleccionado,
      barriosListos
    )

  // Intervenciones visibles según período/filtros activos.
  const intervencionesVisibles =
    useMemo(
      () =>
        obtenerIntervencionesVisibles(
          intervencionesFiltradas
        ),
      [intervencionesFiltradas]
    )

  // Cuando se está redibujando una intervención existente,
  // ocultamos su versión guardada para no ver duplicada
  // la geometría original y la geometría editable.
  const ocultarIntervencionEditada =
    redibujandoGeometria ||
    (
      !modoConsulta &&
      modoDibujo &&
      intervencionEditandoId &&
      form.geometriaTipo === 'Polígono'
    )

  const intervencionesMapa =
    useMemo(() => {
      if (!ocultarIntervencionEditada) {
        return intervencionesVisibles
      }

      return intervencionesVisibles.filter(
        (intervencion) =>
          intervencion.id !==
          intervencionEditandoId
      )
    }, [
      ocultarIntervencionEditada,
      intervencionesVisibles,
      intervencionEditandoId,
    ])

  // Estadísticas compactas por obra para la barra inferior.
  const statsPorObra =
    useMemo(
      () =>
        obtenerStatsMapa(
          intervencionesVisibles
        ),
      [intervencionesVisibles]
    )

  // Color de la geometría activa del formulario.
  const colorFormulario =
    obtenerColorIntervencion(form)

  // =====================================================
  // RENDER
  // =====================================================

  // Render principal del componente.
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
        {/* Selector flotante Punto/Línea/Polígono.
            Solo se muestra en modo dibujo. */}
        {!modoConsulta && modoDibujo && (
          <GeometryControl
            geometriaTipo={form.geometriaTipo}
            setGeometriaTipo={cambiarGeometriaTipo}
          />
        )}

        {/* Indicador compacto de modo dibujo activo. */}
        {!modoConsulta && modoDibujo && (
          <div className="drawing-mode-banner">
            <strong>✏️ Dibujo</strong>

            <span>
              {form.geometriaTipo === 'Punto'
                ? 'Seleccionar ubicación'
                : `${form.geometriaTipo} · ${form.geometria?.length || 0
                } pts`}
            </span>

            {form.barrio && (
              <small>
                Barrio: {form.barrio}
              </small>
            )}
          </div>
        )}

        <GuideOverlayControls
          {...guideOverlay}
        />

        <MapContainer
          center={centroMarDelPlata}
          zoom={13}
          style={{
            height: '100%',
            width: '100%',
          }}
          attributionControl={false}
        >
          {/* Enfoca un barrio cuando se selecciona desde
              estadísticas o desde controles externos. */}
          <MapBarrioFocus
            barrioSeleccionado={barrioSeleccionado}
          />

          {/* Recalcula tamaño del mapa cuando cambia el layout
              por apertura/cierre de sidebar/panel. */}
          <MapInvalidator
            refreshKey={`${sidebarAbierto}-${assetsPanelAbierto}`}
          />

          {/* Capa base OpenStreetMap. */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution=""
          />

          <GuideImageOverlay
            {...guideOverlay}
          />

          {/* Capa GeoJSON de barrios.
              IMPORTANTE:
              interactive:false evita que los barrios bloqueen
              clicks sobre líneas, puntos y polígonos. */}
          <Pane
            name="barrios-pane"
            style={{ zIndex: 320 }}
          >
            {mostrarBarrios && (
              <GeoJSON
                key={
                  barrioSeleccionado ||
                  'todos-los-barrios'
                }
                data={barriosFiltrados}
                style={(feature) => ({
                  ...estiloBarrio(
                    feature,
                    barrioSeleccionado
                  ),
                  interactive: false,
                })}
              />
            )}
          </Pane>

          {/* Selector Leaflet de barrios. */}
          {mostrarBarrios && (
            <ControlBarrio
              barrioSeleccionado={barrioSeleccionado}
              setBarrioSeleccionado={
                setBarrioSeleccionado
              }
              setPuntoSeleccionado={
                setPuntoSeleccionado
              }
              intervenciones={intervencionesVisibles}
            />
          )}

          {/* Captura clicks reales sobre el mapa
              para marcar punto/línea/polígono. */}
          <ClickMapa
            form={form}
            setForm={setForm}
            setPuntoSeleccionado={
              setPuntoSeleccionado
            }
            obtenerDireccion={obtenerDireccion}
            setCursorLinea={setCursorLinea}
            modoDibujo={
              !modoConsulta && modoDibujo
            }
            setEdicionGeometricaIniciada={
              setEdicionGeometricaIniciada
            }
          />

          {/* Centra el mapa cuando se selecciona un punto. */}
          <MapCenter
            punto={puntoSeleccionado}
            geometriaTipo={form.geometriaTipo}
          />

          {/* Enfoca intervenciones desde panel, popup o mapa. */}
          <MapFocus
            intervencion={intervencionEnfocada}
          />

          {/* Dibuja geometría activa del formulario
              y preview punteada durante el dibujo. */}
          {!modoConsulta &&
            form.geometria?.length > 0 && (
            <GeometryPreview
              form={form}
              cursorLinea={cursorLinea}
              colorFormulario={colorFormulario}
            />
            )}

          {/* Marcador temporal para punto activo
              mientras se carga/edita ubicación. */}
          {!modoConsulta &&
            puntoSeleccionado &&
            form.geometriaTipo === 'Punto' && (
              <Marker
                position={puntoSeleccionado}
                icon={crearIconoColor(
                  colorFormulario
                )}
              >
                <Popup>
                  Ubicación seleccionada
                </Popup>
              </Marker>
            )}

          {/* Intervenciones guardadas visibles
              según período/filtros activos. */}
          <IntervencionesLayer
            intervenciones={intervencionesMapa}
            editarIntervencion={
              modoConsulta
                ? null
                : editarIntervencion
            }
            enfocarIntervencion={
              enfocarIntervencion
            }
            modoDibujo={
              !modoConsulta && modoDibujo
            }
            intervencionEnfocada={
              intervencionEnfocada
            }
            intervencionResaltadaId={
              intervencionHoverId
            }
          />
        </MapContainer>
      </div>

      {/* Barra inferior del mapa:
          capas, acciones de geometría y estadísticas. */}
      <MapActions
        mostrarBarrios={mostrarBarrios}
        setMostrarBarrios={setMostrarBarrios}
        geometriaTipo={form.geometriaTipo}
        cantidadPuntos={
          form.geometria?.length || 0
        }
        deshacerPunto={deshacerPunto}
        limpiarUbicacion={limpiarUbicacion}
        statsPorObra={statsPorObra}
        modoDibujo={modoDibujo}
        modoConsulta={modoConsulta}
        setModoConsulta={setModoConsulta}
        intervenciones={intervencionesVisibles}
        assetsPanelAbierto={assetsPanelAbierto}
        seleccionarBarrioEstadistica={(barrio) => {
          setMostrarBarrios(true)
          setBarrioSeleccionado(barrio)
        }}
        setModoDibujo={(activo) =>
          manejarCambioModoDibujo({
            activo: modoConsulta
              ? false
              : activo,
            setModoDibujo,
          })
        }
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

export default memo(MapView)

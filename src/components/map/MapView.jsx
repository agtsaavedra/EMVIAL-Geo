import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
} from 'react-leaflet'

import 'leaflet/dist/leaflet.css'

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

import { useGeometryEditing } from '../../hooks/useGeometryEditing'

import { crearIconoColor } from '../../map/mapIcons'
import { obtenerColorIntervencion } from '../../map/mapColors'

import {
  centroMarDelPlata,
  estiloBarrio,
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
      barrioSeleccionado
    )

  // Intervenciones visibles según período/filtros activos.
  const intervencionesVisibles =
    obtenerIntervencionesVisibles(
      intervencionesFiltradas,
      intervencionEditandoId
    )

  // Cuando se está redibujando una intervención existente,
  // ocultamos su versión guardada para no ver duplicada
  // la geometría original y la geometría editable.
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
            intervencion.id !==
            intervencionEditandoId
        )
      : intervencionesVisibles

  // Estadísticas compactas por obra para la barra inferior.
  const statsPorObra =
    obtenerStatsMapa(intervencionesVisibles)

  // Color de la geometría activa del formulario.
  const colorFormulario =
    obtenerColorIntervencion(form)

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
        {/* Selector flotante Punto/Línea/Polígono.
            Solo se muestra en modo dibujo. */}
        {modoDibujo && (
          <GeometryControl
            geometriaTipo={form.geometriaTipo}
            setGeometriaTipo={cambiarGeometriaTipo}
          />
        )}

        {/* Indicador compacto de modo dibujo activo. */}
        {modoDibujo && (
          <div className="drawing-mode-banner">
            <strong>✏️ Dibujo</strong>

            <span>
              {form.geometriaTipo === 'Punto'
                ? 'Seleccionar ubicación'
                : `${form.geometriaTipo} · ${
                    form.geometria?.length || 0
                  } pts`}
            </span>
          </div>
        )}

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
            refreshKey={sidebarAbierto}
          />

          {/* Capa base OpenStreetMap. */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution=""
          />

          {/* Capa GeoJSON de barrios.
              IMPORTANTE:
              interactive:false evita que los barrios bloqueen
              clicks sobre líneas, puntos y polígonos. */}
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
            modoDibujo={modoDibujo}
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
          {modoDibujo &&
            form.geometria?.length > 0 && (
              <GeometryPreview
                form={form}
                cursorLinea={cursorLinea}
                colorFormulario={colorFormulario}
              />
            )}

          {/* Marcador temporal para punto activo
              mientras se carga/edita ubicación. */}
          {modoDibujo &&
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
              editarIntervencion
            }
            enfocarIntervencion={
              enfocarIntervencion
            }
            modoDibujo={modoDibujo}
            intervencionEnfocada={
              intervencionEnfocada
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
        intervenciones={intervencionesVisibles}
        assetsPanelAbierto={assetsPanelAbierto}
        seleccionarBarrioEstadistica={(barrio) => {
          setMostrarBarrios(true)
          setBarrioSeleccionado(barrio)
        }}
        setModoDibujo={(activo) =>
          manejarCambioModoDibujo({
            activo,
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

export default MapView

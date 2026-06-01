import {
  Polyline,
  Polygon,
} from 'react-leaflet'

function GeometryPreview({
  form,
  cursorLinea,
  colorFormulario,
}) {
  // =====================================================
  // HELPERS
  // =====================================================

  const esLinea =
    form.geometriaTipo === 'Línea'

  const esPoligono =
    form.geometriaTipo === 'Polígono'

  const geometria =
    form.geometria || []

  const cantidadPuntos =
    geometria.length

  // =====================================================
  // PREVIEW DINÁMICO
  // =====================================================
  // Línea punteada entre:
  // último punto marcado -> cursor actual

  const previewLinea =
    ['Línea', 'Polígono'].includes(
      form.geometriaTipo
    ) &&
    cantidadPuntos > 0 &&
    cursorLinea
      ? [
          geometria[
            cantidadPuntos - 1
          ],
          cursorLinea,
        ]
      : null

  // =====================================================
  // CIERRE VISUAL DEL POLÍGONO
  // =====================================================
  // Línea punteada entre:
  // cursor actual -> primer punto
  //
  // Sirve para mostrar visualmente
  // cómo quedará el cierre.

  const cierrePoligono =
    esPoligono &&
    cantidadPuntos > 1 &&
    cursorLinea
      ? [
          cursorLinea,
          geometria[0],
        ]
      : null

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      {/* ===============================
          LÍNEA REAL
      ================================ */}

      {esLinea &&
        cantidadPuntos > 0 && (
          <Polyline
            positions={geometria}
            pathOptions={{
              color: colorFormulario,
              weight: 5,
            }}
          />
        )}

      {/* ===============================
          POLÍGONO REAL
      ================================ */}

      {esPoligono &&
        cantidadPuntos > 2 && (
          <Polygon
            positions={geometria}
            pathOptions={{
              color: colorFormulario,

              weight: 4,

              fillColor:
                colorFormulario,

              fillOpacity: 0.25,
            }}
          />
        )}

      {/* ===============================
          PREVIEW PUNTEADO
      ================================ */}

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

      {/* ===============================
          CIERRE PREVIEW POLÍGONO
      ================================ */}

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
    </>
  )
}

export default GeometryPreview

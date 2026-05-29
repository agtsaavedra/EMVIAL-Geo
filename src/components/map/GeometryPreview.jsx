import { Polyline, Polygon } from 'react-leaflet'

function GeometryPreview({
  form,
  cursorLinea,
  colorFormulario,
}) {
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

  return (
    <>
      {form.geometriaTipo === 'Línea' &&
        form.geometria?.length > 0 && (
          <Polyline
            positions={form.geometria}
            pathOptions={{
              color: colorFormulario,
              weight: 5,
            }}
          />
        )}

      {form.geometriaTipo === 'Polígono' &&
        form.geometria?.length > 2 && (
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
    </>
  )
}

export default GeometryPreview
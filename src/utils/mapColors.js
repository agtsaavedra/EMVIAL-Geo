export function obtenerColorIntervencion(intervencion) {
  const texto = `${intervencion.obra || ''} ${intervencion.descripcion || ''}`.toUpperCase()

  if (texto.includes('MICROBACHEO')) return '#dc2626'
  if (texto.includes('BACHEO')) return '#7c3f2c'
  if (texto.includes('TJ')) return '#9333ea'
  if (texto.includes('GRANZA')) return '#16a34a'
  if (texto.includes('PAVIMENT')) return '#2563eb'
  if (texto.includes('RECAPADO')) return '#ea580c'
  if (texto.includes('CORDON') || texto.includes('CORDÓN')) return '#0891b2'
  if (texto.includes('LED') || texto.includes('ALUMBRADO')) return '#facc15'

  return '#9333ea'
}

export function crearIconoColor(color) {
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
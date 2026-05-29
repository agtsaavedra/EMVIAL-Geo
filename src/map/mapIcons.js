import L from 'leaflet'

// ===============================
// Fix iconos default de Leaflet
// ===============================

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',

  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',

  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ===============================
// Marker circular custom por color
// ===============================

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
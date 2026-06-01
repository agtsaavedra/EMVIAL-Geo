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

export function crearIconoColor(
  color,
  size = 16
) {
  const border =
    size >= 20 ? 4 : 3

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div
        style="
          width:${size}px;
          height:${size}px;
          border-radius:50%;
          background:${color};
          border:${border}px solid white;
          box-shadow:
            0 0 0 2px rgba(0,0,0,.12),
            0 6px 14px rgba(0,0,0,.22);
          transition: all .18s ease;
        "
      ></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}
export const barriosDemo = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { nombre: 'Centro' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-57.555, -38.010],
          [-57.535, -38.010],
          [-57.535, -37.995],
          [-57.555, -37.995],
          [-57.555, -38.010],
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { nombre: 'La Perla' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-57.560, -37.995],
          [-57.540, -37.995],
          [-57.540, -37.980],
          [-57.560, -37.980],
          [-57.560, -37.995],
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { nombre: 'Puerto' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-57.555, -38.065],
          [-57.525, -38.065],
          [-57.525, -38.040],
          [-57.555, -38.040],
          [-57.555, -38.065],
        ]]
      }
    }
  ]
}
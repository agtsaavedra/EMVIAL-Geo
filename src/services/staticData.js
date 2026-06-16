export async function leerArchivoDatos(
  nombreArchivo
) {
  if (
    typeof window !== 'undefined' &&
    window.api?.leerArchivoDatos
  ) {
    return await window.api.leerArchivoDatos(
      nombreArchivo
    )
  }

  const urls = obtenerUrlsDatos(nombreArchivo)

  for (const url of urls) {
    try {
      const response = await fetch(url)

      if (response.ok) {
        return await response.text()
      }
    } catch {
      // Prueba la siguiente ruta candidata.
    }
  }

  throw new Error(
    `No se pudo cargar ${nombreArchivo}`
  )
}

function obtenerUrlsDatos(nombreArchivo) {
  const rutas = []

  if (
    typeof self !== 'undefined' &&
    self.location?.href
  ) {
    const locationUrl = new URL(self.location.href)

    if (
      locationUrl.protocol === 'http:' ||
      locationUrl.protocol === 'https:'
    ) {
      rutas.push(
        new URL(
          `/data/${nombreArchivo}`,
          locationUrl.origin
        ).href
      )
    }

    rutas.push(
      new URL(
        `../data/${nombreArchivo}`,
        self.location.href
      ).href
    )
  }

  rutas.push(`./data/${nombreArchivo}`)

  return [...new Set(rutas)]
}

export async function leerGeojsonDatos(
  nombreArchivo
) {
  const contenido =
    await leerArchivoDatos(nombreArchivo)

  if (
    contenido.trimStart().startsWith('<')
  ) {
    throw new Error(
      `${nombreArchivo} devolvio HTML en lugar de GeoJSON.`
    )
  }

  return JSON.parse(contenido)
}

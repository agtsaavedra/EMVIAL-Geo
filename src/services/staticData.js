export async function leerArchivoDatos(
  nombreArchivo
) {
  if (window.api?.leerArchivoDatos) {
    return await window.api.leerArchivoDatos(
      nombreArchivo
    )
  }

  const response = await fetch(
    `./data/${nombreArchivo}`
  )

  if (!response.ok) {
    throw new Error(
      `No se pudo cargar ${nombreArchivo}`
    )
  }

  return await response.text()
}

export async function leerGeojsonDatos(
  nombreArchivo
) {
  const contenido =
    await leerArchivoDatos(nombreArchivo)

  return JSON.parse(contenido)
}

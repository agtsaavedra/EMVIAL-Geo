/*
  useAboutDialog

  Maneja el estado del diálogo Acerca de EMVIAL Geo.

  Al abrirse consulta información local expuesta por Electron, como rutas de
  base de datos, configuración y backups.
*/

import { useState } from 'react'

export function useAboutDialog() {
  const [aboutAbierto, setAboutAbierto] = useState(false)
  const [estadoApp, setEstadoApp] = useState(null)
  const [estadoGeocoding, setEstadoGeocoding] =
    useState(null)

  // Consulta el estado local de la app y abre el diálogo Acerca de.
  async function abrirAbout() {
    const [estado, geocoding] =
      await Promise.all([
        window.api.obtenerEstadoApp(),
        window.api.obtenerEstadoGeocoding?.(),
      ])

    setEstadoApp(estado)
    setEstadoGeocoding(geocoding || null)
    setAboutAbierto(true)
  }

  // Cierra el diálogo Acerca de sin modificar el estado consultado.
  function cerrarAbout() {
    setAboutAbierto(false)
  }

  async function limpiarCacheGeocoding() {
    const geocoding =
      await window.api.limpiarCacheGeocoding?.()

    setEstadoGeocoding(geocoding || null)
  }

  return {
    aboutAbierto,
    estadoApp,
    estadoGeocoding,
    abrirAbout,
    cerrarAbout,
    limpiarCacheGeocoding,
  }
}

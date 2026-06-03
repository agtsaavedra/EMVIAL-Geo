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

  // Consulta el estado local de la app y abre el diálogo Acerca de.
  async function abrirAbout() {
    const estado =
      await window.api.obtenerEstadoApp()

    setEstadoApp(estado)
    setAboutAbierto(true)
  }

  // Cierra el diálogo Acerca de sin modificar el estado consultado.
  function cerrarAbout() {
    setAboutAbierto(false)
  }

  return {
    aboutAbierto,
    estadoApp,
    abrirAbout,
    cerrarAbout,
  }
}
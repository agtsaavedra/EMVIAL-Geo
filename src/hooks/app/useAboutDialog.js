import { useState } from 'react'

export function useAboutDialog() {
  const [aboutAbierto, setAboutAbierto] = useState(false)
  const [estadoApp, setEstadoApp] = useState(null)

  async function abrirAbout() {
    const estado =
      await window.api.obtenerEstadoApp()

    setEstadoApp(estado)
    setAboutAbierto(true)
  }

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
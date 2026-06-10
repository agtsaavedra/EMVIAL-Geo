/**
 * Hook de geocodificación.
 *
 * Encapsula búsqueda de direcciones, selección de sugerencias y obtención de
 * dirección inversa desde coordenadas usando la API de Electron.
 */

// Punto de entrada público del hook.
export function useGeocoding({
  form,
  setForm,
  setPuntoSeleccionado,
  setSugerencias,
  setBuscandoDireccion,
  mostrarToast,
}) {
  // Obtiene una dirección textual desde coordenadas.
  async function obtenerDireccion(lat, lon) {
    return await window.api.obtenerDireccion(lat, lon)
  }

  async function obtenerCoordenadas(direccion) {
    const datos = await window.api.buscarDireccion(direccion)

    if (!datos.length) return null

    return {
      latitud: parseFloat(datos[0].lat),
      longitud: parseFloat(datos[0].lon),
      direccion: datos[0].display_name,
    }
  }

  // Aplica una sugerencia al formulario y al punto seleccionado en el mapa.
  function seleccionarSugerencia(sugerencia) {
    const lat = parseFloat(sugerencia.lat)
    const lon = parseFloat(sugerencia.lon)

    setForm((prev) => ({
      ...prev,
      direccion: sugerencia.display_name,
      latitud: lat.toFixed(6),
      longitud: lon.toFixed(6),
      geometria: [[lat, lon]],
    }))

    setPuntoSeleccionado([lat, lon])
    setSugerencias([])
  }

  // Busca sugerencias de dirección a partir del texto cargado.
  async function buscarDireccion() {
    if (!form.direccion.trim()) return

    setBuscandoDireccion(true)

    try {
      const resultado = await obtenerCoordenadas(form.direccion)

      if (!resultado) {
        mostrarToast('No se encontró la dirección.', 'error')
        return
      }

      setPuntoSeleccionado([resultado.latitud, resultado.longitud])

      setForm((prev) => ({
        ...prev,
        direccion: resultado.direccion,
        latitud: resultado.latitud.toFixed(6),
        longitud: resultado.longitud.toFixed(6),
        geometria:
          prev.geometriaTipo === 'Punto'
            ? [[resultado.latitud, resultado.longitud]]
            : prev.geometria,
      }))
    } finally {
      setBuscandoDireccion(false)
    }
  }

  // API pública que consume el resto de la aplicación.
  return {
    obtenerDireccion,
    obtenerCoordenadas,
    buscarDireccion,
    seleccionarSugerencia,
  }
}

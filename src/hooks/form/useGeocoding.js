export function useGeocoding({
  form,
  setForm,
  setPuntoSeleccionado,
  setSugerencias,
  setBuscandoDireccion,
  mostrarToast,
}) {
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

  async function buscarDireccion() {
    if (!form.direccion.trim()) return

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
  }

  return {
    obtenerDireccion,
    obtenerCoordenadas,
    buscarDireccion,
    seleccionarSugerencia,
  }
}
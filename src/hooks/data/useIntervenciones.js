import { useEffect, useState } from 'react'

export function useIntervenciones() {
  const [intervenciones, setIntervenciones] = useState([])
  const [intervencionEditandoId, setIntervencionEditandoId] = useState(null)

  useEffect(() => {
    recargarIntervenciones()
  }, [])

  async function recargarIntervenciones() {
    const datos = await window.api.obtenerIntervenciones()
    setIntervenciones(datos)
  }

  async function guardarIntervencionEnDB(form) {
    if (intervencionEditandoId) {
      const actualizada = await window.api.guardarIntervencion({
        id: intervencionEditandoId,
        ...form,
      })

      setIntervenciones((prev) =>
        prev.map((intervencion) =>
          intervencion.id === intervencionEditandoId
            ? actualizada
            : intervencion
        )
      )

      setIntervencionEditandoId(null)

      return actualizada
    }

    const nueva = await window.api.guardarIntervencion({
      id: Date.now(),
      ...form,
    })

    setIntervenciones((prev) => [nueva, ...prev])

    return nueva
  }

async function eliminarIntervencion(id) {
  await window.api.eliminarIntervencion(id)

  setIntervenciones((prev) =>
    prev.filter((intervencion) => intervencion.id !== id)
  )

  return true
}
  return {
    intervenciones,
    intervencionEditandoId,
    setIntervencionEditandoId,
    guardarIntervencionEnDB,
    eliminarIntervencion,
    recargarIntervenciones,
  }
}
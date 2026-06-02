import { useEffect, useState } from 'react'

export function useIntervenciones() {
  const [intervenciones, setIntervenciones] =
    useState([])

  const [
    intervencionEditandoId,
    setIntervencionEditandoId,
  ] = useState(null)

  useEffect(() => {
    recargarIntervenciones()
  }, [])

  async function recargarIntervenciones() {
    const datos =
      await window.api.obtenerIntervenciones()

    setIntervenciones(datos || [])
  }

  async function guardarIntervencionEnDB(form) {
    if (intervencionEditandoId) {
      const actualizada =
        await window.api.guardarIntervencion({
          ...form,

          id: intervencionEditandoId,

          updatedAt:
            new Date().toISOString(),

          version:
            (form.version || 1) + 1,
        })

      setIntervenciones((prev) =>
        prev.map((intervencion) =>
          intervencion.id ===
            intervencionEditandoId
            ? actualizada
            : intervencion
        )
      )

      setIntervencionEditandoId(null)

      return actualizada
    }

    const nueva =
      await window.api.guardarIntervencion({
        ...form,

        id: crypto.randomUUID(),

        createdAt:
          new Date().toISOString(),

        updatedAt:
          new Date().toISOString(),

        deletedAt: null,

        version: 1,
      })


    setIntervenciones((prev) => [
      nueva,
      ...prev,
    ])

    return nueva
  }

  async function eliminarIntervencion(id) {
    await window.api.eliminarIntervencion(id)

    setIntervenciones((prev) =>
      prev.filter(
        (intervencion) =>
          intervencion.id !== id
      )
    )

    return true
  }

  async function restaurarIntervencion(
    intervencion
  ) {
    const restaurada =
      await window.api.guardarIntervencion(
        intervencion
      )

    setIntervenciones((prev) => {
      const yaExiste = prev.some(
        (item) =>
          item.id === restaurada.id
      )

      if (yaExiste) {
        return prev.map((item) =>
          item.id === restaurada.id
            ? restaurada
            : item
        )
      }

      return [
        restaurada,
        ...prev,
      ]
    })

    return restaurada
  }

  return {
    intervenciones,
    intervencionEditandoId,
    setIntervencionEditandoId,
    guardarIntervencionEnDB,
    eliminarIntervencion,
    restaurarIntervencion,
    recargarIntervenciones,
  }
}

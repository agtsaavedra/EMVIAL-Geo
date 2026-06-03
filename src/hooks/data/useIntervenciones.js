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
    try {
      const datos =
        await window.api.obtenerIntervenciones()

      setIntervenciones(datos || [])
    } catch (error) {
      console.error(
        'Error al obtener intervenciones:',
        error
      )

      setIntervenciones([])
    }
  }

  async function guardarIntervencionEnDB(form) {
    try {
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
    } catch (error) {
      console.error(
        'Error al guardar intervención:',
        error
      )

      throw error
    }
  }

  async function eliminarIntervencion(id) {
    try {
      await window.api.eliminarIntervencion(id)

      setIntervenciones((prev) =>
        prev.filter(
          (intervencion) =>
            intervencion.id !== id
        )
      )

      return true
    } catch (error) {
      console.error(
        'Error al eliminar intervención:',
        error
      )

      throw error
    }
  }

  async function restaurarIntervencion(
    intervencion
  ) {
    try {
      const restaurada =
        await window.api.guardarIntervencion({
          ...intervencion,

          deletedAt: null,

          updatedAt:
            new Date().toISOString(),

          version:
            (intervencion.version || 1) + 1,
        })

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
    } catch (error) {
      console.error(
        'Error al restaurar intervención:',
        error
      )

      throw error
    }
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
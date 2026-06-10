/**
 * Hook principal de persistencia de intervenciones.
 *
 * Mantiene en React una copia de las intervenciones guardadas en SQLite.
 * Crear, actualizar, eliminar y restaurar pasan por `window.api`, que comunica
 * el renderer con Electron.
 */

import { useEffect, useState } from 'react'

// Punto de entrada público del hook.
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

  // Carga desde SQLite todas las intervenciones disponibles.
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

  // Crea o actualiza una intervención persistiendo los datos en SQLite.
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

  // Elimina una intervención por id y sincroniza el estado local.
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

  async function guardarIntervencionesMasivoEnDB(
    items = []
  ) {
    try {
      const ahora = new Date().toISOString()

      const preparadas = items.map((item) => ({
        ...item,
        id: item.id || crypto.randomUUID(),
        createdAt: item.createdAt || ahora,
        updatedAt: ahora,
        deletedAt: null,
        version: item.version || 1,
      }))

      const guardadas =
        await window.api.guardarIntervencionesMasivo(
          preparadas
        )

      setIntervenciones((prev) => [
        ...guardadas,
        ...prev,
      ])

      return guardadas
    } catch (error) {
      console.error(
        'Error al guardar intervenciones masivas:',
        error
      )

      throw error
    }
  }

  // Restaura una intervención eliminada o reemplaza una existente.
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

  // API pública que consume el resto de la aplicación.
  return {
    intervenciones,
    intervencionEditandoId,
    setIntervencionEditandoId,
    guardarIntervencionEnDB,
    guardarIntervencionesMasivoEnDB,
    eliminarIntervencion,
    restaurarIntervencion,
    recargarIntervenciones,
  }
}

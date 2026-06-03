/*
  useKeyboardShortcuts

  Registra atajos globales de teclado de la aplicación.

  Los atajos están pensados para acelerar la carga operativa:
  guardar formulario, enfocar búsqueda, alternar modo dibujo y salir del
  modo dibujo con Escape.
*/

import { useEffect } from 'react'

export function useKeyboardShortcuts({
  modoDibujo,
  setModoDibujo,
  mostrarToast,
}) {
  useEffect(() => {
    // Procesa los atajos globales registrados en window.
    function manejarAtajos(event) {
      const tag =
        document.activeElement?.tagName?.toLowerCase()

      const escribiendo =
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select'

      // ==========================
      // Ctrl + S → guardar
      // ==========================
      if (
        event.ctrlKey &&
        event.key.toLowerCase() === 's'
      ) {
        event.preventDefault()

        const formElement =
          document.querySelector('form')

        formElement?.requestSubmit?.()

        return
      }

      // ==========================
      // Ctrl + F → búsqueda
      // ==========================
      if (
        event.ctrlKey &&
        event.key.toLowerCase() === 'f'
      ) {
        event.preventDefault()

        const buscador =
          document.querySelector(
            '.topbar-main > input'
          )

        buscador?.focus?.()
        buscador?.select?.()

        return
      }

      // ==========================
      // Ctrl + D → modo dibujo
      // ==========================
      if (
        event.ctrlKey &&
        event.key.toLowerCase() === 'd'
      ) {
        event.preventDefault()

        setModoDibujo((prev) => {
          const nuevoEstado = !prev

          mostrarToast(
            nuevoEstado
              ? '✏️ Modo dibujo activado (Ctrl+D)'
              : 'Modo dibujo desactivado.',
            'info'
          )

          return nuevoEstado
        })

        return
      }

      // ==========================
      // Esc → salir modo dibujo
      // ==========================
      if (
        event.key === 'Escape' &&
        modoDibujo &&
        !escribiendo
      ) {
        setModoDibujo(false)

        mostrarToast(
          'Modo dibujo desactivado.',
          'info'
        )
      }
    }

    window.addEventListener(
      'keydown',
      manejarAtajos
    )

    return () => {
      window.removeEventListener(
        'keydown',
        manejarAtajos
      )
    }
  }, [
    modoDibujo,
    setModoDibujo,
    mostrarToast,
  ])
}
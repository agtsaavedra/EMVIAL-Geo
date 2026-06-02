import { useEffect } from 'react'

export function useKeyboardShortcuts({
  modoDibujo,
  setModoDibujo,
  mostrarToast,
}) {
  useEffect(() => {
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
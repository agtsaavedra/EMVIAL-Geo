import { useEffect, useRef, useState } from 'react'

function TopbarMenu({
  menuAbierto,
  setMenuAbierto,

  modoOscuro,
  setModoOscuro,

  exportarKmlActual,
  exportarExcelActual,

  crearBackup,
  restaurarBackup,
  restaurarPeriodoActual,

  abrirCarpetaBackups,
  configurarCarpetaBackups,

  abrirAbout,
}) {
  const [avanzadoAbierto, setAvanzadoAbierto] =
    useState(false)

  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        cerrarMenu()
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      )
    }
  }, [])

  function cerrarMenu() {
    setMenuAbierto(false)
    setAvanzadoAbierto(false)
  }

  function ejecutarYCerrar(accion) {
    accion?.()
    cerrarMenu()
  }

  return (
    <div className="menu-wrapper" ref={menuRef}>
      <button
        type="button"
        className="menu-btn"
        aria-label="Abrir menú"
        onClick={() =>
          setMenuAbierto((prev) => !prev)
        }
      >
        ☰
      </button>

      {menuAbierto && (
        <div className="dropdown-menu">
          <button
            type="button"
            onClick={() =>
              setModoOscuro((prev) => !prev)
            }
          >
            {modoOscuro
              ? '☀️ Modo claro'
              : '🌙 Modo oscuro'}
          </button>

          <button
            type="button"
            onClick={() =>
              ejecutarYCerrar(exportarExcelActual)
            }
          >
            Exportar Excel
          </button>

          <button
            type="button"
            onClick={() =>
              ejecutarYCerrar(exportarKmlActual)
            }
          >
            Exportar KML
          </button>

          <button
            type="button"
            onClick={() =>
              ejecutarYCerrar(crearBackup)
            }
          >
            Crear backup
          </button>

          <button
            type="button"
            onClick={() =>
              ejecutarYCerrar(abrirCarpetaBackups)
            }
          >
            Abrir carpeta de backups
          </button>

          <button
            type="button"
            onClick={() =>
              ejecutarYCerrar(abrirAbout)
            }
          >
            Acerca de EMVIAL Geo
          </button>

          <div className="menu-advanced">
            <button
              type="button"
              className="menu-advanced-toggle"
              onClick={() =>
                setAvanzadoAbierto((prev) => !prev)
              }
            >
              <span>
                {avanzadoAbierto ? '▾' : '▸'}
              </span>

              Opciones avanzadas
            </button>

            {avanzadoAbierto && (
              <div className="menu-advanced-content">
                <button
                  type="button"
                  onClick={() =>
                    ejecutarYCerrar(
                      configurarCarpetaBackups
                    )
                  }
                >
                  Configurar carpeta de backups
                </button>

                <button
                  type="button"
                  className="danger-menu-item"
                  onClick={() =>
                    ejecutarYCerrar(restaurarBackup)
                  }
                >
                  Restaurar backup completo
                </button>

                <button
                  type="button"
                  className="danger-menu-item"
                  onClick={() =>
                    ejecutarYCerrar(
                      restaurarPeriodoActual
                    )
                  }
                >
                  Restaurar período actual
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TopbarMenu
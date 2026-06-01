import {
  useEffect,
  useRef,
  useState,
} from 'react'

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
  // =====================================================
  // ESTADO LOCAL
  // =====================================================

  const [
    avanzadoAbierto,
    setAvanzadoAbierto,
  ] = useState(false)

  const menuRef = useRef(null)

  // =====================================================
  // CERRAR AL HACER CLICK AFUERA
  // =====================================================

  useEffect(() => {
    function manejarClickAfuera(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        cerrarMenu()
      }
    }

    document.addEventListener(
      'mousedown',
      manejarClickAfuera
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        manejarClickAfuera
      )
    }
  }, [])

  // =====================================================
  // HELPERS
  // =====================================================

  function cerrarMenu() {
    setMenuAbierto(false)
    setAvanzadoAbierto(false)
  }

  function alternarMenu() {
    setMenuAbierto((prev) => !prev)
  }

  function alternarAvanzado() {
    setAvanzadoAbierto((prev) => !prev)
  }

  function ejecutarYCerrar(accion) {
    accion?.()
    cerrarMenu()
  }

  function cambiarTemaYCerrar() {
    setModoOscuro((prev) => !prev)
    cerrarMenu()
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      className="menu-wrapper"
      ref={menuRef}
    >
      {/* Botón principal del menú hamburguesa */}
      <button
        type="button"
        className="menu-btn"
        aria-label="Abrir menú"
        onClick={alternarMenu}
      >
        ☰
      </button>

      {menuAbierto && (
        <div className="dropdown-menu">
          {/* ===============================
              TEMA
          ================================ */}

          <button
            type="button"
            onClick={cambiarTemaYCerrar}
          >
            {modoOscuro
              ? '☀️ Modo claro'
              : '🌙 Modo oscuro'}
          </button>

          {/* ===============================
              EXPORTACIONES
          ================================ */}

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

          {/* ===============================
              BACKUPS BÁSICOS
          ================================ */}

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
              ejecutarYCerrar(
                abrirCarpetaBackups
              )
            }
          >
            Abrir carpeta de backups
          </button>

          {/* ===============================
              ACERCA DE
          ================================ */}

          <button
            type="button"
            onClick={() =>
              ejecutarYCerrar(abrirAbout)
            }
          >
            Acerca de EMVIAL Geo
          </button>

          {/* ===============================
              OPCIONES AVANZADAS
          ================================ */}

          <div className="menu-advanced">
            <button
              type="button"
              className="menu-advanced-toggle"
              onClick={alternarAvanzado}
            >
              <span>
                {avanzadoAbierto
                  ? '▾'
                  : '▸'}
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
                    ejecutarYCerrar(
                      restaurarBackup
                    )
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

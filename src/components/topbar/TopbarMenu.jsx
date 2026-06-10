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
  exportarGeoJSONActual,
  exportarShpActual,
  exportarInformePDFActual,
  importarArchivoGISActual,

  crearBackup,
  restaurarBackup,
  restaurarPeriodoActual,

  abrirCarpetaBackups,
  configurarCarpetaBackups,

  abrirAbout,
  abrirDataQuality,

  cargarImagenGuia,
  guideLoading 
}) {
  // =====================================================
  // ESTADO LOCAL
  // =====================================================

  const [
    avanzadoAbierto,
    setAvanzadoAbierto,
  ] = useState(false)

  const [
    importExportAbierto,
    setImportExportAbierto,
  ] = useState(false)

  
  const menuRef = useRef(null)
  const guideInputRef = useRef(null)
  const importInputRef = useRef(null)

  // =====================================================
  // CERRAR AL HACER CLICK AFUERA
  // =====================================================

  useEffect(() => {
    function manejarClickAfuera(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuAbierto(false)
        setAvanzadoAbierto(false)
        setImportExportAbierto(false)
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
  }, [setMenuAbierto])

  // =====================================================
  // HELPERS
  // =====================================================

  function cerrarMenu() {
    setMenuAbierto(false)
    setAvanzadoAbierto(false)
    setImportExportAbierto(false)
  }

  function alternarMenu() {
    setMenuAbierto((prev) => !prev)
  }

  function alternarAvanzado() {
    setAvanzadoAbierto((prev) => !prev)
  }

  function alternarImportExport() {
    setImportExportAbierto((prev) => !prev)
  }

  function ejecutarYCerrar(accion) {
    accion?.()
    cerrarMenu()
  }

  function cambiarTemaYCerrar() {
    setModoOscuro((prev) => !prev)
    cerrarMenu()
  }

  function abrirSelectorGuia() {
    guideInputRef.current?.click()
  }

  function abrirSelectorImportacion() {
    importInputRef.current?.click()
  }

  function manejarArchivoGuia(e) {
    const file = e.target.files?.[0]

    if (!file) return

    cargarImagenGuia?.(file)

    e.target.value = ''
    cerrarMenu()
  }

  function manejarArchivoImportacion(e) {
    const file = e.target.files?.[0]

    if (!file) return

    importarArchivoGISActual?.(file)

    e.target.value = ''
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
      <input
        ref={guideInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf,.pdf"
        onChange={manejarArchivoGuia}
        hidden
      />

      <input
        ref={importInputRef}
        type="file"
        accept=".geojson,.json,.kml,.zip,application/geo+json,application/json,application/vnd.google-earth.kml+xml,application/zip"
        onChange={manejarArchivoImportacion}
        hidden
      />

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
              GUÍA / HOJA DE CALCAR
          ================================ */}

          <button
            type="button"
            onClick={abrirSelectorGuia}
            disabled={guideLoading}
          >
            {guideLoading
              ? 'Cargando guía...'
              : 'Cargar imagen guía'}
          </button>

          {/* ===============================
              IMPORTAR / EXPORTAR
          ================================ */}

          <div className="menu-advanced">
            <button
              type="button"
              className="menu-advanced-toggle"
              onClick={alternarImportExport}
            >
              <span>
                {importExportAbierto
                  ? 'v'
                  : '>'}
              </span>

              Importar / Exportar
            </button>

            {importExportAbierto && (
              <div className="menu-advanced-content">
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
                    ejecutarYCerrar(exportarGeoJSONActual)
                  }
                >
                  Exportar GeoJSON
                </button>

                <button
                  type="button"
                  onClick={() =>
                    ejecutarYCerrar(exportarShpActual)
                  }
                >
                  Exportar SHP
                </button>

                <button
                  type="button"
                  onClick={() =>
                    ejecutarYCerrar(
                      exportarInformePDFActual
                    )
                  }
                >
                  Informe PDF
                </button>

                <button
                  type="button"
                  onClick={abrirSelectorImportacion}
                >
                  Importar GIS
                </button>
              </div>
            )}
          </div>

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
              ejecutarYCerrar(abrirDataQuality)
            }
          >
            Calidad de datos
          </button>

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
                  ? 'v'
                  : '>'}
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

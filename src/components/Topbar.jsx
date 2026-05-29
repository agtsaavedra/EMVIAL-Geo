import { OBRAS, ESTADOS } from '../constants/intervenciones'
import { useEffect, useRef } from 'react'
import mapPin from '../assets/map-pin.svg'
function Topbar({

  busqueda,
  setBusqueda,
  menuAbierto,
  setMenuAbierto,
  exportarKmlActual,
  crearBackup,
  restaurarBackup,
  abrirCarpetaBackups,
  modoOscuro = false,
  setModoOscuro = () => { },
  filtroObra = '',
  setFiltroObra = () => { },
  filtroEstado = '',
  setFiltroEstado = () => { },
  filtroBarrio = '',
  setFiltroBarrio = () => { },
  barriosDisponibles = [],
  periodoActivo,
  setPeriodoActivo,
  restaurarPeriodoActual,
  exportarExcelActual,

}) {
  const hayFiltros =
    filtroObra || filtroEstado || filtroBarrio

  const menuRef = useRef(null)
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuAbierto(false)
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
  }, [setMenuAbierto])


  return (
    <header className="topbar">
      <div className="topbar-main">
        <div className="topbar-title">
          <img
            src={mapPin}
            alt="EMVIAL Geo"
            className="topbar-logo"
          />

          <div>
            <h2>Mapa de intervenciones</h2>
            <span>Mar del Plata / Partido de General Pueyrredon</span>
          </div>
        </div>

        <div className="topbar-actions">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por obra, barrio, estado o ubicación..."
          />

          <div className="menu-wrapper" ref={menuRef}>
            <button
              type="button"
              className="menu-btn"
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
                  onClick={exportarKmlActual}
                >
                  Exportar KML
                </button>

                <button
                  type="button"
                  onClick={crearBackup}
                >
                  Crear backup
                </button>

                <button
                  type="button"
                  onClick={restaurarPeriodoActual}
                >
                  Restaurar periodo actual
                </button>

                <button
                  type="button"
                  className="danger"
                  onClick={restaurarBackup}
                >
                  Restaurar backup
                </button>

                <button
                  type="button"
                  onClick={abrirCarpetaBackups}
                >
                  Abrir carpeta de backups
                </button>
                <button type="button" onClick={exportarExcelActual}>
                  Exportar Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="topbar-filters">
        <input
          type="month"
          value={periodoActivo}
          onChange={(e) => setPeriodoActivo(e.target.value)}
          title="Seleccionar mes de trabajo"
          className="periodo-input"
        />
        <select
          value={filtroObra}
          onChange={(e) =>
            setFiltroObra(e.target.value)
          }
        >
          <option value="">
            Todas las obras
          </option>

          {OBRAS.map((obra) => (
            <option key={obra} value={obra}>
              {obra}
            </option>
          ))}
        </select>

        <select
          value={filtroEstado}
          onChange={(e) =>
            setFiltroEstado(e.target.value)
          }
        >
          <option value="">
            Todos los estados
          </option>

          {ESTADOS.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>

        <select
          value={filtroBarrio}
          onChange={(e) =>
            setFiltroBarrio(e.target.value)
          }
        >
          <option value="">
            Todos los barrios
          </option>

          {barriosDisponibles.map((barrio) => (
            <option
              key={barrio}
              value={barrio}
            >
              {barrio}
            </option>
          ))}
        </select>

        {hayFiltros && (
          <button
            type="button"
            className="clear-filters-btn"
            title="Limpiar filtros"
            onClick={() => {
              setFiltroObra('')
              setFiltroEstado('')
              setFiltroBarrio('')
            }}
          >
            ✕
          </button>
        )}
      </div>
    </header>
  )
}

export default Topbar
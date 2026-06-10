import { OBRAS } from '@constants/intervenciones'

function TopbarFilters({
  periodoActivo,
  setPeriodoActivo,

  filtroObra,
  setFiltroObra,
}) {
  const hayFiltros = filtroObra

  function limpiarFiltros() {
    setFiltroObra('')
  }

  return (
    <div className="topbar-filters">
      <input
        type="month"
        value={periodoActivo}
        onChange={(e) =>
          setPeriodoActivo(
            e.target.value
          )
        }
        title="Seleccionar mes de trabajo"
        className="periodo-input"
      />

      <select
        value={filtroObra}
        onChange={(e) =>
          setFiltroObra(
            e.target.value
          )
        }
      >
        <option value="">
          Todas las obras
        </option>

        {OBRAS.map((obra) => (
          <option
            key={obra}
            value={obra}
          >
            {obra}
          </option>
        ))}
      </select>

      {hayFiltros && (
        <button
          type="button"
          className="clear-filters-btn"
          title="Limpiar filtros"
          onClick={limpiarFiltros}
        >
          ✕
        </button>
      )}
    </div>
  )
}

export default TopbarFilters


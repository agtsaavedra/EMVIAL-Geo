import {
  OBRAS,
  ESTADOS,
} from '@constants/intervenciones'

function TopbarFilters({
  periodoActivo,
  setPeriodoActivo,

  filtroObra,
  setFiltroObra,

  filtroEstado,
  setFiltroEstado,
}) {
  const hayFiltros =
    filtroObra ||
    filtroEstado

  function limpiarFiltros() {
    setFiltroObra('')
    setFiltroEstado('')
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

      <select
        value={filtroEstado}
        onChange={(e) =>
          setFiltroEstado(
            e.target.value
          )
        }
      >
        <option value="">
          Todos los estados
        </option>

        {ESTADOS.map((estado) => (
          <option
            key={estado}
            value={estado}
          >
            {estado}
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


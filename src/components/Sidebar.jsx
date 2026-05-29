
import InterventionForm from './InterventionForm'

function Sidebar({
  abierto,
  setAbierto,
  form,
  manejarCambio,
  guardarIntervencion,
  buscarDireccion,
  sugerencias,
  buscandoDireccion,
  seleccionarSugerencia,
  activoEditandoId,
}) {
  

  return (
    <aside className={`sidebar-panel ${abierto ? 'open' : 'closed'}`}>
      <button
        type="button"
        className="sidebar-toggle"
        onClick={() => setAbierto((prev) => !prev)}
        title={abierto ? 'Ocultar formulario' : 'Mostrar formulario'}
      >
        {abierto ? '‹' : '›'}
      </button>

      <div className="sidebar">
        <h1>EMVIAL Geo</h1>
        <p className="subtitle">Gestión operativa territorial</p>

        <InterventionForm
          form={form}
          manejarCambio={manejarCambio}
          guardarIntervencion={guardarIntervencion}
          buscarDireccion={buscarDireccion}
          sugerencias={sugerencias}
          buscandoDireccion={buscandoDireccion}
          seleccionarSugerencia={seleccionarSugerencia}
          activoEditandoId={activoEditandoId}
        />
      </div>
    </aside>
  )
}

export default Sidebar
import InterventionForm from './InterventionForm'

function Sidebar({
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
    <aside className="sidebar">
      <h1>EMVIAL Geo</h1>

      <p className="subtitle">
        Gestión operativa territorial
      </p>

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
    </aside>
  )
}

export default Sidebar
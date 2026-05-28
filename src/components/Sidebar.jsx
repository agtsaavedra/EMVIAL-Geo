import InterventionForm from './InterventionForm'
import mapPin from '../assets/map-pin.svg'


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
      <img
        src={mapPin}
        alt="EMVIAL Geo"
        className="sidebar-logo"
      />

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
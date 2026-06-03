/**
 * Sidebar principal de carga y edición.
 *
 * Contiene el formulario de intervención, búsqueda de dirección y acciones de
 * guardado/cancelación. Es la entrada principal de datos operativos.
 */


import InterventionForm from '@components/form/InterventionForm'
import { useEffect, useRef } from 'react'
// Punto de entrada visual del componente.
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
  cancelarEdicion,
  hayCambiosSinGuardar,
}) {
  
const formContainerRef = useRef(null)

useEffect(() => {
  if (activoEditandoId) {
    formContainerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }
}, [activoEditandoId])

  // Render principal del componente.
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

      <div className="sidebar" ref={formContainerRef}>
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
          cancelarEdicion={cancelarEdicion}
           hayCambiosSinGuardar={hayCambiosSinGuardar}
        />
      </div>
    </aside>
  )
}

export default Sidebar
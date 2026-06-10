import { useEffect, useRef } from 'react'

import InterventionForm from '@components/form/InterventionForm'

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

  return (
    <aside
      className={`sidebar-panel ${
        abierto ? 'open' : 'closed'
      }`}
    >
      <button
        type="button"
        className="sidebar-toggle"
        onClick={() => setAbierto((prev) => !prev)}
        title={
          abierto
            ? 'Ocultar formulario'
            : 'Mostrar formulario'
        }
        aria-label={
          abierto
            ? 'Ocultar formulario'
            : 'Mostrar formulario'
        }
      >
        <span className="toggle-icon">
          {abierto ? '<' : '>'}
        </span>
        <span className="toggle-label">
          Formulario
        </span>
      </button>

      <div
        className="sidebar"
        ref={formContainerRef}
      >
        <h1>EMVIAL Geo</h1>
        <p className="subtitle">
          Gestion operativa territorial
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
          cancelarEdicion={cancelarEdicion}
          hayCambiosSinGuardar={hayCambiosSinGuardar}
        />
      </div>
    </aside>
  )
}

export default Sidebar

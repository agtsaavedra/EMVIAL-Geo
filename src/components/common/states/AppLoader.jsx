/**
 * Estado visual de carga.
 *
 * Componente preparado para mostrar espera centralizada durante arranque o
 * procesos pesados.
 */

import mapPin from '@assets/map-pin.svg'

// Punto de entrada visual del componente.
function AppLoader() {
  // Render principal del componente.
  return (
    <div className="boot-screen">
      <div className="boot-card">
        <div className="boot-logo-wrap">
          <img
            src={mapPin}
            alt="EMVIAL Geo"
            className="boot-logo"
          />
        </div>

        <h1>EMVIAL Geo</h1>

        <p>
          Gestión operativa territorial
        </p>

        <div className="boot-spinner" />

        <small>
          Inicializando mapa y servicios...
        </small>
      </div>
    </div>
  )
}

export default AppLoader
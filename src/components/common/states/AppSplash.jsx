/**
 * Pantalla inicial de bienvenida.
 *
 * Suaviza la entrada a la app mientras se monta la interfaz principal.
 */

import mapPin from '@assets/map-pin.svg'

// Punto de entrada visual del componente.
function AppSplash() {
  // Render principal del componente.
  return (
    <div className="app-splash">
      <div className="app-splash-card">
        <img
          src={mapPin}
          alt="EMVIAL Geo"
          className="app-splash-logo"
        />

        <h1>EMVIAL Geo</h1>

        <p>
          Preparando entorno territorial...
        </p>

        <div className="app-splash-loader">
          <span />
        </div>
      </div>
    </div>
  )
}

export default AppSplash
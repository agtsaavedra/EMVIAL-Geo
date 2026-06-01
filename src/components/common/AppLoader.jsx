import mapPin from '@assets/map-pin.svg'

function AppLoader() {
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
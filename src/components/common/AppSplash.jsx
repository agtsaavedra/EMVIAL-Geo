import mapPin from '@assets/map-pin.svg'

function AppSplash() {
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
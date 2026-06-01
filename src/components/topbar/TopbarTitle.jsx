import mapPin from '@assets/map-pin.svg'

function TopbarTitle() {
  return (
    <div className="topbar-title">
      <img
        src={mapPin}
        alt="EMVIAL Geo"
        className="topbar-logo"
      />

      <div className="topbar-title-text">
        <h3>Mapa de Intervenciones MGP</h3>
      </div>
    </div>
  )
}

export default TopbarTitle


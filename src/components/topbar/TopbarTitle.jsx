import mapPin from '../../assets/map-pin.svg'

function TopbarTitle() {
  return (
    <div className="topbar-title">
      <img
        src={mapPin}
        alt="EMVIAL Geo"
        className="topbar-logo"
      />

      <div className="topbar-title-text">
        <h2>
          Mapa de intervenciones
        </h2>

        <span>
          Mar del Plata / Partido de
          General Pueyrredon
        </span>
      </div>
    </div>
  )
}

export default TopbarTitle


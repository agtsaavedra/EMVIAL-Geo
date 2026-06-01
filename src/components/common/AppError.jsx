import mapPin from '@assets/map-pin.svg'

function AppError({ error }) {
  return (
    <div className="boot-screen">
      <div className="boot-card boot-card-error">
        <img
          src={mapPin}
          alt="EMVIAL Geo"
          className="boot-logo error"
        />

        <h1>Error al iniciar EMVIAL Geo</h1>

        <p>
          La aplicación encontró un problema al cargar.
        </p>

        <pre className="boot-error-box">
          {String(error)}
        </pre>

        <button
          type="button"
          className="boot-retry-btn"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}

export default AppError
import {
  calcularStatsPeriodo,
  formatearNumeroPeriodo,
} from './periodoStats'

function escaparHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function filaResumen(label, value) {
  return `
    <div class="card">
      <span>${escaparHtml(label)}</span>
      <strong>${escaparHtml(value)}</strong>
    </div>
  `
}

function tablaSimple(titulo, filas) {
  const cuerpo = filas
    .map(
      ([nombre, total]) => `
        <tr>
          <td>${escaparHtml(nombre)}</td>
          <td>${escaparHtml(total)}</td>
        </tr>
      `
    )
    .join('')

  return `
    <section>
      <h2>${escaparHtml(titulo)}</h2>
      <table>
        <tbody>${cuerpo}</tbody>
      </table>
    </section>
  `
}

function tablaObras(filas) {
  const cuerpo = filas
    .map(
      (item) => `
        <tr>
          <td>${escaparHtml(item.nombre)}</td>
          <td>${item.total}</td>
          <td>${formatearNumeroPeriodo(item.cuadras, 1)}</td>
          <td>${formatearNumeroPeriodo(item.metrosLineales, 1)}</td>
          <td>${formatearNumeroPeriodo(item.metrosCuadrados, 1)}</td>
        </tr>
      `
    )
    .join('')

  return `
    <section>
      <h2>Detalle por obra</h2>
      <table>
        <thead>
          <tr>
            <th>Obra</th>
            <th>Interv.</th>
            <th>Cuadras</th>
            <th>ML</th>
            <th>M2</th>
          </tr>
        </thead>
        <tbody>${cuerpo}</tbody>
      </table>
    </section>
  `
}

function tablaIntervenciones(intervenciones) {
  const cuerpo = intervenciones
    .map(
      (item) => `
        <tr>
          <td>${escaparHtml(item.obra || 'Sin obra')}</td>
          <td>${escaparHtml(item.barrio || 'Sin barrio')}</td>
          <td>${escaparHtml(item.ubicacion || '')}</td>
          <td>${escaparHtml(item.geometriaTipo || '')}</td>
          <td>${escaparHtml(item.cuadras || '')}</td>
          <td>${escaparHtml(item.metrosLineales || '')}</td>
          <td>${escaparHtml(item.metrosCuadrados || '')}</td>
        </tr>
      `
    )
    .join('')

  return `
    <section class="page-break">
      <h2>Intervenciones del periodo</h2>
      <table>
        <thead>
          <tr>
            <th>Obra</th>
            <th>Barrio</th>
            <th>Ubicacion</th>
            <th>Geom.</th>
            <th>Cuadras</th>
            <th>ML</th>
            <th>M2</th>
          </tr>
        </thead>
        <tbody>${cuerpo}</tbody>
      </table>
    </section>
  `
}

function crearHtmlReporte({
  periodo,
  intervenciones,
}) {
  const stats = calcularStatsPeriodo(intervenciones)
  const fecha = new Date().toLocaleDateString('es-AR')

  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Informe EMVIAL Geo - ${escaparHtml(periodo)}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            color: #172033;
            background: #f6f8fb;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12px;
          }
          main {
            width: min(100%, 960px);
            margin: 0 auto;
            padding: 28px;
          }
          header {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            margin-bottom: 22px;
            padding-bottom: 16px;
            border-bottom: 3px solid #2563eb;
          }
          h1, h2, p { margin: 0; }
          h1 {
            color: #0f172a;
            font-size: 24px;
          }
          header p {
            margin-top: 6px;
            color: #475569;
          }
          .meta {
            text-align: right;
            color: #475569;
            white-space: nowrap;
          }
          .cards {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 20px;
          }
          .card {
            padding: 12px;
            border: 1px solid #dbe3ef;
            border-radius: 10px;
            background: #fff;
          }
          .card span {
            display: block;
            color: #64748b;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }
          .card strong {
            display: block;
            margin-top: 6px;
            color: #0f172a;
            font-size: 20px;
          }
          section {
            margin-top: 18px;
            padding: 14px;
            border: 1px solid #dbe3ef;
            border-radius: 12px;
            background: #fff;
          }
          h2 {
            margin-bottom: 10px;
            color: #1d4ed8;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 8px 7px;
            border-bottom: 1px solid #e2e8f0;
            text-align: left;
            vertical-align: top;
          }
          th {
            color: #334155;
            background: #f1f5f9;
            font-size: 11px;
            text-transform: uppercase;
          }
          td:last-child,
          th:last-child {
            text-align: right;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
          }
          .page-break {
            page-break-before: always;
          }
          @media print {
            body { background: #fff; }
            main { padding: 0; }
            section, .card { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <main>
          <header>
            <div>
              <h1>Informe del periodo ${escaparHtml(periodo)}</h1>
              <p>EMVIAL Geo - resumen operativo mensual</p>
            </div>
            <div class="meta">
              <strong>${fecha}</strong><br />
              ${stats.total} intervenciones
            </div>
          </header>

          <div class="cards">
            ${filaResumen('Intervenciones', stats.total)}
            ${filaResumen(
              'Metros lineales',
              formatearNumeroPeriodo(
                stats.metrosLinealesTotal,
                1
              )
            )}
            ${filaResumen(
              'Metros cuadrados',
              formatearNumeroPeriodo(
                stats.metrosCuadradosTotal,
                1
              )
            )}
            ${filaResumen(
              'Cuadras',
              formatearNumeroPeriodo(
                stats.cuadrasTotal,
                1
              )
            )}
            ${filaResumen('Barrios', stats.porBarrio.length)}
            ${filaResumen('Tipos de obra', stats.porObra.length)}
            ${filaResumen('Con geometria', stats.conGeometria)}
            ${filaResumen('Sin metricas', stats.sinMetricas)}
          </div>

          ${tablaObras(stats.porObra)}

          <div class="grid">
            ${tablaSimple('Por barrio', stats.porBarrio)}
            ${tablaSimple('Por estado', stats.porEstado)}
          </div>

          <div class="grid">
            ${tablaSimple('Por geometria', stats.porGeometria)}
          </div>

          ${tablaIntervenciones(intervenciones)}
        </main>
        <script>
          window.addEventListener('load', () => {
            setTimeout(() => window.print(), 250)
          })
        </script>
      </body>
    </html>
  `
}

export function exportarInformePeriodoPDF(
  intervenciones = [],
  periodo = ''
) {
  if (!intervenciones.length) {
    return false
  }

  const ventana = window.open('', '_blank')

  if (!ventana) {
    return false
  }

  ventana.document.open()
  ventana.document.write(
    crearHtmlReporte({
      periodo,
      intervenciones,
    })
  )
  ventana.document.close()

  return true
}

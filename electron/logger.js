const fs = require('fs')
const path = require('path')
const { app } = require('electron')

function obtenerRutaLog() {
  return path.join(
    app.getPath('userData'),
    'emvial.log'
  )
}

function escribir(level, mensaje, extra) {
  const linea = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    mensaje,
    extra:
      extra instanceof Error
        ? {
          message: extra.message,
          stack: extra.stack,
        }
        : extra,
  })

  try {
    fs.appendFileSync(
      obtenerRutaLog(),
      `${linea}\n`
    )
  } catch {
    // El logger no debe interrumpir la app.
  }

  const salida =
    level === 'error'
      ? console.error
      : level === 'warn'
        ? console.warn
        : console.log

  salida(`[${level}] ${mensaje}`, extra || '')
}

module.exports = {
  info: (mensaje, extra) =>
    escribir('info', mensaje, extra),
  warn: (mensaje, extra) =>
    escribir('warn', mensaje, extra),
  error: (mensaje, extra) =>
    escribir('error', mensaje, extra),
}

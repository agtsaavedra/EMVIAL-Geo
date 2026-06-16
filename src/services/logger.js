const esDev =
  typeof import.meta !== 'undefined' &&
  import.meta.env?.DEV

function escribir(nivel, args) {
  if (!esDev && nivel !== 'error') {
    return
  }

  const metodo =
    nivel === 'error'
      ? console.error
      : nivel === 'warn'
        ? console.warn
        : console.log

  metodo('[EMVIAL Geo]', ...args)
}

export const logger = {
  info(...args) {
    escribir('info', args)
  },

  warn(...args) {
    escribir('warn', args)
  },

  error(...args) {
    escribir('error', args)
  },
}

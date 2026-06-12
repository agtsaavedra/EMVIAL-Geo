const fs = require('fs')
const path = require('path')

const MIN_INTERVALO_REQUEST_MS = 1100
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000
const MAX_ENTRADAS_CACHE = 1500

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizarTexto(valor) {
  return String(valor || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function redondearCoordenada(valor) {
  const numero = Number(valor)

  if (!Number.isFinite(numero)) {
    return ''
  }

  return numero.toFixed(5)
}

function leerCache(cachePath) {
  if (!fs.existsSync(cachePath)) {
    return {}
  }

  try {
    return JSON.parse(
      fs.readFileSync(cachePath, 'utf-8')
    )
  } catch {
    return {}
  }
}

function escribirCache(cachePath, cache) {
  fs.mkdirSync(path.dirname(cachePath), {
    recursive: true,
  })

  const entradas = Object.entries(cache)
    .sort(
      (a, b) =>
        (b[1].timestamp || 0) -
        (a[1].timestamp || 0)
    )
    .slice(0, MAX_ENTRADAS_CACHE)

  fs.writeFileSync(
    cachePath,
    JSON.stringify(
      Object.fromEntries(entradas),
      null,
      2
    )
  )
}

function crearNominatimClient({
  cachePath,
  fetchImpl = fetch,
}) {
  const cache = leerCache(cachePath)
  let ultimoRequest = 0
  let cola = Promise.resolve()

  function obtenerCache(key) {
    const item = cache[key]

    if (!item) return null

    const vigente =
      Date.now() - item.timestamp <
      CACHE_TTL_MS

    return vigente ? item.value : null
  }

  function guardarCache(key, value) {
    cache[key] = {
      timestamp: Date.now(),
      value,
    }

    escribirCache(cachePath, cache)
  }

  function obtenerEstadoCache() {
    const entradas = Object.values(cache)
    const ahora = Date.now()
    const vigentes = entradas.filter(
      (item) =>
        ahora - (item.timestamp || 0) <
        CACHE_TTL_MS
    ).length

    return {
      cachePath,
      total: entradas.length,
      vigentes,
      vencidas: entradas.length - vigentes,
      ttlDias: Math.round(
        CACHE_TTL_MS / (24 * 60 * 60 * 1000)
      ),
      intervaloMs: MIN_INTERVALO_REQUEST_MS,
      maxEntradas: MAX_ENTRADAS_CACHE,
    }
  }

  function limpiarCache() {
    for (const key of Object.keys(cache)) {
      delete cache[key]
    }

    escribirCache(cachePath, cache)

    return obtenerEstadoCache()
  }

  async function ejecutarRequest(url) {
    cola = cola
      .catch(() => {})
      .then(async () => {
        const esperaPendiente =
          MIN_INTERVALO_REQUEST_MS -
          (Date.now() - ultimoRequest)

        if (esperaPendiente > 0) {
          await esperar(esperaPendiente)
        }

        ultimoRequest = Date.now()

        const respuesta = await fetchImpl(url, {
          headers: {
            'User-Agent':
              'EMVIAL-Geo/1.0 (uso municipal interno)',
            Accept: 'application/json',
          },
        })

        if (
          respuesta.status === 429 ||
          respuesta.status === 403
        ) {
          throw new Error(
            `Nominatim rechazo la consulta (${respuesta.status}).`
          )
        }

        const texto = await respuesta.text()

        try {
          return JSON.parse(texto)
        } catch {
          throw new Error(
            'Respuesta inesperada de Nominatim.'
          )
        }
      })

    return cola
  }

  async function buscarDireccion(direccion) {
    const direccionNormalizada =
      normalizarTexto(direccion)

    if (direccionNormalizada.length < 3) {
      return []
    }

    const cacheKey =
      `search:${direccionNormalizada}`
    const cacheHit = obtenerCache(cacheKey)

    if (cacheHit) return cacheHit

    const consultas = [
      `${direccion}, Mar del Plata, Buenos Aires, Argentina`,
      `${direccion}, General Pueyrredon, Buenos Aires, Argentina`,
      `${direccion}, Argentina`,
      direccion,
    ]

    for (const consulta of consultas) {
      const url =
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=` +
        `${encodeURIComponent(consulta)}` +
        `&limit=5&addressdetails=1&countrycodes=ar`

      const datos = await ejecutarRequest(url)

      if (Array.isArray(datos) && datos.length > 0) {
        guardarCache(cacheKey, datos)
        return datos
      }
    }

    guardarCache(cacheKey, [])
    return []
  }

  async function obtenerDireccion(lat, lon) {
    const latRedondeada =
      redondearCoordenada(lat)
    const lonRedondeada =
      redondearCoordenada(lon)

    if (!latRedondeada || !lonRedondeada) {
      return ''
    }

    const cacheKey =
      `reverse:${latRedondeada},${lonRedondeada}`
    const cacheHit = obtenerCache(cacheKey)

    if (cacheHit !== null) return cacheHit

    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
      `&lat=${latRedondeada}&lon=${lonRedondeada}`

    const datos = await ejecutarRequest(url)
    const direccion = datos.display_name || ''

    guardarCache(cacheKey, direccion)

    return direccion
  }

  return {
    buscarDireccion,
    obtenerDireccion,
    obtenerEstadoCache,
    limpiarCache,
  }
}

module.exports = {
  crearNominatimClient,
}

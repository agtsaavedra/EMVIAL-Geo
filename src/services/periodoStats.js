function normalizarTexto(valor, fallback) {
  const texto = String(valor || '').trim()

  return texto || fallback
}

function numero(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return 0
  }

  const normalizado = String(valor)
    .replace(',', '.')
    .replace(/[^\d.-]/g, '')

  const convertido = Number(normalizado)

  return Number.isFinite(convertido) ? convertido : 0
}

function sumarEnGrupo(grupo, clave, campo, valor) {
  if (!grupo[clave]) {
    grupo[clave] = {
      total: 0,
      cuadras: 0,
      metrosLineales: 0,
      metrosCuadrados: 0,
    }
  }

  grupo[clave][campo] += valor
}

function ordenarEntradasNumericas(grupo) {
  return Object.entries(grupo)
    .sort((a, b) => b[1] - a[1])
}

function ordenarEntradasMetricas(grupo) {
  return Object.entries(grupo)
    .map(([nombre, metricas]) => ({
      nombre,
      ...metricas,
    }))
    .sort((a, b) => b.total - a.total)
}

export function formatearNumeroPeriodo(
  valor,
  decimales = 0
) {
  const numeroValido = Number(valor || 0)

  return new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: decimales,
    minimumFractionDigits:
      decimales > 0 ? decimales : 0,
  }).format(numeroValido)
}

export function calcularStatsPeriodo(
  intervenciones = []
) {
  const porEstado = {}
  const porGeometria = {}
  const porBarrio = {}
  const porObra = {}

  let cuadrasTotal = 0
  let metrosLinealesTotal = 0
  let metrosCuadradosTotal = 0
  let conGeometria = 0
  let sinMetricas = 0

  intervenciones.forEach((intervencion) => {
    const estado = normalizarTexto(
      intervencion.estado,
      'Sin estado'
    )
    const geometria = normalizarTexto(
      intervencion.geometriaTipo,
      'Sin geometria'
    )
    const barrio = normalizarTexto(
      intervencion.barrio,
      'Sin barrio'
    )
    const obra = normalizarTexto(
      intervencion.obra,
      'Sin obra'
    )

    const cuadras = numero(intervencion.cuadras)
    const metrosLineales = numero(
      intervencion.metrosLineales
    )
    const metrosCuadrados = numero(
      intervencion.metrosCuadrados
    )

    porEstado[estado] = (porEstado[estado] || 0) + 1
    porGeometria[geometria] =
      (porGeometria[geometria] || 0) + 1
    porBarrio[barrio] = (porBarrio[barrio] || 0) + 1

    sumarEnGrupo(porObra, obra, 'total', 1)
    sumarEnGrupo(porObra, obra, 'cuadras', cuadras)
    sumarEnGrupo(
      porObra,
      obra,
      'metrosLineales',
      metrosLineales
    )
    sumarEnGrupo(
      porObra,
      obra,
      'metrosCuadrados',
      metrosCuadrados
    )

    cuadrasTotal += cuadras
    metrosLinealesTotal += metrosLineales
    metrosCuadradosTotal += metrosCuadrados

    if (
      intervencion.geometria?.length ||
      intervencion.latitud ||
      intervencion.longitud
    ) {
      conGeometria += 1
    }

    if (
      !cuadras &&
      !metrosLineales &&
      !metrosCuadrados
    ) {
      sinMetricas += 1
    }
  })

  return {
    total: intervenciones.length,
    conGeometria,
    sinMetricas,
    cuadrasTotal,
    metrosLinealesTotal,
    metrosCuadradosTotal,
    porEstado: ordenarEntradasNumericas(porEstado),
    porGeometria:
      ordenarEntradasNumericas(porGeometria),
    porBarrio: ordenarEntradasNumericas(porBarrio),
    porObra: ordenarEntradasMetricas(porObra),
  }
}

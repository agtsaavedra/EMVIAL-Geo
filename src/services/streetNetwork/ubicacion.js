export function normalizarNombreCalle(nombre) {
  return String(nombre || '').trim()
}

export function obtenerAlturaAproximada(properties = {}) {
  const valores = [
    properties.l_f_add,
    properties.l_t_add,
    properties.r_f_add,
    properties.r_t_add,
  ]
    .map(Number)
    .filter(
      (valor) =>
        Number.isFinite(valor) && valor > 0
    )

  if (!valores.length) return ''

  const promedio =
    valores.reduce(
      (total, valor) => total + valor,
      0
    ) / valores.length

  return String(
    Math.round(promedio / 100) * 100
  )
}

export function obtenerRangoAlturas(
  features = []
) {
  const valores =
    features.flatMap((feature) => [
      feature.properties?.l_f_add,
      feature.properties?.l_t_add,
      feature.properties?.r_f_add,
      feature.properties?.r_t_add,
    ])
      .map(Number)
      .filter(
        (valor) =>
          Number.isFinite(valor) && valor > 0
      )

  if (!valores.length) return ''

  const min =
    Math.floor(Math.min(...valores) / 100) *
    100
  const max =
    Math.ceil(Math.max(...valores) / 100) *
    100

  if (min === max) {
    return String(min)
  }

  return `${min}/${max}`
}

export function obtenerCallePrincipal(
  tramosDetectados
) {
  const conteo = new Map()

  tramosDetectados.forEach((tramo) => {
    if (!tramo.nombre || tramo.nombre === 'Sin nombre') {
      return
    }

    conteo.set(
      tramo.nombre,
      (conteo.get(tramo.nombre) || 0) + 1
    )
  })

  return [...conteo.entries()]
    .sort((a, b) => b[1] - a[1])[0]?.[0] || ''
}

export function obtenerNombreCallePrincipal(
  tramosDetectados
) {
  const nombres =
    tramosDetectados
      .map((tramo) => tramo.nombre)
      .filter(
        (nombre) =>
          nombre && nombre !== 'Sin nombre'
      )

  return nombres[0] || ''
}

export function construirUbicacionLinea({
  callePrincipal,
  tramosDetectados,
  callesInicio,
  callesFin,
}) {
  const nombre =
    normalizarNombreCalle(callePrincipal)

  if (!nombre) return ''

  const featuresPrincipales =
    tramosDetectados
      .filter(
        (tramo) =>
          tramo.nombre === callePrincipal
      )
      .map((tramo) => tramo.feature)

  const rango =
    obtenerRangoAlturas(
      featuresPrincipales.length
        ? featuresPrincipales
        : tramosDetectados.map(
          (tramo) => tramo.feature
        )
    )

  const entreCalles = [
    callesInicio.find(
      (item) => item !== callePrincipal
    ),
    callesFin.find(
      (item) =>
        item !== callePrincipal &&
        item !== callesInicio[0]
    ) || callesFin.find(
      (item) => item !== callePrincipal
    ),
  ].filter(Boolean)

  const base = rango
    ? `${nombre} ${rango}`
    : nombre

  if (entreCalles.length >= 2) {
    return `${base} e/ ${entreCalles[0]} y ${entreCalles[1]}`
  }

  return base
}

export function construirUbicacionPunto({
  calle,
  callesExtremoA,
  callesExtremoB,
}) {
  const nombre =
    normalizarNombreCalle(calle.nombre)

  if (!nombre || nombre === 'Sin nombre') {
    return ''
  }

  const altura =
    obtenerAlturaAproximada(
      calle.feature.properties
    )

  const entreCalles = [
    callesExtremoA[0],
    callesExtremoB.find(
      (item) => item !== callesExtremoA[0]
    ) || callesExtremoB[0],
  ].filter(Boolean)

  const base = altura
    ? `${nombre} ${altura}`
    : nombre

  if (entreCalles.length >= 2) {
    return `${base} e/ ${entreCalles[0]} y ${entreCalles[1]}`
  }

  return base
}

export function crearFormularioEdicionDesdeBase(
  formBase,
  intervencion = {}
) {
  return {
    ...formBase,

    id: intervencion.id,

    nombre:
      intervencion.nombre || '',

    mesTerminacion:
      intervencion.mesTerminacion ||
      '',

    obra:
      intervencion.obra ||
      'MICROBACHEO',

    ubicacion:
      intervencion.ubicacion ||
      '',

    barrio:
      intervencion.barrio || '',

    estado:
      'Finalizada',

    fuente:
      intervencion.fuente ||
      'Carga manual',

    inspector:
      intervencion.inspector ||
      '',

    realizo:
      intervencion.realizo ||
      '',

    cuadras:
      intervencion.cuadras || '',

    metrosLineales:
      intervencion.metrosLineales ||
      '',

    metrosCuadrados:
      intervencion.metrosCuadrados ||
      '',

    descripcion:
      intervencion.descripcion ||
      '',

    direccion:
      intervencion.direccion ||
      '',

    latitud:
      intervencion.latitud || '',

    longitud:
      intervencion.longitud ||
      '',

    geometriaTipo:
      intervencion.geometriaTipo ||
      'Punto',

    geometria:
      intervencion.geometria || [],
  }
}

export function obtenerPuntoSeleccionadoDesdeFormulario(form) {
  if (!form?.latitud || !form?.longitud) {
    return null
  }

  return [
    parseFloat(form.latitud),
    parseFloat(form.longitud),
  ]
}

export function tieneCambiosSinGuardar(form, formOriginal) {
  const hayGeometria =
    Array.isArray(form.geometria) &&
    form.geometria.length > 0

  if (form.id && formOriginal) {
    return JSON.stringify(form) !==
      JSON.stringify(formOriginal)
  }

  return Boolean(
    form.nombre ||
      form.ubicacion ||
      form.descripcion ||
      form.latitud ||
      form.longitud ||
      hayGeometria
  )
}

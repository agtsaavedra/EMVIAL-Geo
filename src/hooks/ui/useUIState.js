import {
  useEffect,
  useState,
} from 'react'

// =====================================================
// HELPERS LOCALSTORAGE
// =====================================================
// Estos helpers están blindados con try/catch para que,
// si localStorage falla o hay una clave corrupta,
// la app no se rompa y use el valor por defecto.

function leerBooleanStorage(
  clave,
  valorDefault
) {
  try {
    const valorGuardado =
      window.localStorage.getItem(clave)

    if (valorGuardado === null) {
      return valorDefault
    }

    return valorGuardado === 'true'
  } catch {
    return valorDefault
  }
}

function guardarBooleanStorage(
  clave,
  valor
) {
  try {
    window.localStorage.setItem(
      clave,
      String(Boolean(valor))
    )
  } catch {
    // Si localStorage falla, no rompemos la app.
  }
}

export function useUIState() {
  // =====================================================
  // TEMA / APARIENCIA
  // =====================================================

  const [modoOscuro, setModoOscuro] =
    useState(() =>
      leerBooleanStorage(
        'emvial-modo-oscuro',
        true
      )
    )

  // =====================================================
  // BÚSQUEDA / GEOCODING
  // =====================================================
  // No se persiste: son estados temporales de sesión.

  const [busqueda, setBusqueda] =
    useState('')

  const [sugerencias, setSugerencias] =
    useState([])

  const [
    buscandoDireccion,
    setBuscandoDireccion,
  ] = useState(false)

  // =====================================================
  // MAPA / BARRIOS
  // =====================================================

  const [
    puntoSeleccionado,
    setPuntoSeleccionado,
  ] = useState(null)

  const [
    barrioSeleccionado,
    setBarrioSeleccionado,
  ] = useState('')

  const [
    mostrarBarrios,
    setMostrarBarrios,
  ] = useState(() =>
    leerBooleanStorage(
      'emvial-mostrar-barrios',
      true
    )
  )

  // =====================================================
  // FILTROS ADMINISTRATIVOS
  // =====================================================
  // El filtro de barrio fue eliminado del Topbar.
  // El barrio ahora se maneja desde el selector espacial del mapa.

  const [filtroObra, setFiltroObra] =
    useState('')

  const [
    filtroEstado,
    setFiltroEstado,
  ] = useState('')

  // =====================================================
  // FOCO / HOVER DE INTERVENCIÓN
  // =====================================================
  // intervencionEnfocada:
  // - selección real
  // - se usa para centrar mapa / popup / foco fuerte
  //
  // intervencionHoverId:
  // - selección temporal por hover
  // - se usa para resaltar en mapa sin moverlo

  const [
    intervencionEnfocada,
    setIntervencionEnfocada,
  ] = useState(null)

  const [
    intervencionHoverId,
    setIntervencionHoverId,
  ] = useState(null)

  // =====================================================
  // MODO DIBUJO
  // =====================================================

  const [
    modoDibujo,
    setModoDibujo,
  ] = useState(() =>
    leerBooleanStorage(
      'emvial-modo-dibujo',
      true
    )
  )

  // =====================================================
  // PANELES / LAYOUT
  // =====================================================

  const [
    sidebarAbierto,
    setSidebarAbierto,
  ] = useState(() =>
    leerBooleanStorage(
      'emvial-sidebar-abierto',
      true
    )
  )

  const [
    assetsPanelAbierto,
    setAssetsPanelAbierto,
  ] = useState(() =>
    leerBooleanStorage(
      'emvial-assets-panel-abierto',
      true
    )
  )

  const [
    menuAbierto,
    setMenuAbierto,
  ] = useState(false)

  // =====================================================
  // PERSISTENCIA DE PREFERENCIAS VISUALES
  // =====================================================

  useEffect(() => {
    guardarBooleanStorage(
      'emvial-modo-oscuro',
      modoOscuro
    )
  }, [modoOscuro])

  useEffect(() => {
    guardarBooleanStorage(
      'emvial-mostrar-barrios',
      mostrarBarrios
    )
  }, [mostrarBarrios])

  useEffect(() => {
    guardarBooleanStorage(
      'emvial-modo-dibujo',
      modoDibujo
    )
  }, [modoDibujo])

  useEffect(() => {
    guardarBooleanStorage(
      'emvial-sidebar-abierto',
      sidebarAbierto
    )
  }, [sidebarAbierto])

  useEffect(() => {
    guardarBooleanStorage(
      'emvial-assets-panel-abierto',
      assetsPanelAbierto
    )
  }, [assetsPanelAbierto])

  // =====================================================
  // API DEL HOOK
  // =====================================================

  return {
    modoOscuro,
    setModoOscuro,

    busqueda,
    setBusqueda,

    sugerencias,
    setSugerencias,

    buscandoDireccion,
    setBuscandoDireccion,

    puntoSeleccionado,
    setPuntoSeleccionado,

    barrioSeleccionado,
    setBarrioSeleccionado,

    mostrarBarrios,
    setMostrarBarrios,

    menuAbierto,
    setMenuAbierto,

    filtroObra,
    setFiltroObra,

    filtroEstado,
    setFiltroEstado,

    intervencionEnfocada,
    setIntervencionEnfocada,

    intervencionHoverId,
    setIntervencionHoverId,

    modoDibujo,
    setModoDibujo,

    sidebarAbierto,
    setSidebarAbierto,

    assetsPanelAbierto,
    setAssetsPanelAbierto,
  }
}

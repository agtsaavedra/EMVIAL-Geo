import {
  useCallback,
  useRef,
  useState,
} from 'react'

export function useLineLocationState() {
  const [
    ubicacionAutomaticaLinea,
    setUbicacionAutomaticaLinea,
  ] = useState(false)
  const [
    ubicacionManualLinea,
    setUbicacionManualLinea,
  ] = useState(false)
  const [recalculoLineaTick, setRecalculoLineaTick] =
    useState(0)

  const ubicacionAutoLineaRef =
    useRef('')
  const ubicacionLineaManualRef =
    useRef(false)
  const cuadrasManualRef =
    useRef(false)
  const calculoCuadrasVersionRef =
    useRef(0)
  const advertenciaLineaRef =
    useRef('')

  const invalidarUbicacionAutoLinea = useCallback(() => {
    ubicacionAutoLineaRef.current = ''
    ubicacionLineaManualRef.current = false
    cuadrasManualRef.current = false
    setUbicacionAutomaticaLinea(false)
    setUbicacionManualLinea(false)
    advertenciaLineaRef.current = ''
    calculoCuadrasVersionRef.current += 1
  }, [])

  const recalcularUbicacionLinea = useCallback(() => {
    ubicacionLineaManualRef.current = false
    cuadrasManualRef.current = false
    ubicacionAutoLineaRef.current = ''
    setUbicacionAutomaticaLinea(false)
    setUbicacionManualLinea(false)
    setRecalculoLineaTick((actual) => actual + 1)
  }, [])

  const marcarUbicacionLineaManual = useCallback((valor) => {
    ubicacionLineaManualRef.current = true
    ubicacionAutoLineaRef.current = ''
    setUbicacionAutomaticaLinea(false)
    setUbicacionManualLinea(
      String(valor).trim() !== ''
    )
  }, [])

  const restaurarUbicacionLineaManual = useCallback(() => {
    ubicacionLineaManualRef.current = true
    ubicacionAutoLineaRef.current = ''
    setUbicacionAutomaticaLinea(false)
    setUbicacionManualLinea(true)
  }, [])

  const marcarCuadrasManual = useCallback(() => {
    cuadrasManualRef.current = true
  }, [])

  return {
    ubicacionAutomaticaLinea,
    ubicacionManualLinea,
    recalculoLineaTick,
    setUbicacionAutomaticaLinea,
    setUbicacionManualLinea,
    ubicacionAutoLineaRef,
    ubicacionLineaManualRef,
    cuadrasManualRef,
    calculoCuadrasVersionRef,
    advertenciaLineaRef,
    invalidarUbicacionAutoLinea,
    recalcularUbicacionLinea,
    marcarUbicacionLineaManual,
    restaurarUbicacionLineaManual,
    marcarCuadrasManual,
  }
}

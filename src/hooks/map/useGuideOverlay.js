import { useState } from 'react'

export function useGuideOverlay() {
  const [guideUrl, setGuideUrl] =
    useState(null)

  const [guideName, setGuideName] =
    useState('')

  const [guideBounds, setGuideBounds] =
    useState(null)

  const [guideOpacity, setGuideOpacity] =
    useState(0.45)

  const [guideVisible, setGuideVisible] =
    useState(true)

  function cargarImagenGuia(file) {
    if (!file) return

    if (guideUrl) {
      URL.revokeObjectURL(guideUrl)
    }

    const url = URL.createObjectURL(file)

    setGuideUrl(url)
    setGuideName(file.name)
    setGuideBounds(null)
    setGuideVisible(true)
    setGuideOpacity(0.45)
  }

  function quitarImagenGuia() {
    if (guideUrl) {
      URL.revokeObjectURL(guideUrl)
    }

    setGuideUrl(null)
    setGuideName('')
    setGuideBounds(null)
    setGuideVisible(true)
    setGuideOpacity(0.45)
  }

  function moverImagenGuia(direccion) {
    setGuideBounds((prev) => {
      if (!prev) return prev

      const [[south, west], [north, east]] =
        prev

      const alto = north - south
      const ancho = east - west

      const pasoLat = alto * 0.12
      const pasoLng = ancho * 0.12

      if (direccion === 'norte') {
        return [
          [south + pasoLat, west],
          [north + pasoLat, east],
        ]
      }

      if (direccion === 'sur') {
        return [
          [south - pasoLat, west],
          [north - pasoLat, east],
        ]
      }

      if (direccion === 'este') {
        return [
          [south, west + pasoLng],
          [north, east + pasoLng],
        ]
      }

      if (direccion === 'oeste') {
        return [
          [south, west - pasoLng],
          [north, east - pasoLng],
        ]
      }

      return prev
    })
  }

  function escalarImagenGuia(factor) {
    setGuideBounds((prev) => {
      if (!prev) return prev

      const [[south, west], [north, east]] =
        prev

      const centroLat = (south + north) / 2
      const centroLng = (west + east) / 2

      const semiAlto =
        ((north - south) / 2) * factor

      const semiAncho =
        ((east - west) / 2) * factor

      return [
        [
          centroLat - semiAlto,
          centroLng - semiAncho,
        ],
        [
          centroLat + semiAlto,
          centroLng + semiAncho,
        ],
      ]
    })
  }

  return {
    guideUrl,
    guideName,
    guideBounds,
    setGuideBounds,
    guideOpacity,
    setGuideOpacity,
    guideVisible,
    setGuideVisible,
    cargarImagenGuia,
    quitarImagenGuia,
    moverImagenGuia,
    escalarImagenGuia,
  }
}

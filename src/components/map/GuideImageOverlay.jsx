import { useEffect } from 'react'

import {
  ImageOverlay,
  useMap,
} from 'react-leaflet'

function GuideImageOverlay({
  guideUrl,
  guideBounds,
  setGuideBounds,
  guideOpacity,
  guideVisible,
}) {
  const map = useMap()

  useEffect(() => {
    if (!guideUrl || guideBounds) return

    const image = new Image()

    image.onload = () => {
      const mapBounds = map.getBounds()
      const center = map.getCenter()

      const latSpan = Math.abs(
        mapBounds.getNorth() -
          mapBounds.getSouth()
      )

      const lngSpan = Math.abs(
        mapBounds.getEast() -
          mapBounds.getWest()
      )

      const imageRatio =
        image.width / image.height

      let alto = latSpan * 0.45
      let ancho = alto * imageRatio

      const maxAncho = lngSpan * 0.72

      if (ancho > maxAncho) {
        ancho = maxAncho
        alto = ancho / imageRatio
      }

      setGuideBounds([
        [
          center.lat - alto / 2,
          center.lng - ancho / 2,
        ],
        [
          center.lat + alto / 2,
          center.lng + ancho / 2,
        ],
      ])
    }

    image.src = guideUrl
  }, [
    guideUrl,
    guideBounds,
    map,
    setGuideBounds,
  ])

  if (
    !guideUrl ||
    !guideBounds ||
    !guideVisible
  ) {
    return null
  }

  return (
    <ImageOverlay
      url={guideUrl}
      bounds={guideBounds}
      opacity={guideOpacity}
      interactive={false}
      zIndex={650}
    />
  )
}

export default GuideImageOverlay

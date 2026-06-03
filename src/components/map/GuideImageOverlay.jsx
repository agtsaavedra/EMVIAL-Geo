/**
 * Overlay visual de imagen guía sobre Leaflet.
 *
 * Calcula bounds iniciales respetando la proporción, renderiza el ImageOverlay
 * y aplica rotación preservando el transform interno de Leaflet.
 */

import { useEffect } from 'react'

import {
    ImageOverlay,
    useMap,
} from 'react-leaflet'

// Punto de entrada visual del componente.
function GuideImageOverlay({
    guideUrl,
    guideBounds,
    setGuideBounds,
    guideOpacity,
    guideVisible,
    guideRotation,
}) {
    const map = useMap()

    useEffect(() => {
        if (!guideUrl || guideBounds) return

        const image = new Image()

        image.onload = () => {
            const mapBounds =
                map.getBounds()

            const center =
                map.getCenter()

            const latSpan = Math.abs(
                mapBounds.getNorth() -
                mapBounds.getSouth()
            )

            const lngSpan = Math.abs(
                mapBounds.getEast() -
                mapBounds.getWest()
            )

            const imageRatio =
                image.width /
                image.height

            let alto =
                latSpan * 0.45

            let ancho =
                alto * imageRatio

            const maxAncho =
                lngSpan * 0.72

            if (ancho > maxAncho) {
                ancho = maxAncho
                alto =
                    ancho / imageRatio
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
    useEffect(() => {
        const image =
            document.querySelector(
                '.guide-image-overlay'
            )

        if (!image) return

        image.style.transformOrigin =
            'center center'

        const transformActual =
            image.style.transform || ''

        const limpio =
            transformActual.replace(
                /rotate\([^)]*\)/g,
                ''
            )

        image.style.transform =
            `${limpio} rotate(${guideRotation}deg)`
    }, [
        guideRotation,
        guideBounds,
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
            className="guide-image-overlay"
        />
    )
}

export default GuideImageOverlay
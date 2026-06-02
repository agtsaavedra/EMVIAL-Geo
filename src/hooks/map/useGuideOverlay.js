import { useState } from 'react'

import {
    getDocument,
    GlobalWorkerOptions,
} from 'pdfjs-dist'

import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'

GlobalWorkerOptions.workerSrc =
    pdfWorker

async function convertirPdfAImagen(file) {
    const arrayBuffer =
        await file.arrayBuffer()

    const pdf =
        await getDocument({
            data: arrayBuffer,
        }).promise

    const page =
        await pdf.getPage(1)

    const viewport =
        page.getViewport({
            scale: 2,
        })

    const canvas =
        document.createElement('canvas')

    const context =
        canvas.getContext('2d')

    canvas.width =
        viewport.width

    canvas.height =
        viewport.height

    await page.render({
        canvasContext: context,
        viewport,
    }).promise

    const blob =
        await new Promise((resolve) => {
            canvas.toBlob(
                resolve,
                'image/png'
            )
        })

    return URL.createObjectURL(blob)
}

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

    const [
        guideLoading,
        setGuideLoading,
    ] = useState(false)

    const [guideLocked, setGuideLocked] =
        useState(false)

    function centrarImagenGuia() {
        setGuideBounds(null)
    }

    async function cargarImagenGuia(file) {

        setGuideLocked(false)
        if (!file) return

        try {
            setGuideLoading(true)

            if (guideUrl) {
                URL.revokeObjectURL(
                    guideUrl
                )
            }

            const esPdf =
                file.type ===
                'application/pdf' ||
                file.name
                    .toLowerCase()
                    .endsWith('.pdf')

            const url = esPdf
                ? await convertirPdfAImagen(
                    file
                )
                : URL.createObjectURL(file)

            setGuideUrl(url)

            setGuideName(file.name)

            setGuideBounds(null)

            setGuideVisible(true)

            setGuideOpacity(0.45)
        } catch (error) {
            console.error(
                'Error cargando guía:',
                error
            )
        } finally {
            setGuideLoading(false)
        }
    }

    function quitarImagenGuia() {

        setGuideLocked(false)
        if (guideUrl) {
            URL.revokeObjectURL(
                guideUrl
            )
        }

        setGuideUrl(null)
        setGuideName('')
        setGuideBounds(null)
        setGuideVisible(true)
        setGuideOpacity(0.45)
    }

    function moverImagenGuia(direccion) {
        if (guideLocked) return
        setGuideBounds((prev) => {
            if (!prev) return prev

            const [
                [south, west],
                [north, east],
            ] = prev

            const alto =
                north - south

            const ancho =
                east - west

            const pasoLat =
                alto * 0.12

            const pasoLng =
                ancho * 0.12

            if (
                direccion === 'norte'
            ) {
                return [
                    [
                        south + pasoLat,
                        west,
                    ],
                    [
                        north + pasoLat,
                        east,
                    ],
                ]
            }

            if (
                direccion === 'sur'
            ) {
                return [
                    [
                        south - pasoLat,
                        west,
                    ],
                    [
                        north - pasoLat,
                        east,
                    ],
                ]
            }

            if (
                direccion === 'este'
            ) {
                return [
                    [
                        south,
                        west + pasoLng,
                    ],
                    [
                        north,
                        east + pasoLng,
                    ],
                ]
            }

            if (
                direccion === 'oeste'
            ) {
                return [
                    [
                        south,
                        west - pasoLng,
                    ],
                    [
                        north,
                        east - pasoLng,
                    ],
                ]
            }

            return prev
        })
    }

    function escalarImagenGuia(factor) {
        if (guideLocked) return
        setGuideBounds((prev) => {
            if (!prev) return prev

            const [
                [south, west],
                [north, east],
            ] = prev

            const centroLat =
                (south + north) / 2

            const centroLng =
                (west + east) / 2

            const semiAlto =
                ((north - south) / 2) *
                factor

            const semiAncho =
                ((east - west) / 2) *
                factor

            return [
                [
                    centroLat -
                    semiAlto,
                    centroLng -
                    semiAncho,
                ],
                [
                    centroLat +
                    semiAlto,
                    centroLng +
                    semiAncho,
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

        guideLoading,

        cargarImagenGuia,
        quitarImagenGuia,
        moverImagenGuia,
        escalarImagenGuia,

        guideLocked,
        setGuideLocked,
        centrarImagenGuia,
    }
}
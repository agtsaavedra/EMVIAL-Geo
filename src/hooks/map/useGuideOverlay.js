/**
 * Hook de imagen guía / hoja de calcar.
 *
 * Permite cargar imágenes o PDFs, convertir PDFs a imagen y controlar
 * visibilidad, opacidad, posición, escala, bloqueo y rotación del overlay.
 */

import { useEffect, useState } from 'react'

import {
  getDocument,
  GlobalWorkerOptions,
} from 'pdfjs-dist'

import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'

GlobalWorkerOptions.workerSrc =
  pdfWorker

// Renderiza la primera página de un PDF como PNG para usarlo como overlay.
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
      scale: 1.35,
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

// Punto de entrada público del hook.
export function useGuideOverlay({
  mostrarToast,
}) {
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

  const [
    guideRotation,
    setGuideRotation,
  ] = useState(0)

  useEffect(() => {
    return () => {
      if (guideUrl) {
        URL.revokeObjectURL(
          guideUrl
        )
      }
    }
  }, [guideUrl])

  // Reinicia los bounds para volver a centrar automáticamente la guía.
  function centrarImagenGuia() {
    setGuideBounds(null)
  }

  // Suma o resta grados a la rotación actual de la guía.
  function rotarImagenGuia(delta) {
    setGuideRotation(
      (prev) => prev + delta
    )
  }

  // Vuelve la rotación de la guía a cero grados.
  function resetearRotacionGuia() {
    setGuideRotation(0)
  }

  // Carga una imagen o PDF como guía y resetea sus controles.
  async function cargarImagenGuia(file) {
    if (guideLoading) return

    setGuideLoading(true)

    // ------------------------------------
    // Validaciones de archivo
    // ------------------------------------

    const tiposPermitidos = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/webp',
    ]

    const tamanoMaxMb = 50

    const tamanoMaxBytes =
      tamanoMaxMb *
      1024 *
      1024

    if (!file) {
      setGuideLoading(false)
      return
    }

    if (
      !tiposPermitidos.includes(
        file.type
      )
    ) {
      mostrarToast(
        'Formato no soportado. Solo PDF, PNG, JPG o WEBP.',
        'error'
      )
      setGuideLoading(false)
      return
    }

    if (
      file.size >
      tamanoMaxBytes
    ) {
      mostrarToast(
        `El archivo supera ${tamanoMaxMb} MB.`,
        'error'
      )

      setGuideLoading(false)
      return
    }

    setGuideLocked(false)
    setGuideRotation(0)

    try {
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
        : URL.createObjectURL(
          file
        )

      setGuideUrl(url)

      setGuideName(file.name)

      setGuideBounds(null)

      setGuideVisible(true)

      setGuideOpacity(0.45)
    } catch (error) {
      mostrarToast(
        'No se pudo cargar la guía seleccionada.',
        'error'
      )
    } finally {
      setGuideLoading(false)
    }
  }

  // Elimina la guía actual y libera recursos asociados.
  function quitarImagenGuia() {
    setGuideLocked(false)

    setGuideRotation(0)

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

  // Desplaza la imagen guía en una dirección cardinal.
  function moverImagenGuia(
    direccion
  ) {
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
            west +
            pasoLng,
          ],
          [
            north,
            east +
            pasoLng,
          ],
        ]
      }

      if (
        direccion ===
        'oeste'
      ) {
        return [
          [
            south,
            west -
            pasoLng,
          ],
          [
            north,
            east -
            pasoLng,
          ],
        ]
      }

      return prev
    })
  }

  // Aumenta o reduce el tamaño de la imagen guía.
  function escalarImagenGuia(
    factor
  ) {
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
        ((north - south) /
          2) *
        factor

      const semiAncho =
        ((east - west) /
          2) *
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

  // API pública que consume el resto de la aplicación.
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

    guideLocked,
    setGuideLocked,

    guideRotation,

    cargarImagenGuia,
    quitarImagenGuia,

    moverImagenGuia,
    escalarImagenGuia,

    centrarImagenGuia,
    rotarImagenGuia,
    resetearRotacionGuia,
  }
}
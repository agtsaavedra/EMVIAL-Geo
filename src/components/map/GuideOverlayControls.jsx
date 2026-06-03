/**
 * Controles flotantes de la imagen guía.
 *
 * Permite mover, escalar, rotar, bloquear, ocultar, quitar y usar como fuente
 * el PDF/imagen cargado como hoja de calcar.
 */

import { useRef, useState } from 'react'

// Punto de entrada visual del componente.
function GuideOverlayControls({
    guideUrl,
    guideName,
    guideOpacity,
    setGuideOpacity,
    guideVisible,
    setGuideVisible,
    quitarImagenGuia,
    moverImagenGuia,
    escalarImagenGuia,
    guideLocked,
    setGuideLocked,
    centrarImagenGuia,
    usarGuiaComoFuente,
    guideRotation,
    rotarImagenGuia,
    resetearRotacionGuia,
}) {
    const panelRef = useRef(null)

  // Define la posición inicial del panel dentro de la ventana.
  function obtenerPosicionInicial() {
  return {
    x: Math.max(16, window.innerWidth - 285),
    y: 150,
  }
}

    const [posicion, setPosicion] = useState(
        obtenerPosicionInicial
    )

    const dragRef = useRef({
        activo: false,
        offsetX: 0,
        offsetY: 0,
    })

    if (!guideUrl) return null

    // Inicia el arrastre del panel flotante calculando el offset del mouse.
    function iniciarArrastre(e) {
        const panel = panelRef.current
        if (!panel) return

        const rect = panel.getBoundingClientRect()

        dragRef.current = {
            activo: true,
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top,
        }

        window.addEventListener('mousemove', moverPanel)
        window.addEventListener('mouseup', soltarPanel)
    }

    // Actualiza la posición del panel flotante durante el arrastre.
    function moverPanel(e) {
        if (!dragRef.current.activo) return

        const nuevoX = e.clientX - dragRef.current.offsetX
        const nuevoY = e.clientY - dragRef.current.offsetY

        const margen = 8

        setPosicion({
            x: Math.max(margen, nuevoX),
            y: Math.max(margen, nuevoY),
        })
    }

    // Finaliza el arrastre y remueve listeners globales.
    function soltarPanel() {
        dragRef.current.activo = false

        window.removeEventListener('mousemove', moverPanel)
        window.removeEventListener('mouseup', soltarPanel)
    }

    return (
        <div
            ref={panelRef}
            className="guide-overlay-controls draggable"
            style={{
                left: posicion.x,
                top: posicion.y,
            }}
        >
            <div
                className="guide-panel-drag-handle"
                onMouseDown={iniciarArrastre}
            >
                <span>Imagen guía</span>
                <small>arrastrar</small>
            </div>

            <div className="guide-panel">
                <div className="guide-panel-header">
                    <strong>Imagen guía</strong>

                    <span title={guideName}>
                        {guideName}
                    </span>
                </div>

                <div className="guide-row">
                    <button
                        type="button"
                        onClick={() =>
                            setGuideVisible((prev) => !prev)
                        }
                    >
                        {guideVisible ? 'Ocultar' : 'Mostrar'}
                    </button>

                    <button
                        type="button"
                        className="danger"
                        onClick={quitarImagenGuia}
                    >
                        Quitar
                    </button>
                </div>

                <div className="guide-secondary-row">
                    <button
                        type="button"
                        onClick={() =>
                            setGuideLocked((prev) => !prev)
                        }
                    >
                        {guideLocked ? 'Desbloq.' : 'Bloquear'}
                    </button>

                    <button
                        type="button"
                        onClick={centrarImagenGuia}
                    >
                        Centrar
                    </button>

                    {usarGuiaComoFuente && (
                        <button
                            type="button"
                            className="guide-source-btn"
                            onClick={usarGuiaComoFuente}
                        >
                            Fuente
                        </button>
                    )}
                </div>
                <div className="guide-secondary-row">
                    <button
                        type="button"
                        onClick={() =>
                            rotarImagenGuia(-2)
                        }
                    >
                        ↺
                    </button>

                    <button
                        type="button"
                        onClick={
                            resetearRotacionGuia
                        }
                    >
                        {guideRotation}°
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            rotarImagenGuia(2)
                        }
                    >
                        ↻
                    </button>
                </div>

                <label className="guide-opacity">
                    Opacidad
                    <input
                        type="range"
                        min="0.15"
                        max="0.9"
                        step="0.05"
                        value={guideOpacity}
                        onChange={(e) =>
                            setGuideOpacity(Number(e.target.value))
                        }
                    />
                </label>

                <div className="guide-move-grid">
                    <span />

                    <button
                        type="button"
                        onClick={() => moverImagenGuia('norte')}
                        disabled={guideLocked}
                    >
                        ↑
                    </button>

                    <span />

                    <button
                        type="button"
                        onClick={() => moverImagenGuia('oeste')}
                        disabled={guideLocked}
                    >
                        ←
                    </button>

                    <button
                        type="button"
                        onClick={() => escalarImagenGuia(1.12)}
                        disabled={guideLocked}
                    >
                        +
                    </button>

                    <button
                        type="button"
                        onClick={() => moverImagenGuia('este')}
                        disabled={guideLocked}
                    >
                        →
                    </button>

                    <span />

                    <button
                        type="button"
                        onClick={() => moverImagenGuia('sur')}
                        disabled={guideLocked}
                    >
                        ↓
                    </button>

                    <button
                        type="button"
                        onClick={() => escalarImagenGuia(0.9)}
                        disabled={guideLocked}
                    >
                        -
                    </button>
                </div>
            </div>
        </div>
    )
}

export default GuideOverlayControls
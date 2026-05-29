import { useState } from 'react'

export function useUIState() {
    const [modoOscuro, setModoOscuro] = useState(true)
    const [busqueda, setBusqueda] = useState('')
    const [sugerencias, setSugerencias] = useState([])
    const [buscandoDireccion, setBuscandoDireccion] = useState(false)
    const [puntoSeleccionado, setPuntoSeleccionado] = useState(null)
    const [barrioSeleccionado, setBarrioSeleccionado] = useState('')
    const [mostrarBarrios, setMostrarBarrios] = useState(true)
    const [menuAbierto, setMenuAbierto] = useState(false)
    const [filtroObra, setFiltroObra] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('')
    const [filtroBarrio, setFiltroBarrio] = useState('')
    const [intervencionEnfocada, setIntervencionEnfocada] = useState(null)
    const [modoDibujo, setModoDibujo] = useState(true)
    const [sidebarAbierto, setSidebarAbierto] = useState(true)
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
        filtroBarrio,
        setFiltroBarrio,
        intervencionEnfocada,
        setIntervencionEnfocada,
        modoDibujo,
        setModoDibujo,
        sidebarAbierto,
        setSidebarAbierto,
    }
}
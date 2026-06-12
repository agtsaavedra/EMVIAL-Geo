/*
  App.jsx

  Componente raíz de la interfaz React.

  Después del refactor, este archivo queda deliberadamente liviano:
  no contiene reglas de negocio ni armado manual de props. Su función es
  componer el layout principal de la aplicación y renderizar los componentes
  globales: sidebar, topbar, mapa, panel de intervenciones, toast, diálogos
  y splash screen.

  La orquestación de estado, acciones, datos y efectos globales vive en
  useAppServices().
*/

import './App.css'

import Sidebar from '@components/layout/Sidebar'
import AssetsPanel from '@components/layout/AssetsPanel'
import Topbar from '@components/layout/Topbar'
import MapView from '@components/map/MapView'

import Toast from '@components/common/Toast'
import ConfirmDialog from '@components/common/ConfirmDialog'
import AboutDialog from '@components/common/AboutDialog'
import DataQualityDialog from '@components/common/DataQualityDialog'
import AppSplash from '@components/common/states/AppSplash'

import { useAppServices } from '@hooks/app/core/useAppServices'

function App() {
  const {
    modoOscuro,

    mostrarSplash,

    toast,

    dialogo,
    cerrarDialogo,
    confirmarDialogoActual,

    aboutAbierto,
    cerrarAbout,
    estadoApp,
    estadoGeocoding,
    limpiarCacheGeocoding,
    periodoActivo,

    dataQualityAbierto,
    cerrarDataQuality,
    enfocarIssueDataQuality,
    editarIssueDataQuality,
    intervencionesFiltradas,

    topbarProps,
    sidebarProps,
    mapProps,
    assetsPanelProps,
  } = useAppServices()

  return (
    <>
      {mostrarSplash && <AppSplash />}

      <div className={`app ${modoOscuro ? 'dark' : ''}`}>
        <Sidebar {...sidebarProps} />

        <main className="main">
          <Topbar {...topbarProps} />

          <section className="content">
            <MapView {...mapProps} />

            <AssetsPanel {...assetsPanelProps} />
          </section>
        </main>

        <Toast toast={toast} />

        <ConfirmDialog
          abierto={Boolean(dialogo)}
          titulo={dialogo?.titulo}
          mensaje={dialogo?.mensaje}
          detalle={dialogo?.detalle}
          textoConfirmar={dialogo?.textoConfirmar}
          textoCancelar={dialogo?.textoCancelar}
          danger={dialogo?.danger}
          onCancelar={cerrarDialogo}
          onConfirmar={confirmarDialogoActual}
        />

        <AboutDialog
          abierto={aboutAbierto}
          onCerrar={cerrarAbout}
          estadoApp={estadoApp}
          estadoGeocoding={estadoGeocoding}
          onLimpiarCacheGeocoding={limpiarCacheGeocoding}
          periodoActivo={periodoActivo}
        />

        <DataQualityDialog
          abierto={dataQualityAbierto}
          intervenciones={
            intervencionesFiltradas
          }
          onClose={cerrarDataQuality}
          onFocusIssue={enfocarIssueDataQuality}
          onEditIssue={editarIssueDataQuality}
        />
      </div>
    </>
  )
}

export default App

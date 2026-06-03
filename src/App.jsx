import './App.css'

import Sidebar from '@components/layout/Sidebar'
import AssetsPanel from '@components/layout/AssetsPanel'
import Topbar from '@components/layout/Topbar'
import MapView from '@components/map/MapView'

import Toast from '@components/common/Toast'
import ConfirmDialog from '@components/common/ConfirmDialog'
import AboutDialog from '@components/common/AboutDialog'
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
    periodoActivo,

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
          periodoActivo={periodoActivo}
        />
      </div>
    </>
  )
}

export default App

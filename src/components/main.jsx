import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'
import AppLoader from './components/AppLoader'
import AppError from './components/AppError'

import './index.css'
import './styles/boot.css'

const root = ReactDOM.createRoot(
  document.getElementById('root')
)

root.render(<AppLoader />)

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
} catch (error) {
  console.error(error)

  root.render(
    <AppError error={error} />
  )
}
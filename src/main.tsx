import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css' // Make sure this path matches your globals.css location

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
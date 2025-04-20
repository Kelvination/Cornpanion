import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  const updateSW = registerSW({
    onNeedRefresh() {
      if (confirm('New content available. Reload?')) {
        updateSW()
      }
    },
    onOfflineReady() {
      console.log('App ready to work offline')
    }
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
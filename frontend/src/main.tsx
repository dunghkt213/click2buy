import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './styles/globals.css'
import { Toaster } from 'sonner'
import { AppProvider } from './providers/AppProvider'
import { cleanupExpiredCache } from './utils/cache'

// Cleanup expired cache khi app start
cleanupExpiredCache();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
        <Toaster position="top-right" richColors />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

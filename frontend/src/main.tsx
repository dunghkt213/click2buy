import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App'
import { NotificationProvider } from './contexts/NotificationContext'
import { AppProvider } from './providers/AppProvider'
import './styles/globals.css'
import { cleanupExpiredCache } from './utils/cache'

// Cleanup expired cache khi app start
cleanupExpiredCache();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <NotificationProvider>
          <App />
          <Toaster position="bottom-left" richColors />
        </NotificationProvider>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

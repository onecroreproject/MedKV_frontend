import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PurchaseProvider } from './context/PurchaseContext'
import { SecurityProvider } from './context/SecurityContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SecurityProvider>
      <PurchaseProvider>
        <App />
      </PurchaseProvider>
    </SecurityProvider>
  </StrictMode>,
)

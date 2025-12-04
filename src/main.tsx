import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router'
import { LocationProvider } from './context/LocationContext.tsx'
import { Toaster } from './components/ui/sonner.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocationProvider>
    <BrowserRouter>
      <App />
      <Toaster richColors position='top-right' closeButton />
    </BrowserRouter>
    </LocationProvider>
  </StrictMode>,
)

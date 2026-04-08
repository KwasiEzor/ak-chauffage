import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ContentProvider } from './contexts/ContentContext'
import { ConsentProvider } from './contexts/ConsentContext'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ContentProvider>
        <ConsentProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ConsentProvider>
      </ContentProvider>
    </BrowserRouter>
  </StrictMode>,
)

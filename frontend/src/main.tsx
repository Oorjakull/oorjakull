import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'
import { SafetyProvider } from './contexts/SafetyContext'
import ErrorBoundary from './components/ErrorBoundary'
import './styles.css'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={googleClientId}>
        <SafetyProvider>
          <App />
        </SafetyProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
)

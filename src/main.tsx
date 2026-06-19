import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <Auth0Provider
    domain="dev-jaof81cwcanjmzqc.us.auth0.com"
    clientId="1iXRTMhLtSZl3rwMfFVDVgG3zrhaE0H0"
    authorizationParams={{ redirect_uri: window.location.origin }}
  >
    <App />
  </Auth0Provider>
)
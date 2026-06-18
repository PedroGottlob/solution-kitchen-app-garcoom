import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { signalRService } from './services/signalRService'

signalRService.connect().catch(console.error)

createRoot(document.getElementById('root')!).render(
  <App />
)
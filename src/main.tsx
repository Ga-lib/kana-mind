import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted fonts (no third-party requests, strict font-src CSP). Only the subsets and weights in use.
import '@fontsource/zen-kaku-gothic-new/latin-400.css'
import '@fontsource/zen-kaku-gothic-new/latin-700.css'
import '@fontsource/shippori-mincho/latin-800.css'
import '@fontsource/klee-one/400.css'
import App from './App'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

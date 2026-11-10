import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App'

const racine = document.getElementById('root')
if (!racine) throw new Error('Élément #root introuvable dans index.html')

const application = (
  <StrictMode>
    <App />
  </StrictMode>
)

// Build : la page arrive pré-rendue (scripts/prerender.mjs), React la reprend sans la reconstruire.
// Développement : la racine est vide, React affiche tout.
if (racine.hasChildNodes()) hydrateRoot(racine, application)
else createRoot(racine).render(application)

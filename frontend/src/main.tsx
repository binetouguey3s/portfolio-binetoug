import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App'

// Page de démonstration temporaire (/demo), chargée seulement à la demande.
// À retirer à l'étape 12.
const Demo = lazy(() => import('./pages/Demo'))
const estDemo = window.location.pathname.replace(/\/$/, '') === '/demo'

const racine = document.getElementById('root')
if (!racine) throw new Error('Élément #root introuvable dans index.html')

createRoot(racine).render(
  <StrictMode>
    {estDemo ? (
      <Suspense fallback={null}>
        <Demo />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
)

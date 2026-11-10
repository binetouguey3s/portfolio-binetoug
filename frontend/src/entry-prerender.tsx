/**
 * Pré-rendu (au build) : produit le HTML du premier affichage (menu, accueil, bulle Binetou IA).
 * scripts/prerender.mjs l'insère dans dist/index.html : le navigateur affiche le portrait et
 * les textes de l'accueil sans attendre le JavaScript, puis React les « hydrate » (main.tsx).
 * Les autres sections sont chargées ensuite dans le navigateur, comme avant.
 */
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'

export function rendre(): string {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

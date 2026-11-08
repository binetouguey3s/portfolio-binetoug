import { useSyncExternalStore } from 'react'

const requete = '(prefers-reduced-motion: reduce)'

function abonner(rappel: () => void): () => void {
  const media = window.matchMedia(requete)
  media.addEventListener('change', rappel)
  return () => media.removeEventListener('change', rappel)
}

/** true si la visiteuse a demandé à réduire les animations. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    abonner,
    () => window.matchMedia(requete).matches,
    () => false,
  )
}

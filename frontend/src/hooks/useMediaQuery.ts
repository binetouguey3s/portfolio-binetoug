import { useCallback, useSyncExternalStore } from 'react'

/** Point de bascule des textes courts / longs (voir contenu.json, _affichageMobile) */
export const REQUETE_MOBILE = '(max-width: 767.98px)'

/** true tant que la media query CSS est vérifiée (se met à jour au redimensionnement). */
export function useMediaQuery(requete: string): boolean {
  const abonner = useCallback(
    (rappel: () => void) => {
      const media = window.matchMedia(requete)
      media.addEventListener('change', rappel)
      return () => media.removeEventListener('change', rappel)
    },
    [requete],
  )
  return useSyncExternalStore(
    abonner,
    () => window.matchMedia(requete).matches,
    () => false,
  )
}

/** Écran de moins de 768 px : on affiche les versions courtes des textes. */
export function useEstMobile(): boolean {
  return useMediaQuery(REQUETE_MOBILE)
}

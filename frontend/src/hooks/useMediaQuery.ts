import { useCallback, useSyncExternalStore } from 'react'

/** Point de bascule des textes courts / longs (voir contenu.json, _affichageMobile) */
export const REQUETE_MOBILE = '(max-width: 767.98px)'

/**
 * true tant que la media query CSS est vérifiée (se met à jour au redimensionnement).
 * valeurPreRendu : valeur utilisée pendant le pré-rendu (build) et l'hydratation.
 */
export function useMediaQuery(requete: string, valeurPreRendu = false): boolean {
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
    () => valeurPreRendu,
  )
}

/**
 * Écran de moins de 768 px : on affiche les versions courtes des textes.
 * La page est pré-rendue en version mobile (le cas le plus fréquent et le plus exigeant) ;
 * sur un écran large, les textes longs prennent le relais dès l'hydratation, sous le préchargement.
 */
export function useEstMobile(): boolean {
  return useMediaQuery(REQUETE_MOBILE, true)
}

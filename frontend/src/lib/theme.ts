/**
 * Gestion du thème sombre / clair.
 * - Le thème est porté par l'attribut data-theme sur <html>
 *   (posé avant le rendu par le script anti-flash de index.html).
 * - Le choix de la visiteuse est mémorisé dans localStorage (clé « theme »).
 * - Sans choix mémorisé, on suit le système (prefers-color-scheme).
 */

export type Theme = 'dark' | 'light'

export const CLE_STOCKAGE = 'theme'
/** Durée de la transition de couleurs, identique à --theme-transition */
export const DUREE_TRANSITION_MS = 400

const requeteSombre = '(prefers-color-scheme: dark)'

function estTheme(valeur: unknown): valeur is Theme {
  return valeur === 'dark' || valeur === 'light'
}

/** Choix mémorisé, ou null si la visiteuse n'a jamais choisi. */
export function lireChoixMemorise(): Theme | null {
  try {
    const valeur = window.localStorage.getItem(CLE_STOCKAGE)
    return estTheme(valeur) ? valeur : null
  } catch {
    return null
  }
}

export function themeSysteme(): Theme {
  return window.matchMedia(requeteSombre).matches ? 'dark' : 'light'
}

/** Thème actuellement affiché (lu sur <html>). */
export function lireTheme(): Theme {
  const valeur = document.documentElement.dataset.theme
  return estTheme(valeur) ? valeur : themeSysteme()
}

let minuterie: number | undefined

/**
 * Applique un thème. Avec « animer », la classe theme-transition
 * (définie dans tokens.css) adoucit le changement de couleurs pendant 400 ms.
 */
export function appliquerTheme(theme: Theme, animer = true): void {
  const html = document.documentElement
  if (animer) {
    html.classList.add('theme-transition')
    window.clearTimeout(minuterie)
    minuterie = window.setTimeout(() => {
      html.classList.remove('theme-transition')
    }, DUREE_TRANSITION_MS)
  }
  html.dataset.theme = theme
}

export function memoriserTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(CLE_STOCKAGE, theme)
  } catch {
    // Stockage indisponible (navigation privée…) : le thème s'applique quand même.
  }
}

/**
 * Abonnement aux changements de thème, pour useSyncExternalStore.
 * Observe l'attribut data-theme et suit le système tant qu'aucun
 * choix n'est mémorisé.
 */
export function abonnerTheme(rappel: () => void): () => void {
  const observateur = new MutationObserver(rappel)
  observateur.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })

  const media = window.matchMedia(requeteSombre)
  const surChangementSysteme = () => {
    if (lireChoixMemorise() === null) appliquerTheme(themeSysteme())
  }
  media.addEventListener('change', surChangementSysteme)

  return () => {
    observateur.disconnect()
    media.removeEventListener('change', surChangementSysteme)
  }
}

/**
 * Aller à un endroit de la page depuis un lien « #… » (boutons du chatbot, footer…).
 * - Défile en douceur (Lenis s'il est actif, sinon défilement natif) ;
 * - formulaire (#formulaire-contact) : place ensuite le curseur dans le premier champ ;
 * - bouton (ex. #video-sen-suivi) : le déclenche (ouvre la fenêtre vidéo).
 */
import { obtenirLenis } from './lenis'

/** Marge au-dessus de la cible : la barre de menu ne la cache pas */
const MARGE_HAUT = 96

export function allerA(ancre: string): void {
  const cible = document.getElementById(ancre.replace(/^#/, ''))
  if (!cible) return

  const lenis = obtenirLenis()
  const mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let arrive = false
  const arrivee = () => {
    if (arrive) return
    arrive = true
    if (cible instanceof HTMLFormElement) {
      cible.querySelector<HTMLElement>('input:not([tabindex="-1"]), textarea')?.focus({ preventScroll: true })
    } else if (cible instanceof HTMLButtonElement) {
      cible.click()
    }
  }

  if (lenis) {
    lenis.scrollTo(cible, { offset: -MARGE_HAUT, immediate: mouvementReduit, onComplete: arrivee })
    if (mouvementReduit) arrivee()
  } else {
    const haut = cible.getBoundingClientRect().top + window.scrollY - MARGE_HAUT
    window.scrollTo({ top: haut, behavior: mouvementReduit ? 'auto' : 'smooth' })
    window.setTimeout(arrivee, mouvementReduit ? 0 : 700)
  }
}

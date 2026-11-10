import { useEffect } from 'react'
import { gsap } from '../lib/gsap'
import { signalerFinIntro } from '../lib/intro'

/** Petite pause entre l'éclosion de la fleur et le fondu (comme l'animation d'origine) */
const PAUSE_MS = 150

/**
 * Fin du préchargement.
 * Le dessin (anneau du G, B, fleur) est dans index.html et animé en CSS : il s'affiche
 * dès la première image, pendant que le JavaScript se charge. Ce composant attend la fin
 * de cette animation (tout de suite si elle est déjà finie), puis efface l'écran
 * et signale à l'accueil qu'il peut se révéler. Si mouvement réduit : rien à attendre.
 */
export default function Preloader() {
  useEffect(() => {
    const ecran = document.getElementById('prechargement')
    const mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!ecran || mouvementReduit) {
      ecran?.remove()
      signalerFinIntro()
      return
    }

    let annule = false
    let fondu: gsap.core.Timeline | null = null
    const animations = ecran.getAnimations({ subtree: true })
    Promise.all(animations.map((a) => a.finished.catch(() => undefined)))
      .then(() => new Promise((resolve) => window.setTimeout(resolve, PAUSE_MS)))
      .then(() => {
        if (annule) return
        fondu = gsap
          .timeline({ onComplete: () => ecran.remove() })
          .to(ecran, { autoAlpha: 0, duration: 0.45, ease: 'power2.out' })
          .call(signalerFinIntro, [], 0.1)
      })

    return () => {
      // StrictMode (développement) monte deux fois : on n'efface qu'une fois
      annule = true
      fondu?.kill()
    }
  }, [])

  return null
}

/**
 * Défilement fluide (Lenis), synchronisé avec GSAP ScrollTrigger.
 * - Une seule instance pour tout le site, accessible via obtenirLenis().
 * - Jamais créée si prefers-reduced-motion : on garde le défilement natif.
 * - anchors: true : les liens « #section » défilent en douceur.
 * - La bibliothèque est chargée à part, juste après le premier affichage (elle n'est pas
 *   nécessaire pour afficher l'accueil) : le premier fichier JavaScript est plus léger.
 */
import type Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'

let instance: Lenis | null = null

export function obtenirLenis(): Lenis | null {
  return instance
}

/** Démarre Lenis (chargé à part) et renvoie la fonction d'arrêt (pour le nettoyage). */
export function demarrerLenis(): () => void {
  if (instance) return () => undefined

  let annule = false
  let arreter: () => void = () => undefined

  import('lenis').then(({ default: ClasseLenis }) => {
    if (annule || instance) return
    const lenis = new ClasseLenis({
      lerp: 0.1,
      anchors: true,
      autoRaf: false,
    })
    instance = lenis

    // Chaque défilement Lenis met ScrollTrigger à jour
    lenis.on('scroll', ScrollTrigger.update)

    // Lenis avance au rythme de l'horloge GSAP (une seule boucle d'animation)
    const tic = (temps: number) => lenis.raf(temps * 1000)
    gsap.ticker.add(tic)
    gsap.ticker.lagSmoothing(0)

    arreter = () => {
      gsap.ticker.remove(tic)
      lenis.destroy()
      instance = null
    }
  })

  return () => {
    annule = true
    arreter()
  }
}

/** Bloque / débloque le défilement (menu mobile, fenêtres modales). */
export function bloquerDefilement(bloquer: boolean): void {
  if (bloquer) instance?.stop()
  else instance?.start()
  document.documentElement.style.overflow = bloquer ? 'hidden' : ''
}

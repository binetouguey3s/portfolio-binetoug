/**
 * Défilement fluide (Lenis), synchronisé avec GSAP ScrollTrigger.
 * - Une seule instance pour tout le site, accessible via obtenirLenis().
 * - Jamais créée si prefers-reduced-motion : on garde le défilement natif.
 * - anchors: true : les liens « #section » défilent en douceur.
 */
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'

let instance: Lenis | null = null

export function obtenirLenis(): Lenis | null {
  return instance
}

/** Démarre Lenis et renvoie la fonction d'arrêt (pour le nettoyage). */
export function demarrerLenis(): () => void {
  if (instance) return () => undefined

  const lenis = new Lenis({
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

  return () => {
    gsap.ticker.remove(tic)
    lenis.destroy()
    instance = null
  }
}

/** Bloque / débloque le défilement (menu mobile, fenêtres modales). */
export function bloquerDefilement(bloquer: boolean): void {
  if (bloquer) instance?.stop()
  else instance?.start()
  document.documentElement.style.overflow = bloquer ? 'hidden' : ''
}

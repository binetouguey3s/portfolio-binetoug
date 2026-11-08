import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'

/**
 * Effet « bouton magnétique » : l'élément suit légèrement le curseur
 * quand on le survole, puis revient en place.
 * Désactivé si prefers-reduced-motion ou sans souris (écrans tactiles).
 * N'anime que transform (x, y), pour rester fluide.
 */
export function useMagnetic<T extends HTMLElement>(actif: boolean, force = 0.3) {
  const ref = useRef<T>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!actif || !el) return

      const mm = gsap.matchMedia()
      mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
        const versX = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' })
        const versY = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' })

        const surMouvement = (e: PointerEvent) => {
          const r = el.getBoundingClientRect()
          versX((e.clientX - (r.left + r.width / 2)) * force)
          versY((e.clientY - (r.top + r.height / 2)) * force)
        }
        const surSortie = () => {
          gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' })
        }

        el.addEventListener('pointermove', surMouvement)
        el.addEventListener('pointerleave', surSortie)
        return () => {
          el.removeEventListener('pointermove', surMouvement)
          el.removeEventListener('pointerleave', surSortie)
          gsap.set(el, { x: 0, y: 0 })
        }
      })

      return () => mm.revert()
    },
    { dependencies: [actif, force] },
  )

  return ref
}

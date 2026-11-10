import { useEffect, useRef, useState } from 'react'

/** Au-delà de ce défilement (px), le menu se compacte */
const SEUIL_COMPACT = 24
/** Au-delà de ce défilement (px), le menu peut se cacher en descendant */
const SEUIL_CACHE = 160
/** Mouvement minimal (px) pour changer d'état, évite les clignotements */
const TOLERANCE = 6

/**
 * Comportement du menu au défilement :
 * - compact dès qu'on quitte le haut de page ;
 * - caché quand on descend, visible dès qu'on remonte.
 * Lenis fait défiler la page elle-même : on écoute simplement window.scroll.
 */
export function useScrollNavbar() {
  const [compact, setCompact] = useState(false)
  const [cache, setCache] = useState(false)
  const dernierY = useRef(0)

  useEffect(() => {
    let image = 0

    const mettreAJour = () => {
      image = 0
      const y = window.scrollY
      const delta = y - dernierY.current

      setCompact(y > SEUIL_COMPACT)

      if (y <= SEUIL_CACHE) setCache(false)
      else if (delta > TOLERANCE) setCache(true)
      else if (delta < -TOLERANCE) setCache(false)

      if (Math.abs(delta) > TOLERANCE || y <= SEUIL_CACHE) dernierY.current = y
    }

    const surDefilement = () => {
      if (!image) image = window.requestAnimationFrame(mettreAJour)
    }

    mettreAJour()
    window.addEventListener('scroll', surDefilement, { passive: true })
    return () => {
      window.removeEventListener('scroll', surDefilement)
      window.cancelAnimationFrame(image)
    }
  }, [])

  return { compact, cache }
}

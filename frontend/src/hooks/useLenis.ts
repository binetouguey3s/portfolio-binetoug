import { useEffect } from 'react'
import { demarrerLenis } from '../lib/lenis'
import { useReducedMotion } from './useReducedMotion'

/**
 * Active le défilement fluide pour toute la page.
 * Si la visiteuse demande moins d'animations, Lenis n'est pas lancé
 * (défilement natif du navigateur).
 */
export function useLenis(): void {
  const mouvementReduit = useReducedMotion()

  useEffect(() => {
    if (mouvementReduit) return
    return demarrerLenis()
  }, [mouvementReduit])
}

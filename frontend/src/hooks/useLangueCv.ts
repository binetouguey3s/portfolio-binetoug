import { useSyncExternalStore } from 'react'
import { langueNavigateur } from '../lib/cv'
import type { LangueCv } from '../types/content'

const sansAbonnement = () => () => undefined

/**
 * Langue des CV proposée en premier (celle du navigateur).
 * Pendant le pré-rendu (build) et l'hydratation : « fr », puis la vraie langue juste après,
 * sans erreur d'hydratation.
 */
export function useLangueCv(): LangueCv {
  return useSyncExternalStore(sansAbonnement, langueNavigateur, () => 'fr')
}

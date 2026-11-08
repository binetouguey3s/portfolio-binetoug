import { useCallback, useSyncExternalStore } from 'react'
import {
  abonnerTheme,
  appliquerTheme,
  lireTheme,
  memoriserTheme,
  type Theme,
} from '../lib/theme'

/**
 * Hook du thème : renvoie le thème affiché et de quoi le changer.
 * Tous les composants qui l'utilisent se mettent à jour ensemble,
 * car ils lisent la même source (l'attribut data-theme de <html>).
 */
export function useTheme() {
  const theme = useSyncExternalStore<Theme>(abonnerTheme, lireTheme, () => 'dark')

  const definirTheme = useCallback((nouveau: Theme) => {
    memoriserTheme(nouveau)
    appliquerTheme(nouveau)
  }, [])

  const basculerTheme = useCallback(() => {
    definirTheme(lireTheme() === 'dark' ? 'light' : 'dark')
  }, [definirTheme])

  return { theme, definirTheme, basculerTheme }
}

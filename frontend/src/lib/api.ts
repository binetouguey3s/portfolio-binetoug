/**
 * Accès à l'API Django (complété à l'étape 15 : délai d'attente, erreurs, repli).
 */

/** URL de l'API (VITE_API_URL), sans « / » final, ou null si elle n'est pas configurée. */
export function urlApi(): string | null {
  const base = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '')
  return base ? base : null
}

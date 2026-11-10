/**
 * Accès à l'API Django.
 * - Base : VITE_API_URL (frontend/.env.local en local, réglages Vercel en production).
 * - Délai d'attente : la requête est abandonnée au bout de `delaiMs`.
 * - Toute panne (API non configurée, réseau coupé, délai dépassé, code d'erreur, réponse illisible)
 *   devient une ErreurApi : chaque appelant affiche alors son repli (docs/03-architecture.md).
 */

/** URL de l'API (VITE_API_URL), sans « / » final, ou null si elle n'est pas configurée. */
export function urlApi(): string | null {
  const base = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '')
  return base ? base : null
}

export const DELAI_API_MS = 8000

export type RaisonErreurApi = 'non-configuree' | 'reseau' | 'delai' | 'http' | 'format'

export class ErreurApi extends Error {
  readonly raison: RaisonErreurApi
  /** Code HTTP renvoyé par Django (400, 429, 503…) quand il y en a un */
  readonly statut?: number
  /** Corps JSON de la réponse d'erreur (ex. { erreurs: { email: ["…"] } }) */
  readonly corps?: unknown

  constructor(raison: RaisonErreurApi, message: string, statut?: number, corps?: unknown) {
    super(message)
    this.name = 'ErreurApi'
    this.raison = raison
    this.statut = statut
    this.corps = corps
  }
}

type OptionsAppel = {
  methode?: 'GET' | 'POST'
  /** Corps envoyé en JSON */
  corps?: unknown
  delaiMs?: number
}

/** Appelle `chemin` (ex. « /api/projets/ ») et renvoie le JSON de la réponse. */
export async function appelerApi(chemin: string, { methode = 'GET', corps, delaiMs = DELAI_API_MS }: OptionsAppel = {}): Promise<unknown> {
  const base = urlApi()
  if (!base) throw new ErreurApi('non-configuree', 'VITE_API_URL n’est pas configurée.')

  const controleur = new AbortController()
  const minuterie = window.setTimeout(() => controleur.abort(), delaiMs)
  let reponse: Response
  try {
    reponse = await fetch(`${base}${chemin}`, {
      method: methode,
      headers: {
        Accept: 'application/json',
        ...(corps === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: corps === undefined ? undefined : JSON.stringify(corps),
      signal: controleur.signal,
      credentials: 'omit',
    })
  } catch (erreur) {
    if (controleur.signal.aborted) throw new ErreurApi('delai', `Pas de réponse en ${delaiMs / 1000} s.`)
    throw new ErreurApi('reseau', erreur instanceof Error ? erreur.message : 'API injoignable.')
  } finally {
    window.clearTimeout(minuterie)
  }

  let donnees: unknown = null
  try {
    donnees = await reponse.json()
  } catch {
    if (reponse.ok) throw new ErreurApi('format', 'Réponse illisible.', reponse.status)
  }
  if (!reponse.ok) throw new ErreurApi('http', `Erreur ${reponse.status}.`, reponse.status, donnees)
  return donnees
}

// --- Petites vérifications de forme (les données viennent du réseau : on ne leur fait pas confiance) ---

export function estObjet(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

export function estTexte(v: unknown): v is string {
  return typeof v === 'string'
}

export function estListeDeTextes(v: unknown): v is string[] {
  return Array.isArray(v) && v.every(estTexte)
}

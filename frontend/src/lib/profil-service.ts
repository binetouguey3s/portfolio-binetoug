/**
 * Profil affiché dans le terminal : GET /api/profil/.
 * Repli : profilApi de contenu.json (même contenu, servi par Django depuis ce fichier).
 */
import { appelerApi, ErreurApi, estObjet } from './api'
import { contenu } from './content'
import type { ProfilApi } from '../types/content'

export async function chargerProfil(): Promise<ProfilApi> {
  const donnees = await appelerApi('/api/profil/')
  // Même forme que le repli : toutes ses clés doivent être présentes
  if (!estObjet(donnees) || !Object.keys(contenu.profilApi).every((cle) => cle in donnees)) {
    throw new ErreurApi('format', 'Profil inattendu.')
  }
  return donnees as unknown as ProfilApi
}

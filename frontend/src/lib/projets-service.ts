/**
 * Galerie des projets : GET /api/projets/ (projets gérés dans l'admin Django).
 * Repli : projets.galerie de contenu.json.
 * La carte vedette reste lue dans contenu.json (logo, vidéo, devise… ne sont pas dans l'API).
 */
import { appelerApi, ErreurApi, estListeDeTextes, estObjet, estTexte } from './api'
import type { ProjetGalerie } from '../types/content'

function versProjet(v: unknown): (ProjetGalerie & { vedette: boolean }) | null {
  if (!estObjet(v) || !estObjet(v.lien)) return null
  const { num, nom, meta, domaine, description, stack, lien, vedette } = v
  if (![num, nom, meta, domaine, description, lien.label, lien.url].every(estTexte) || !estListeDeTextes(stack)) {
    return null
  }
  return {
    num: num as string,
    nom: nom as string,
    meta: meta as string,
    domaine: domaine as string,
    description: description as string,
    stack,
    lien: { label: lien.label as string, url: lien.url as string },
    vedette: vedette === true,
  }
}

export async function chargerGalerie(): Promise<ProjetGalerie[]> {
  const donnees = await appelerApi('/api/projets/')
  if (!Array.isArray(donnees)) throw new ErreurApi('format', 'Liste de projets inattendue.')

  const projets = donnees.map(versProjet)
  if (projets.some((p) => p === null)) throw new ErreurApi('format', 'Projet inattendu.')
  const galerie = projets
    .filter((p): p is ProjetGalerie & { vedette: boolean } => p !== null && !p.vedette)
    .map((p) => ({ num: p.num, nom: p.nom, meta: p.meta, domaine: p.domaine, description: p.description, stack: p.stack, lien: p.lien }))

  // Base vide (projets pas encore chargés avec « charger_projets ») : on garde le repli
  if (galerie.length === 0) throw new ErreurApi('format', 'Aucun projet dans la base.')
  return galerie
}

/**
 * Boutons d'action sous les réponses de Binetou IA.
 * L'API renvoie seulement des identifiants (ex. « cv-back ») : la cible réelle
 * est lue ici dans contenu.json (chatbot.actions), jamais produite par l'IA.
 * Identifiant inconnu, cible vide ou A_COMPLETER : pas de bouton.
 */
import { contenu } from './content'
import { lienGmail, lienValide } from './liens'

export type ActionResolue = {
  id: string
  label: string
  href: string
  /** Lien externe : nouvel onglet */
  externe: boolean
  /** Fichier à télécharger (CV) */
  telechargement: boolean
}

/** Lit une cible de chatbot.actions : chemin dans contenu.json, ancre (#…) ou adresse email (ouverte dans Gmail). */
function lireCible(cible: string): string | null {
  if (cible.startsWith('#')) return cible
  if (cible === 'mailto:identite.email') return lienGmail(contenu.identite.email)

  // projets.galerie[01].lien.url : projet dont le numéro est 01
  const projet = /^projets\.galerie\[(\d+)\]\.lien\.url$/.exec(cible)
  if (projet) return contenu.projets.galerie.find((p) => p.num === projet[1])?.lien.url ?? null

  // identite.cv[0].fichier (français) ou identite.cv[0].fichierEN (anglais) : CV à l'index 0
  const cv = /^identite\.cv\[(\d+)\]\.(fichier|fichierEN)$/.exec(cible)
  if (cv) {
    const entree = contenu.identite.cv[Number(cv[1])]
    return (cv[2] === 'fichierEN' ? entree?.fichierEN : entree?.fichier) ?? null
  }

  if (cible === 'projets.vedette.lienApplication') return contenu.projets.vedette.lienApplication
  if (cible === 'projets.vedette.video') return contenu.projets.vedette.video
  return null
}

/** Transforme une liste d'identifiants en boutons affichables (2 au maximum). */
export function resoudreActions(ids: readonly string[] | undefined): ActionResolue[] {
  if (!ids) return []
  const resultats: ActionResolue[] = []
  for (const id of ids) {
    const action = contenu.chatbot.actions.find((a) => a.id === id)
    if (!action) continue
    let href = lireCible(action.cible)
    if (!lienValide(href) && action.repli) href = lireCible(action.repli)
    if (!lienValide(href)) continue
    resultats.push({
      id,
      label: action.label,
      href,
      externe: href.startsWith('http') || href.endsWith('.mp4'),
      telechargement: href.endsWith('.pdf'),
    })
    if (resultats.length === 2) break
  }
  return resultats
}

/**
 * Envoi du formulaire de contact : POST /api/contact/
 * (Django : enregistrement, anti-spam, limite de débit, notification email).
 * En cas d'échec (API hors ligne, limite atteinte…), le formulaire affiche
 * le message d'erreur de contenu.json avec un lien mailto.
 */
import { appelerApi, ErreurApi, estListeDeTextes, estObjet } from './api'

export type MessageContact = {
  nom: string
  email: string
  message: string
}

/** Limites partagées avec le formulaire et avec l'API Django */
export const LIMITES_CONTACT = { nomMax: 120, messageMin: 10, messageMax: 4000 } as const

/** Django a refusé un champ (rare : le formulaire vérifie déjà la même chose avec les mêmes messages) */
export class ErreurChampsContact extends Error {
  readonly erreurs: Partial<Record<keyof MessageContact, string>>

  constructor(erreurs: Partial<Record<keyof MessageContact, string>>) {
    super('Champs refusés par le serveur.')
    this.name = 'ErreurChampsContact'
    this.erreurs = erreurs
  }
}

export async function envoyerMessageContact(donnees: MessageContact): Promise<void> {
  try {
    await appelerApi('/api/contact/', { methode: 'POST', corps: donnees })
  } catch (erreur) {
    // 400 : { erreurs: { email: ["Cette adresse email ne semble pas valide."] } }
    if (erreur instanceof ErreurApi && erreur.statut === 400 && estObjet(erreur.corps) && estObjet(erreur.corps.erreurs)) {
      const champs: Partial<Record<keyof MessageContact, string>> = {}
      for (const champ of ['nom', 'email', 'message'] as const) {
        const messages = erreur.corps.erreurs[champ]
        if (estListeDeTextes(messages) && messages[0]) champs[champ] = messages[0]
      }
      if (Object.keys(champs).length > 0) throw new ErreurChampsContact(champs)
    }
    throw erreur
  }
}

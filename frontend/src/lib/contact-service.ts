/**
 * Envoi du formulaire de contact.
 * PROVISOIRE (étape 10) : envoi factice qui réussit après 1,2 seconde.
 * À l'étape 15, il appellera POST /api/contact/ (Django : enregistrement,
 * anti-spam, limite de débit) ; en cas d'échec, le formulaire affiche
 * le message d'erreur de contenu.json avec un lien mailto.
 */

export type MessageContact = {
  nom: string
  email: string
  message: string
}

/** Limites partagées avec le formulaire (et, plus tard, avec l'API) */
export const LIMITES_CONTACT = { nomMax: 120, messageMin: 10, messageMax: 4000 } as const

export async function envoyerMessageContact(donnees: MessageContact): Promise<void> {
  void donnees
  await new Promise((resolve) => setTimeout(resolve, 1200))
}

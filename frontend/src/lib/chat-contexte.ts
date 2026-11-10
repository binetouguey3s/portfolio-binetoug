import { createContext } from 'react'

/** Un message de la conversation */
export type MessageChat = {
  id: number
  role: 'utilisateur' | 'assistant'
  texte: string
  /** Nombre de caractères déjà affichés (effet machine à écrire) */
  affiche: number
  /** Identifiants de boutons d'action (réponses de l'assistante) */
  actions?: string[]
  /** Message de repli quand l'API ne répond pas : jamais de boutons */
  horsLigne?: boolean
}

export type ContexteChat = {
  messages: MessageChat[]
  /** En attente de la réponse : l'indicateur « … » s'affiche */
  enAttente: boolean
  /** Une réponse est en train de s'écrire */
  enEcriture: boolean
  envoyer: (question: string) => void
  panneauOuvert: boolean
  ouvrirPanneau: () => void
  fermerPanneau: () => void
}

export const Chat = createContext<ContexteChat | null>(null)

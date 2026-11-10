/**
 * Service du chatbot : POST /api/chat/ (Django → GroqCloud).
 * En cas d'échec (API hors ligne, délai, limite de débit, 503…), l'appelant affiche
 * chatbot.horsLigne avec les actions de secours (CV).
 */
import { appelerApi, ErreurApi, estListeDeTextes, estObjet, estTexte } from './api'

/** Longueur maximale d'une question (même limite que l'API Django) */
export const LONGUEUR_MAX_QUESTION = 500

/**
 * Délai d'attente du chat : Django attend Groq 20 s, puis peut réessayer
 * avec le modèle de secours (20 s de plus).
 */
const DELAI_CHAT_MS = 45_000

export type EchangeHistorique = { role: 'utilisateur' | 'assistant'; texte: string }

export type ReponseChat = {
  reponse: string
  /** Identifiants de chatbot.actions (2 au maximum) */
  actions: string[]
}

export async function demanderReponse(question: string, historique: EchangeHistorique[]): Promise<ReponseChat> {
  const donnees = await appelerApi('/api/chat/', {
    methode: 'POST',
    corps: { message: question, history: historique },
    delaiMs: DELAI_CHAT_MS,
  })
  if (!estObjet(donnees) || !estTexte(donnees.reponse) || !donnees.reponse.trim()) {
    throw new ErreurApi('format', 'Réponse du chatbot inattendue.')
  }
  return {
    reponse: donnees.reponse,
    // Identifiants seulement ; le front ne garde que ceux de chatbot.actions (voir chat-actions.ts)
    actions: estListeDeTextes(donnees.actions) ? donnees.actions.slice(0, 2) : [],
  }
}

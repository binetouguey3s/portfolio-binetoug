/**
 * Service du chatbot.
 * PROVISOIRE (étape 9) : faux service qui répond après 1 seconde avec un texte
 * de test. À l'étape 15, il appellera POST /api/chat/ sur l'API Django.
 */

/** Longueur maximale d'une question (même limite que l'API Django) */
export const LONGUEUR_MAX_QUESTION = 500

export type EchangeHistorique = { role: 'utilisateur' | 'assistant'; texte: string }

export type ReponseChat = {
  reponse: string
  /** Identifiants de chatbot.actions (2 au maximum) */
  actions: string[]
}

export async function demanderReponse(
  question: string,
  historique: EchangeHistorique[],
): Promise<ReponseChat> {
  void question
  void historique
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return {
    reponse:
      "Réponse de test : l'interface fonctionne. L'assistante répondra pour de vrai quand l'API Django sera branchée (étape 15).",
    actions: ['cv-back', 'voir-ande-setal'],
  }
}

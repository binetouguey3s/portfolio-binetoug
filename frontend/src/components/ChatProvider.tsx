import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { Chat, type ContexteChat, type MessageChat } from '../lib/chat-contexte'
import { demanderReponse, LONGUEUR_MAX_QUESTION } from '../lib/chat-service'
import { contenu } from '../lib/content'
import { actionsCvHorsLigne } from '../lib/cv'

/** Effet machine à écrire : caractères ajoutés à chaque pas, et durée d'un pas */
const CARACTERES_PAR_PAS = 2
const DUREE_PAS_MS = 16

/**
 * Conversation Binetou IA, partagée par la fenêtre de la section 05 et le panneau flottant.
 * Au chargement : seulement le message d'accueil (les suggestions sont affichées à part).
 * Historique conservé pendant la visite uniquement (rien n'est stocké).
 */
export default function ChatProvider({ children }: { children: ReactNode }) {
  const { chatbot } = contenu
  const mouvementReduit = useReducedMotion()
  const prochainId = useRef(1)
  const [messages, setMessages] = useState<MessageChat[]>(() => [
    { id: 0, role: 'assistant', texte: chatbot.accueil, affiche: chatbot.accueil.length },
  ])
  const [enAttente, setEnAttente] = useState(false)
  const [panneauOuvert, setPanneauOuvert] = useState(false)

  const enEcriture = messages.some((m) => m.affiche < m.texte.length)

  // Effet machine à écrire : révèle progressivement le dernier message de l'assistante
  useEffect(() => {
    if (!enEcriture) return
    const minuterie = window.setInterval(() => {
      setMessages((liste) =>
        liste.map((m) =>
          m.affiche < m.texte.length
            ? {
                ...m,
                affiche: mouvementReduit
                  ? m.texte.length
                  : Math.min(m.texte.length, m.affiche + CARACTERES_PAR_PAS),
              }
            : m,
        ),
      )
    }, DUREE_PAS_MS)
    return () => window.clearInterval(minuterie)
  }, [enEcriture, mouvementReduit])

  const envoyer = useCallback(
    (brut: string) => {
      const question = brut.trim().slice(0, LONGUEUR_MAX_QUESTION)
      if (!question || enAttente || enEcriture) return

      const historique = messages
        .slice(1) // sans le message d'accueil
        .filter((m) => !m.horsLigne)
        .map((m) => ({ role: m.role, texte: m.texte }))

      setMessages((liste) => [
        ...liste,
        { id: prochainId.current++, role: 'utilisateur', texte: question, affiche: question.length },
      ])
      setEnAttente(true)

      demanderReponse(question, historique)
        .then(({ reponse, actions }) => {
          setMessages((liste) => [
            ...liste,
            { id: prochainId.current++, role: 'assistant', texte: reponse, affiche: 0, actions },
          ])
        })
        .catch(() => {
          // API indisponible : message de repli, avec le CV Général en français et en anglais
          setMessages((liste) => [
            ...liste,
            {
              id: prochainId.current++,
              role: 'assistant',
              texte: chatbot.horsLigne,
              affiche: 0,
              horsLigne: true,
              actions: actionsCvHorsLigne(),
            },
          ])
        })
        .finally(() => setEnAttente(false))
    },
    [chatbot.horsLigne, enAttente, enEcriture, messages],
  )

  const ouvrirPanneau = useCallback(() => setPanneauOuvert(true), [])
  const fermerPanneau = useCallback(() => setPanneauOuvert(false), [])

  const valeur = useMemo<ContexteChat>(
    () => ({ messages, enAttente, enEcriture, envoyer, panneauOuvert, ouvrirPanneau, fermerPanneau }),
    [messages, enAttente, enEcriture, envoyer, panneauOuvert, ouvrirPanneau, fermerPanneau],
  )

  return <Chat.Provider value={valeur}>{children}</Chat.Provider>
}

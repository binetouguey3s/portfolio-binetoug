import { useContext } from 'react'
import { Chat, type ContexteChat } from '../lib/chat-contexte'

/** Accès à la conversation Binetou IA (partagée entre la section 05 et le panneau). */
export function useChat(): ContexteChat {
  const chat = useContext(Chat)
  if (!chat) throw new Error('useChat doit être utilisé dans <ChatProvider>')
  return chat
}

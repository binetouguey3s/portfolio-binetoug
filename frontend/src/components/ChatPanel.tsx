import { useEffect, useRef } from 'react'
import ChatWindow from './ChatWindow'
import Halo from './Halo'
import { useChat } from '../hooks/useChat'
import { bloquerDefilement } from '../lib/lenis'

/**
 * Panneau Binetou IA ouvert par la bulle flottante ou les boutons « Demander à Binetou IA ».
 * Desktop : panneau latéral à droite. Mobile : plein écran (captures 07 et 08).
 * Repose sur <dialog> : focus piégé dans le panneau, Échap pour fermer, le focus
 * revient ensuite au bouton qui l'a ouvert (géré par le navigateur).
 */
export default function ChatPanel() {
  const { panneauOuvert, fermerPanneau } = useChat()
  const dialogue = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = dialogue.current
    if (!d) return
    if (panneauOuvert && !d.open) {
      d.showModal()
      bloquerDefilement(true)
      // Le champ de saisie reçoit le focus : on peut écrire tout de suite
      d.querySelector<HTMLInputElement>('input[type="text"]')?.focus()
    } else if (!panneauOuvert && d.open) {
      d.close()
    }
  }, [panneauOuvert])

  return (
    <dialog
      ref={dialogue}
      aria-label="Binetou IA"
      onClose={() => {
        bloquerDefilement(false)
        fermerPanneau()
      }}
      onClick={(e) => {
        // Clic sur le fond assombri (desktop) : fermeture
        if (e.target === dialogue.current) dialogue.current?.close()
      }}
      className="panneau-chat fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-bg p-0 text-text md:left-auto md:w-[440px] md:border-l md:border-glass-border"
    >
      <div className="relative flex h-full flex-col overflow-hidden">
        <Halo taille={420} className="-left-[120px] top-[180px]" />
        <Halo taille={300} teinte={2} className="-right-[100px] bottom-[60px]" />
        <ChatWindow variante="panneau" surFermeture={() => dialogue.current?.close()} className="relative h-full" />
      </div>
    </dialog>
  )
}

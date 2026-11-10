import { useChat } from '../hooks/useChat'

/**
 * Bulle Binetou IA flottante, en bas à droite sur toute la page (captures 05 et 06).
 * Ouvre le panneau de conversation. Masquée quand le panneau est ouvert.
 */
export default function ChatLauncher() {
  const { panneauOuvert, ouvrirPanneau } = useChat()
  if (panneauOuvert) return null

  return (
    <button
      type="button"
      aria-label="Ouvrir Binetou IA"
      aria-haspopup="dialog"
      onClick={ouvrirPanneau}
      className="fixed bottom-[22px] right-[22px] z-40 inline-flex size-[52px] cursor-pointer items-center justify-center rounded-full bg-accent text-on-accent shadow-glass transition-transform duration-300 hover:scale-105 motion-reduce:transition-none md:bottom-8 md:right-8 md:size-14"
    >
      <svg
        aria-hidden="true"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
      </svg>
    </button>
  )
}

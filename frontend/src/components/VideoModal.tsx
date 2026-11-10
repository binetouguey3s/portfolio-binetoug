import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { bloquerDefilement } from '../lib/lenis'

/** Écran étroit tenu à la verticale (téléphone) : on préfère la vidéo 9:16 */
const REQUETE_VERTICALE = '(orientation: portrait) and (max-width: 1023.98px)'

type Format = { video: string; affiche: string }

type VideoModalProps = {
  ouverte: boolean
  surFermeture: () => void
  /** Nom lu par les lecteurs d'écran (ex. « Sen Suivi ») */
  titre: string
  /** Vidéo 16:9 pour les écrans larges */
  paysage: Format
  /** Vidéo 9:16 pour les téléphones tenus à la verticale */
  portrait: Format
}

/**
 * Fenêtre modale avec un lecteur vidéo HTML5 accessible.
 * - Le format est choisi à l'ouverture : 9:16 sur téléphone vertical, 16:9 ailleurs.
 *   Un seul fichier est téléchargé, et seulement à l'ouverture (preload="none").
 * - Repose sur <dialog> : focus piégé et Échap pour fermer, gérés par le navigateur.
 * - La vidéo est mise en pause à la fermeture.
 */
export default function VideoModal({ ouverte, surFermeture, titre, paysage, portrait }: VideoModalProps) {
  const dialogue = useRef<HTMLDialogElement>(null)
  const lecteur = useRef<HTMLVideoElement>(null)
  const [vertical, setVertical] = useState(false)
  const format = vertical ? portrait : paysage

  // Ouverture : choix du format selon l'écran du moment
  useEffect(() => {
    const d = dialogue.current
    if (!d) return
    if (ouverte && !d.open) {
      setVertical(window.matchMedia(REQUETE_VERTICALE).matches)
      d.showModal()
      bloquerDefilement(true)
    } else if (!ouverte && d.open) {
      d.close()
    }
  }, [ouverte])

  // Lecture une fois la bonne source en place (ouverture par un clic : lecture autorisée)
  useEffect(() => {
    if (ouverte) lecteur.current?.play().catch(() => undefined)
  }, [ouverte, vertical])

  return (
    <dialog
      ref={dialogue}
      aria-label={titre}
      onClose={() => {
        lecteur.current?.pause()
        bloquerDefilement(false)
        surFermeture()
      }}
      onClick={(e) => {
        // Clic sur le fond (en dehors du lecteur) : fermeture
        if (e.target === dialogue.current) dialogue.current?.close()
      }}
      className={[
        'modale-video m-auto max-w-none overflow-visible bg-transparent p-0 text-text',
        vertical ? 'w-[min(88vw,calc((100dvh-120px)*9/16))]' : 'w-[min(92vw,1100px,calc((100dvh-140px)*16/9))]',
      ].join(' ')}
    >
      <div className="relative">
        <button
          type="button"
          aria-label="Fermer la vidéo"
          onClick={() => dialogue.current?.close()}
          className="glass absolute -top-14 right-0 inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-text"
        >
          <X aria-hidden="true" size={20} strokeWidth={1.8} />
        </button>
        <video
          key={format.video}
          ref={lecteur}
          src={format.video}
          poster={format.affiche}
          controls
          playsInline
          preload="none"
          width={vertical ? 720 : 1280}
          height={vertical ? 1280 : 720}
          className={`block w-full rounded-card border border-border bg-bg shadow-glass ${
            vertical ? 'aspect-[9/16]' : 'aspect-video'
          }`}
        />
      </div>
    </dialog>
  )
}

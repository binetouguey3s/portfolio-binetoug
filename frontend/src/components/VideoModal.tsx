import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { bloquerDefilement } from '../lib/lenis'

type VideoModalProps = {
  ouverte: boolean
  surFermeture: () => void
  /** Nom lu par les lecteurs d'écran (ex. « Sen Suivi la Solution ») */
  titre: string
  video: string
  affiche: string
}

/**
 * Fenêtre modale avec un lecteur vidéo HTML5 accessible.
 * Repose sur <dialog> : focus piégé dans la fenêtre et Échap pour fermer,
 * gérés par le navigateur. La vidéo n'est chargée qu'à l'ouverture
 * (preload="none"), puis mise en pause à la fermeture.
 */
export default function VideoModal({ ouverte, surFermeture, titre, video, affiche }: VideoModalProps) {
  const dialogue = useRef<HTMLDialogElement>(null)
  const lecteur = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const d = dialogue.current
    if (!d) return
    if (ouverte && !d.open) {
      d.showModal()
      bloquerDefilement(true)
      // Ouverture par un clic : le navigateur autorise la lecture
      lecteur.current?.play().catch(() => undefined)
    } else if (!ouverte && d.open) {
      d.close()
    }
  }, [ouverte])

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
      className="modale-video m-auto w-[min(92vw,1100px)] max-w-none overflow-visible bg-transparent p-0 text-text"
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
          ref={lecteur}
          src={video}
          poster={affiche}
          controls
          playsInline
          preload="none"
          width={1280}
          height={720}
          className="block aspect-video w-full rounded-card border border-border bg-bg shadow-glass"
        />
      </div>
    </dialog>
  )
}

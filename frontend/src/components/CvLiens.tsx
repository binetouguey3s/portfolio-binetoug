import { Download } from 'lucide-react'
import { useLangueCv } from '../hooks/useLangueCv'
import { fichierCv, libelleTelechargementCv, ordreLanguesCv } from '../lib/cv'
import type { Cv } from '../types/content'

type CvLiensProps = {
  cv: Cv
  /** Appelé au clic (ex. fermer le menu des CV) */
  onChoisir?: () => void
  className?: string
}

/**
 * Deux pastilles en verre « FR » et « EN » pour un CV, la langue du navigateur en premier.
 * Téléchargement direct, ouverture dans un nouvel onglet si le navigateur affiche le PDF.
 */
export default function CvLiens({ cv, onChoisir, className = '' }: CvLiensProps) {
  const langue = useLangueCv()
  return (
    <span className={`flex shrink-0 gap-1.5 ${className}`}>
      {ordreLanguesCv(langue).map((langue) => (
        <a
          key={langue}
          data-cv
          href={fichierCv(cv, langue)}
          download
          target="_blank"
          rel="noopener"
          onClick={onChoisir}
          className="glass glass-sans-ombre inline-flex min-h-8 items-center gap-1 rounded-pill px-2.5 font-mono text-[12px] tracking-[1px] text-accent no-underline transition-[filter] duration-200 hover:brightness-110"
        >
          {langue.toUpperCase()}
          {/* Nom lu : « FR, Télécharger le CV Général en français » (il commence par le texte visible) */}
          <span className="sr-only">, {libelleTelechargementCv(cv, langue)}</span>
          <Download aria-hidden="true" size={12} strokeWidth={2} />
        </a>
      ))}
    </span>
  )
}

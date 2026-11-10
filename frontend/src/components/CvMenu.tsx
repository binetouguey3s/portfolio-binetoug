import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, Download } from 'lucide-react'
import Button from './Button'
import { contenu } from '../lib/content'

type CvMenuProps = {
  /** Texte du bouton (contenu.json : hero.ctaSecondaire) */
  label: string
  /** secondary (contour, desktop) ou glass (mobile, capture 05) */
  variant?: 'secondary' | 'glass'
  size?: 'md' | 'lg'
  /** Petite flèche vers le bas (desktop) */
  chevron?: boolean
  magnetic?: boolean
  className?: string
}

/**
 * Bouton « Télécharger mon CV » qui ouvre un petit menu avec les 3 CV
 * (identite.cv). Bouton de divulgation accessible : aria-expanded,
 * Échap ou clic à l'extérieur pour fermer, le focus revient au bouton.
 */
export default function CvMenu({
  label,
  variant = 'secondary',
  size = 'lg',
  chevron = true,
  magnetic = false,
  className = '',
}: CvMenuProps) {
  const [ouvert, setOuvert] = useState(false)
  const idListe = useId()
  const conteneur = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ouvert) return
    const racine = conteneur.current
    racine?.querySelector<HTMLAnchorElement>('[data-cv]')?.focus()

    const fermer = (rendreFocus: boolean) => {
      setOuvert(false)
      if (rendreFocus) racine?.querySelector<HTMLButtonElement>('[aria-controls]')?.focus()
    }
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fermer(true)
    }
    const surClic = (e: PointerEvent) => {
      if (racine && !racine.contains(e.target as Node)) fermer(false)
    }
    const surFocus = (e: FocusEvent) => {
      if (racine && !racine.contains(e.target as Node)) fermer(false)
    }
    document.addEventListener('keydown', surTouche)
    document.addEventListener('pointerdown', surClic)
    document.addEventListener('focusin', surFocus)
    return () => {
      document.removeEventListener('keydown', surTouche)
      document.removeEventListener('pointerdown', surClic)
      document.removeEventListener('focusin', surFocus)
    }
  }, [ouvert])

  return (
    <div ref={conteneur} className={`relative ${className}`}>
      <Button
        variant={variant}
        size={size}
        magnetic={magnetic}
        aria-expanded={ouvert}
        aria-controls={idListe}
        onClick={() => setOuvert((o) => !o)}
        className="w-full"
      >
        {label}
        {chevron ? (
          <ChevronDown
            aria-hidden="true"
            size={16}
            strokeWidth={2}
            className={`transition-transform duration-300 motion-reduce:transition-none ${ouvert ? 'rotate-180' : ''}`}
          />
        ) : null}
      </Button>

      {/* Fond plein (et non verre) : le menu passe au-dessus d'autres textes, il doit rester lisible */}
      <div
        id={idListe}
        hidden={!ouvert}
        className="absolute left-0 top-[calc(100%+10px)] z-20 w-full min-w-[260px] rounded-[24px] border border-glass-border bg-bg-2 p-2 shadow-glass"
      >
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {contenu.identite.cv.map((cv) => (
            <li key={cv.fichier}>
              <a
                data-cv
                href={cv.fichier}
                download
                onClick={() => setOuvert(false)}
                className="flex items-center justify-between gap-4 rounded-[16px] px-4 py-3 text-[15px] text-text no-underline transition-colors duration-200 hover:bg-surface focus-visible:bg-surface"
              >
                {cv.label}
                <Download aria-hidden="true" size={16} strokeWidth={1.8} className="text-accent" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

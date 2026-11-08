import type { ReactNode } from 'react'

type Variante = 'surface' | 'accent' | 'outline' | 'mono' | 'glass'
type Taille = 'xs' | 'sm' | 'md'
type Police = 'mono' | 'body'

/**
 * Variantes (valeurs de la maquette) :
 * - surface : fond --surface (puces de compétences, stack des projets)
 * - accent  : plein accent (LLM, RAG, « IA · RAG » du portrait)
 * - outline : contour --border (étiquettes À propos, tags de la méthode)
 * - mono    : contour --surface, texte accent (puces CV de l'accueil)
 * - glass   : verre dépoli (étiquettes autour du portrait)
 */
const classesVariante: Record<Variante, string> = {
  surface: 'bg-surface text-text',
  accent: 'bg-accent text-on-accent',
  outline: 'border border-border text-text',
  mono: 'border border-surface text-accent',
  glass: 'glass text-text',
}

// xs : stack des projets (11 px) · sm : compétences, CV (12-13 px) · md : portrait (13 px)
const classesTaille: Record<Taille, string> = {
  xs: 'px-2.5 py-1.5 text-[11px]',
  sm: 'px-3 py-[7px] text-[12px]',
  md: 'px-[15px] py-2.5 text-[13px]',
}

type ChipProps = {
  variant?: Variante
  size?: Taille
  font?: Police
  className?: string
  children: ReactNode
}

/** Petite étiquette en forme de pilule. Purement visuelle (<span>). */
export default function Chip({
  variant = 'surface',
  size = 'sm',
  font = 'mono',
  className = '',
  children,
}: ChipProps) {
  const classes = [
    'inline-flex items-center rounded-pill whitespace-nowrap leading-tight',
    font === 'mono' ? 'font-mono' : 'font-body',
    classesVariante[variant],
    classesTaille[size],
    className,
  ].join(' ')

  return <span className={classes}>{children}</span>
}

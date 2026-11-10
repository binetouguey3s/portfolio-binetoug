import type { ReactNode } from 'react'
import type { TitreItalique } from '../types/content'

type Ton = 'default' | 'contrast'

type SectionHeadingProps = {
  /** Numéro mono, ex. « 01 — À PROPOS » */
  numero: string
  titre: TitreItalique
  /** default : sections --bg · contrast : À propos et Méthode (--contrast-*) */
  ton?: Ton
  /** Niveau de titre (h2 par défaut) */
  as?: 'h1' | 'h2' | 'h3'
  /** id du titre, pour aria-labelledby sur la section */
  id?: string
  /** Espace entre le numéro et le titre (classe gap-*, 18 px par défaut) */
  espace?: string
  /** normale : 60 px (desktop) · grande : 76 px (titre de Contact) */
  taille?: 'normale' | 'grande'
  className?: string
  children?: ReactNode
}

/**
 * En-tête de section : numéro en JetBrains Mono, puis titre Fraunces
 * dont la partie « italique » prend la couleur d'accent.
 */
export default function SectionHeading({
  numero,
  titre,
  ton = 'default',
  as: Balise = 'h2',
  id,
  espace = 'gap-[18px]',
  taille = 'normale',
  className = '',
  children,
}: SectionHeadingProps) {
  const couleurAccent = ton === 'contrast' ? 'text-contrast-label' : 'text-accent'
  const classesTaille =
    taille === 'grande'
      ? 'text-[clamp(2.5rem,6vw,4.75rem)] leading-[0.98] tracking-[-2px]'
      : 'text-[length:var(--fs-h2)] leading-[1.02] tracking-[-1.5px]'

  return (
    <div className={`flex flex-col ${espace} ${className}`}>
      <p className={`m-0 font-mono text-[13px] tracking-[3px] ${couleurAccent}`}>{numero}</p>
      <Balise
        id={id}
        className={`m-0 font-display font-normal ${classesTaille}`}
      >
        {titre.avant} <em className={`font-light ${couleurAccent}`}>{titre.italique}</em>
        {titre.apres ? ` ${titre.apres}` : null}
      </Balise>
      {children}
    </div>
  )
}

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { useMagnetic } from '../hooks/useMagnetic'

type Variante = 'primary' | 'secondary' | 'glass'
type Taille = 'md' | 'lg'

const classesVariante: Record<Variante, string> = {
  // Plein accent (caramel en sombre, acajou en clair)
  primary: 'bg-accent text-on-accent font-semibold hover:brightness-110',
  // Contour : bordure 1 px, donc 1 px de marge intérieure en moins
  secondary: 'border border-border text-text font-medium hover:border-accent',
  // Verre dépoli
  glass: 'glass text-text font-medium hover:brightness-110',
}

// Valeurs de la maquette : md = 15 px (14/26), lg = 16 px (17/30)
const classesTaille: Record<Variante, Record<Taille, string>> = {
  primary: { md: 'px-[26px] py-[14px] text-[15px]', lg: 'px-[30px] py-[17px] text-base' },
  secondary: { md: 'px-[24px] py-[13px] text-[15px]', lg: 'px-[26px] py-[16px] text-base' },
  glass: { md: 'px-[24px] py-[13px] text-[15px]', lg: 'px-[24px] py-[15px] text-base' },
}

type PropsCommunes = {
  variant?: Variante
  size?: Taille
  /** Le bouton suit légèrement le curseur (désactivé sur mobile et si mouvement réduit) */
  magnetic?: boolean
  className?: string
  children: ReactNode
}

type PropsLien = PropsCommunes &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'> & { href: string }

type PropsBouton = PropsCommunes &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & { href?: undefined }

/**
 * Bouton du site. Avec href, c'est un vrai lien <a> ; sinon un vrai <button>.
 * Les icônes (flèches…) se passent en enfants, avec aria-hidden.
 */
export default function Button(props: PropsLien | PropsBouton) {
  const {
    variant = 'primary',
    size = 'md',
    magnetic = false,
    className = '',
    children,
    ...reste
  } = props

  const refLien = useMagnetic<HTMLAnchorElement>(magnetic && props.href !== undefined)
  const refBouton = useMagnetic<HTMLButtonElement>(magnetic && props.href === undefined)

  const classes = [
    'inline-flex items-center justify-center gap-2.5 rounded-pill leading-tight no-underline',
    'transition-[filter,border-color,background-color] duration-200 cursor-pointer',
    'disabled:cursor-not-allowed disabled:opacity-60',
    classesVariante[variant],
    classesTaille[variant][size],
    className,
  ].join(' ')

  if ('href' in reste && reste.href !== undefined) {
    const lien = reste as Omit<PropsLien, keyof PropsCommunes>
    return (
      <a ref={refLien} className={classes} {...lien}>
        {children}
      </a>
    )
  }

  const bouton = reste as Omit<PropsBouton, keyof PropsCommunes>
  return (
    <button ref={refBouton} type="button" className={classes} {...bouton}>
      {children}
    </button>
  )
}

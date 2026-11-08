import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

type Arrondi = 'pill' | 'card' | 'panel' | 'chip' | 'none'

const classesArrondi: Record<Arrondi, string> = {
  pill: 'rounded-pill',
  card: 'rounded-card', // 28 px
  panel: 'rounded-panel', // 32 px
  chip: 'rounded-[24px]',
  none: '',
}

type GlassProps<T extends ElementType> = {
  /** Balise ou composant à rendre (div par défaut) : section, article, form… */
  as?: T
  rounded?: Arrondi
  /** Ombre du verre (activée par défaut) */
  ombre?: boolean
  className?: string
  children?: ReactNode
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>

/**
 * Conteneur en verre dépoli (fond translucide, flou, bordure fine).
 * À poser au-dessus d'un halo ou d'un contenu coloré, sinon l'effet ne se voit pas.
 * Les couleurs suivent le mode grâce aux variables --glass-* de tokens.css.
 */
export default function Glass<T extends ElementType = 'div'>({
  as,
  rounded = 'card',
  ombre = true,
  className = '',
  children,
  ...reste
}: GlassProps<T>) {
  const Balise: ElementType = as ?? 'div'
  const classes = ['glass', classesArrondi[rounded], ombre ? '' : 'glass-sans-ombre', className]
    .filter(Boolean)
    .join(' ')

  return (
    <Balise className={classes} {...reste}>
      {children}
    </Balise>
  )
}

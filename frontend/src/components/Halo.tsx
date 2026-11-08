import type { CSSProperties } from 'react'

type HaloProps = {
  /** Diamètre en px */
  taille?: number
  /** 1 : cuivre (--halo-1) · 2 : caramel / lin (--halo-2) */
  teinte?: 1 | 2
  /** Flou en px (24 par défaut, comme la maquette) */
  flou?: number
  /** Position et autres réglages (ex. « left-1/2 top-1/2 -translate-1/2 ») */
  className?: string
  style?: CSSProperties
}

/**
 * Disque lumineux flou, décoratif, placé derrière le verre
 * (portrait, arbre, galerie, chat, formulaire, footer).
 * Le parent doit être en position relative.
 */
export default function Halo({ taille = 600, teinte = 1, flou = 24, className = '', style }: HaloProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full ${className}`}
      style={{
        width: taille,
        height: taille,
        background: `radial-gradient(circle, var(--halo-${teinte}) 0%, transparent 70%)`,
        filter: `blur(${flou}px)`,
        ...style,
      }}
    />
  )
}

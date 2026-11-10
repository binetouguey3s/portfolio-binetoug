import type { ImgHTMLAttributes } from 'react'
import { sourcesResponsives } from '../lib/images'

type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes'> & {
  /** Chemin de l'original, ex. « /images/portrait-accueil.jpg » */
  src: string
  /** Largeur affichée selon l'écran, ex. « (min-width: 768px) 290px, 170px » */
  sizes: string
  alt: string
  width: number
  height: number
}

/**
 * Image responsive : AVIF puis WebP à plusieurs largeurs (le navigateur prend la plus légère
 * qui suffit à l'écran). Sans versions générées, l'original est affiché tel quel.
 * width et height (taille de l'original) réservent la place : pas de décalage au chargement.
 */
export default function Image({ src, sizes, alt, ...reste }: ImageProps) {
  const sources = sourcesResponsives(src)
  if (!sources) return <img src={src} alt={alt} {...reste} />
  return (
    <picture>
      <source type="image/avif" srcSet={sources.avif} sizes={sizes} />
      <source type="image/webp" srcSet={sources.webp} sizes={sizes} />
      <img src={sources.defaut} alt={alt} {...reste} />
    </picture>
  )
}

type LogoProps = {
  /** logo : version complète (menu, footer) · icone : « BG » seul (chatbot) */
  variant?: 'logo' | 'icone'
  /** Texte alternatif (vide si le logo est décoratif à côté d'un texte) */
  alt?: string
  className?: string
}

const sources = {
  logo: { sombre: '/logo/logo-sombre.svg', clair: '/logo/logo-clair.svg' },
  icone: { sombre: '/logo/icone-sombre.svg', clair: '/logo/icone-claire.svg' },
}

/** Proportions des fichiers SVG (viewBox) : width et height réservent la place avant le chargement */
const dimensions = {
  logo: { width: 760, height: 220 },
  icone: { width: 200, height: 200 },
}

/**
 * Logo dans la bonne version selon le mode.
 * Les deux images sont dans la page ; le CSS (variables --affiche-*) montre
 * seulement celle du mode courant : aucun clignotement au chargement.
 * La taille se règle avec className (ex. « h-[46px] w-auto »).
 */
export default function Logo({ variant = 'logo', alt = 'Binetou Gueye', className = '' }: LogoProps) {
  const src = sources[variant]
  const taille = dimensions[variant]
  return (
    <>
      <img src={src.sombre} alt={alt} {...taille} className={`seulement-sombre ${className}`} decoding="async" />
      <img src={src.clair} alt={alt} {...taille} className={`seulement-clair ${className}`} decoding="async" />
    </>
  )
}

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

/**
 * Logo dans la bonne version selon le mode.
 * Les deux images sont dans la page ; le CSS (variables --affiche-*) montre
 * seulement celle du mode courant : aucun clignotement au chargement.
 * La taille se règle avec className (ex. « h-[46px] w-auto »).
 */
export default function Logo({ variant = 'logo', alt = 'Binetou Gueye', className = '' }: LogoProps) {
  const src = sources[variant]
  return (
    <>
      <img src={src.sombre} alt={alt} className={`seulement-sombre ${className}`} decoding="async" />
      <img src={src.clair} alt={alt} className={`seulement-clair ${className}`} decoding="async" />
    </>
  )
}

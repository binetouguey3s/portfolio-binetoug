type FlowerProps = {
  /** Taille en px (18 dans les bandeaux) */
  taille?: number
  /** Couleur des pétales (classe fill-*), ex. « fill-on-accent » sur le ruban plein */
  petales?: string
  /** Couleur du cœur : celle du fond, pour l'effet « évidé » (classe fill-*) */
  coeur?: string
  className?: string
}

/**
 * Fleur du logo (le « i » de Binetou) : quatre pétales et un cœur.
 * Sert de séparateur dans les bandeaux d'outils. Décorative.
 */
export default function Flower({
  taille = 18,
  petales = 'fill-accent',
  coeur = 'fill-bg',
  className = '',
}: FlowerProps) {
  return (
    <svg
      aria-hidden="true"
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`}
    >
      <g className={petales}>
        <ellipse cx="12" cy="6.5" rx="3" ry="5" />
        <ellipse cx="12" cy="17.5" rx="3" ry="5" />
        <ellipse cx="6.5" cy="12" rx="5" ry="3" />
        <ellipse cx="17.5" cy="12" rx="5" ry="3" />
      </g>
      <circle cx="12" cy="12" r="2.2" className={coeur} />
    </svg>
  )
}

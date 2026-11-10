/**
 * Cernes de bois en SVG (le motif du logo), en trois variantes reprises de la maquette :
 * - portrait   : autour de la photo de l'accueil (viewBox 540 × 540)
 * - portraitMobile : version mobile de la capture 05 (viewBox 300 × 300)
 * - couverture : couvertures des cartes de projets (380 × 210), tournées selon « rotation »
 * - angle      : cercles concentriques partant d'un coin (carte vedette Sen Suivi)
 * Les couleurs viennent des variables CSS : elles changent avec le mode.
 * Le parent doit être en position relative ; le SVG le remplit entièrement.
 */

type RingsProps = {
  variant?: 'portrait' | 'portraitMobile' | 'couverture' | 'angle'
  /** Rotation en degrés (variante couverture : 40° de plus par carte) */
  rotation?: number
  className?: string
}

const base = 'pointer-events-none absolute inset-0 h-full w-full'

export default function Rings({ variant = 'portrait', rotation = 0, className = '' }: RingsProps) {
  if (variant === 'couverture') {
    return (
      <svg aria-hidden="true" viewBox="0 0 380 210" className={`${base} ${className}`}>
        <g transform={`rotate(${rotation} 300 150)`} fill="none">
          <circle cx="300" cy="150" r="40" className="stroke-glow" strokeWidth="1.5" />
          <circle cx="300" cy="150" r="70" className="stroke-border" strokeWidth="1" strokeDasharray="2 6" />
          <path d="M300 50 A100 100 0 1 1 210 105" className="stroke-accent" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="300" cy="150" r="130" className="stroke-border" strokeWidth="1" />
          <circle cx="210" cy="105" r="4" className="fill-text stroke-none" />
        </g>
      </svg>
    )
  }

  if (variant === 'portraitMobile') {
    return (
      <svg aria-hidden="true" viewBox="0 0 300 300" data-centre="150 150" className={`${base} ${className}`}>
        <g fill="none">
          <circle data-cerne="exterieur" cx="150" cy="150" r="146" className="stroke-surface" />
          <circle data-cerne="pointilles" cx="150" cy="150" r="126" className="stroke-border" strokeDasharray="2 8" />
          <g data-cerne="arc">
            <path d="M150 44 A106 106 0 1 1 56 100" className="stroke-accent" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="56" cy="100" r="5" className="fill-text stroke-none" />
          </g>
        </g>
      </svg>
    )
  }

  if (variant === 'angle') {
    return (
      <svg aria-hidden="true" viewBox="0 0 400 400" className={`${base} opacity-50 ${className}`}>
        <g fill="none" className="stroke-border">
          <circle cx="400" cy="400" r="120" />
          <circle cx="400" cy="400" r="190" />
          <circle cx="400" cy="400" r="260" />
          <circle cx="400" cy="400" r="330" />
        </g>
      </svg>
    )
  }

  // portrait
  return (
    <svg aria-hidden="true" viewBox="0 0 540 540" data-centre="270 270" className={`${base} ${className}`}>
      <g fill="none">
        <circle data-cerne="exterieur" cx="270" cy="270" r="262" className="stroke-surface" strokeWidth="1" />
        <circle data-cerne="pointilles" cx="270" cy="270" r="232" className="stroke-border" strokeWidth="1.5" strokeDasharray="2 10" />
        <circle data-cerne="cuivre" cx="270" cy="270" r="204" className="stroke-glow" strokeWidth="1.2" opacity="0.7" />
        <g data-cerne="arc">
          <path d="M270 92 A178 178 0 1 1 112 186" className="stroke-accent" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="112" cy="186" r="6" className="fill-text stroke-none" />
        </g>
        <circle data-cerne="interieur" cx="270" cy="270" r="156" className="stroke-border" strokeWidth="1" />
      </g>
    </svg>
  )
}

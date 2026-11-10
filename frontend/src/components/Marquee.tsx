import { Fragment, useRef } from 'react'
import Flower from './Flower'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import type { GroupeBandeau } from '../types/content'

type MarqueeProps = {
  groupes: GroupeBandeau[]
  /** plein : ruban accent (ruban 1) · verre : ruban en verre dépoli (ruban 2) */
  variante: 'plein' | 'verre'
  /** Sens du défilement */
  sens: 'gauche' | 'droite'
  /** Durée d'un tour complet, en secondes (plus grand = plus lent) */
  duree?: number
  className?: string
}

/**
 * Ruban infini des outils (captures 02-…-03/04 et 04-…-03/04).
 * - Défilement en CSS (contenu dupliqué, translateX de 0 à −50 %).
 * - Ralentit au survol ; accélère avec la vitesse de défilement de la page
 *   (GSAP ajuste la vitesse de lecture de l'animation CSS).
 * - Immobile si prefers-reduced-motion (voir .marquee-piste dans index.css).
 * - Le ruban animé est masqué aux lecteurs d'écran : la section fournit une liste lisible.
 */
export default function Marquee({ groupes, variante, sens, duree = 60, className = '' }: MarqueeProps) {
  const ruban = useRef<HTMLDivElement>(null)
  const plein = variante === 'plein'

  useGSAP(
    () => {
      const piste = ruban.current?.querySelector<HTMLElement>('.marquee-piste')
      const animation = piste?.getAnimations()[0]
      if (!piste || !animation) return

      const etat = { survol: 1, elan: 0 }
      const appliquer = () => {
        animation.playbackRate = etat.survol * (1 + etat.elan)
      }

      // Survol : ralentit en douceur
      const entrer = () =>
        gsap.to(etat, { survol: 0.25, duration: 0.6, ease: 'power2.out', onUpdate: appliquer })
      const sortir = () =>
        gsap.to(etat, { survol: 1, duration: 0.6, ease: 'power2.out', onUpdate: appliquer })
      ruban.current?.addEventListener('pointerenter', entrer)
      ruban.current?.addEventListener('pointerleave', sortir)

      // Vitesse de défilement de la page : élan temporaire, qui retombe tout seul
      const declencheur = ScrollTrigger.create({
        trigger: ruban.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const elan = Math.min(3, Math.abs(self.getVelocity()) / 800)
          gsap.to(etat, {
            elan,
            duration: 0.3,
            overwrite: true,
            onUpdate: appliquer,
            onComplete: () => {
              gsap.to(etat, { elan: 0, duration: 1.2, ease: 'power2.out', onUpdate: appliquer })
            },
          })
        },
      })

      return () => {
        ruban.current?.removeEventListener('pointerenter', entrer)
        ruban.current?.removeEventListener('pointerleave', sortir)
        declencheur.kill()
        animation.playbackRate = 1
      }
    },
    { scope: ruban },
  )

  const contenu = (copie: number) => (
    <div className="flex shrink-0 items-center gap-[26px] pr-[26px]" key={copie}>
      {groupes.map((groupe) => (
        <Fragment key={groupe.categorie}>
          <span
            className={`whitespace-nowrap rounded-pill border px-3.5 py-[7px] font-mono text-[11px] tracking-[2px] opacity-85 md:text-[13px] ${
              plein ? 'border-on-accent text-on-accent' : 'border-text text-text'
            }`}
          >
            {groupe.categorie}
          </span>
          {groupe.items.map((item) => (
            <Fragment key={item}>
              <span
                className={`whitespace-nowrap font-display leading-none ${
                  plein ? 'text-[26px] text-on-accent md:text-[34px]' : 'text-[24px] text-text md:text-[30px]'
                }`}
              >
                {item}
              </span>
              {/* Une fleur après chaque outil, comme la maquette */}
              <Flower
                petales={plein ? 'fill-on-accent' : 'fill-accent'}
                coeur={plein ? 'fill-accent' : 'fill-bg'}
              />
            </Fragment>
          ))}
        </Fragment>
      ))}
    </div>
  )

  return (
    <div
      ref={ruban}
      aria-hidden="true"
      className={[
        'overflow-hidden',
        plein
          ? 'bg-accent py-4 shadow-glass md:py-[22px]'
          : 'border-y border-glass-border bg-glass-bg py-4 backdrop-blur-[20px] backdrop-saturate-[1.4] md:py-5',
        className,
      ].join(' ')}
    >
      <div
        className={`marquee-piste flex w-max ${sens === 'droite' ? 'marquee-droite' : ''}`}
        style={{ animationDuration: `${duree}s` }}
      >
        {contenu(1)}
        {contenu(2)}
      </div>
    </div>
  )
}

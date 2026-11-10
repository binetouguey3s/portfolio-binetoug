import { useRef, useState } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { signalerFinIntro } from '../lib/intro'
import { useReducedMotion } from '../hooks/useReducedMotion'

/**
 * Préchargement court (~1,6 s) : l'anneau du G se dessine (stroke-dashoffset),
 * puis le B, puis la fleur éclot ; l'écran s'efface et l'accueil se révèle.
 * Le dessin reprend les tracés exacts du logo (assets/logo), en variables CSS.
 * Absent si prefers-reduced-motion. Décoratif (aria-hidden).
 */
export default function Preloader() {
  const mouvementReduit = useReducedMotion()
  const [visible, setVisible] = useState(!mouvementReduit)
  const racine = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (mouvementReduit) {
        signalerFinIntro()
        setVisible(false)
        return
      }
      const traits = gsap.utils.toArray<SVGPathElement>('[data-trait]')
      traits.forEach((t) => {
        const longueur = t.getTotalLength()
        gsap.set(t, { strokeDasharray: longueur, strokeDashoffset: longueur })
      })

      const tl = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        onComplete: () => setVisible(false),
      })
      tl.to('[data-trait="anneau"]', { strokeDashoffset: 0, duration: 0.8 })
        .to('[data-trait="b"]', { strokeDashoffset: 0, duration: 0.55 }, '-=0.35')
        .from(
          '[data-fleur]',
          { scale: 0, rotation: -90, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(2.2)' },
          '-=0.15',
        )
        .to(racine.current, { autoAlpha: 0, duration: 0.45, ease: 'power2.out' }, '+=0.15')
        .call(signalerFinIntro, [], '<0.1')
    },
    { scope: racine, dependencies: [mouvementReduit] },
  )

  if (!visible) return null

  return (
    <div
      ref={racine}
      aria-hidden="true"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-bg"
    >
      <svg viewBox="0 0 200 200" className="size-24 md:size-28">
        <g fill="none" className="stroke-accent" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round">
          <path data-trait="anneau" d="M156.7 55.7 A72 72 0 1 0 170.4 115.0 H128" />
          <path
            data-trait="b"
            d="M78 58 V142 M78 58 H101 a19.5 19.5 0 0 1 0 39 H78 M78 97 H106 a22.5 22.5 0 0 1 0 45 H78"
          />
        </g>
        <g data-fleur>
          {[0, 90, 180, 270].map((angle) => (
            <ellipse
              key={angle}
              cx="156.7"
              cy="48.7"
              rx="4.2"
              ry="7.5"
              transform={`rotate(${angle} 156.7 55.7)`}
              className="fill-text"
            />
          ))}
          <circle cx="156.7" cy="55.7" r="3.6" className="fill-bg" />
        </g>
      </svg>
    </div>
  )
}

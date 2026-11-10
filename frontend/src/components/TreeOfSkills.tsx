import { useId, useRef } from 'react'
import { BRANCHES, FEUILLAGE, LUCIOLES, RACINES, RAYONS, SOL, TRONC } from '../data/arbre-competences'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { gsap, useGSAP } from '../lib/gsap'

/** Groupes de l'arbre qu'une carte de compétences peut mettre en lumière */
export type GroupeArbre = 'racines' | 'tronc' | 'branches' | 'feuillage'

type TreeOfSkillsProps = {
  /** Partie mise en lumière (survol d'une carte), ou null */
  actif?: GroupeArbre | null
  className?: string
}

/** Teintes du feuillage (voir data/arbre-competences.ts) */
const TEINTES_FEUILLES = ['fill-glow', 'fill-border', 'fill-accent', 'fill-[var(--c-lin)]']

/**
 * L'arbre des compétences (assets/illustrations/arbre-competences.svg) en composant React.
 * Même dessin dans les deux modes : toutes les couleurs sont des variables CSS
 * (--accent, --border, --glow, --surface ; reflets en --c-lin).
 * Groupes nommés : soleil, sol, racines, tronc, branches, feuillage, lucioles.
 *
 * Animation (ScrollTrigger, scrub) : le tronc pousse, les racines se dessinent,
 * puis les branches, puis le feuillage apparaît par vagues depuis le tronc ;
 * les lucioles scintillent en boucle. Tout est immobile si mouvement réduit.
 */
export default function TreeOfSkills({ actif = null, className = '' }: TreeOfSkillsProps) {
  const svg = useRef<SVGSVGElement>(null)
  const mouvementReduit = useReducedMotion()
  const id = useId().replace(/:/g, '')
  const idSoleil = `soleil-${id}`
  const idSol = `sol-${id}`
  const idTronc = `tronc-${id}`
  const idFlou = `flou-${id}`

  useGSAP(
    () => {
      if (mouvementReduit || !svg.current) return

      const prepareTrace = (selecteur: string) => {
        const traits = gsap.utils.toArray<SVGPathElement>(selecteur)
        traits.forEach((t) => {
          const longueur = t.getTotalLength()
          gsap.set(t, { strokeDasharray: longueur, strokeDashoffset: longueur })
        })
        return traits
      }
      const racines = prepareTrace('[data-groupe="racines"] path')
      const branches = prepareTrace('[data-groupe="branches"] path')
      const feuilles = gsap.utils.toArray<SVGCircleElement>('[data-groupe="feuillage"] circle')

      // Vagues de feuillage : les feuilles proches du haut du tronc (220, 248) d'abord
      const distance = (el: SVGCircleElement) =>
        Math.hypot(Number(el.getAttribute('cx')) - 220, Number(el.getAttribute('cy')) - 248)

      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: svg.current, start: 'top 85%', end: 'bottom 70%', scrub: 1 },
        })
        .from('[data-groupe="soleil"]', { autoAlpha: 0, duration: 1 }, 0)
        .from('[data-groupe="tronc"] path', { scaleY: 0, transformOrigin: '50% 100%', duration: 1.2 }, 0)
        .to(racines, { strokeDashoffset: 0, duration: 1.4, stagger: 0.008 }, 0.4)
        .to(branches, { strokeDashoffset: 0, duration: 1.2, stagger: 0.008 }, 1.2)
        .from(
          feuilles,
          {
            scale: 0,
            autoAlpha: 0,
            transformOrigin: '50% 50%',
            duration: 0.5,
            ease: 'back.out(2)',
            stagger: (i, cible: SVGCircleElement) => distance(cible) * 0.012 + i * 0.0004,
          },
          2.4,
        )

      // Lucioles : scintillement continu, indépendant du défilement
      gsap.utils.toArray<SVGGElement>('[data-groupe="lucioles"] g').forEach((luciole) => {
        gsap.to(luciole, {
          opacity: 0.25,
          duration: gsap.utils.random(0.8, 1.8),
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: gsap.utils.random(0, 2),
        })
      })
    },
    { scope: svg, dependencies: [mouvementReduit], revertOnUpdate: true },
  )

  return (
    <svg
      ref={svg}
      role="img"
      aria-label="Arbre des compétences : racines back-end lumineuses, tronc méthode, branches front-end, feuillage IA"
      viewBox="0 0 440 660"
      data-actif={actif ?? undefined}
      className={`arbre block h-auto w-full ${className}`}
    >
      <defs>
        <radialGradient id={idSoleil} cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: 'var(--c-lin)' }} stopOpacity="0.95" />
          <stop offset="18%" style={{ stopColor: 'var(--accent)' }} stopOpacity="0.75" />
          <stop offset="55%" style={{ stopColor: 'var(--glow)' }} stopOpacity="0.22" />
          <stop offset="100%" style={{ stopColor: 'var(--glow)' }} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={idSol} cx="50%" cy="0%" r="100%">
          <stop offset="0%" style={{ stopColor: 'var(--surface)' }} stopOpacity="0.6" />
          <stop offset="60%" style={{ stopColor: 'var(--surface)' }} stopOpacity="0.18" />
          <stop offset="100%" style={{ stopColor: 'var(--surface)' }} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={idTronc} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" style={{ stopColor: 'var(--border)' }} />
          <stop offset="55%" style={{ stopColor: 'var(--glow)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--border)' }} />
        </linearGradient>
        <filter id={idFlou} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      <g data-groupe="sol">
        <path d={SOL} fill={`url(#${idSol})`} />
      </g>

      <g data-groupe="soleil">
        <circle cx="250" cy="308" r="190" fill={`url(#${idSoleil})`} />
        <g className="stroke-accent" strokeWidth="1.2" strokeOpacity="0.35" strokeLinecap="round">
          {RAYONS.map(([x1, y1, x2, y2]) => (
            <line key={`${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
        </g>
      </g>

      <g data-groupe="racines" fill="none" className="stroke-accent" strokeOpacity="0.92" strokeLinecap="round">
        {RACINES.map(([d, epaisseur], i) => (
          <path key={i} d={d} strokeWidth={epaisseur} />
        ))}
      </g>

      <g data-groupe="tronc">
        <path d={TRONC} fill={`url(#${idTronc})`} />
      </g>

      <g data-groupe="branches" fill="none" className="stroke-border" strokeLinecap="round">
        {BRANCHES.map(([d, epaisseur], i) => (
          <path key={i} d={d} strokeWidth={epaisseur} />
        ))}
      </g>

      <g data-groupe="feuillage">
        {FEUILLAGE.map(([cx, cy, r, teinte, opacite], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fillOpacity={opacite} className={TEINTES_FEUILLES[teinte]} />
        ))}
      </g>

      <g data-groupe="lucioles">
        {LUCIOLES.map(([cx, cy]) => (
          <g key={`${cx}-${cy}`}>
            <circle cx={cx} cy={cy} r="5" fillOpacity="0.8" filter={`url(#${idFlou})`} className="fill-accent" />
            <circle cx={cx} cy={cy} r="1.6" className="fill-[var(--c-lin)]" />
          </g>
        ))}
      </g>

      {/* Ligne du sol */}
      <line
        x1="10"
        y1="338"
        x2="430"
        y2="338"
        className="stroke-accent"
        strokeWidth="1"
        strokeOpacity="0.5"
        strokeDasharray="3 7"
      />
    </svg>
  )
}

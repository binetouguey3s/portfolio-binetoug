import { useRef } from 'react'
import Chip from './Chip'
import Rings from './Rings'
import { gsap, useGSAP } from '../lib/gsap'
import { LIEN_EXTERNE, lienValide } from '../lib/liens'
import type { ProjetGalerie } from '../types/content'

type ProjectCardProps = {
  projet: ProjetGalerie
  /** Position dans la galerie : fait tourner les cernes de la couverture (40° par carte) */
  index: number
  className?: string
}

/**
 * Carte de projet en verre (captures 01-…-04/05).
 * Couverture : numéro, cernes, domaine (en attendant de vraies captures).
 * Inclinaison 3D légère au survol (souris uniquement, coupée si mouvement réduit).
 * Le lien est masqué s'il n'est pas renseigné dans contenu.json.
 */
export default function ProjectCard({ projet, index, className = '' }: ProjectCardProps) {
  const carte = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = carte.current
      if (!el) return
      const mm = gsap.matchMedia()
      mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
        gsap.set(el, { transformPerspective: 900 })
        const versX = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3.out' })
        const versY = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3.out' })
        const surMouvement = (e: PointerEvent) => {
          const r = el.getBoundingClientRect()
          versY(((e.clientX - r.left) / r.width - 0.5) * 10)
          versX(-((e.clientY - r.top) / r.height - 0.5) * 8)
        }
        const surSortie = () => {
          versX(0)
          versY(0)
        }
        el.addEventListener('pointermove', surMouvement)
        el.addEventListener('pointerleave', surSortie)
        return () => {
          el.removeEventListener('pointermove', surMouvement)
          el.removeEventListener('pointerleave', surSortie)
        }
      })
      return () => mm.revert()
    },
    { scope: carte },
  )

  return (
    <article
      ref={carte}
      data-carte-projet
      // Verre un peu plus couvrant que .glass : les petits textes accent restent au-dessus
      // du contraste AA même quand un halo passe derrière la carte
      style={{ background: 'color-mix(in srgb, var(--bg) 55%, transparent)' }}
      className={`glass flex shrink-0 flex-col overflow-hidden rounded-card ${className}`}
    >
      <div className="relative flex h-[180px] items-center justify-center overflow-hidden bg-surface/60 md:h-[210px]">
        <p className="absolute left-[22px] top-[18px] z-[1] m-0 font-display text-[40px] leading-none text-accent">
          {projet.num}
        </p>
        <Rings variant="couverture" rotation={index * 40} />
        <p className="absolute bottom-[18px] left-[22px] m-0 font-mono text-[11px] tracking-[1.5px] text-accent">
          {projet.domaine}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-3.5 p-6 md:p-7">
        <p className="m-0 text-[13px] text-accent">{projet.meta}</p>
        <h3 className="m-0 font-display text-[26px] leading-tight font-normal md:text-[30px]">{projet.nom}</h3>
        <p className="m-0 text-[15px] leading-[1.6] text-text/82">{projet.description}</p>
        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {projet.stack.map((techno) => (
            <li key={techno}>
              <Chip size="xs">{techno}</Chip>
            </li>
          ))}
        </ul>
        {lienValide(projet.lien.url) ? (
          <a
            href={projet.lien.url}
            {...LIEN_EXTERNE}
            className="mt-auto self-start text-[14px] font-medium text-accent no-underline hover:underline"
          >
            {projet.lien.label}
            <span className="sr-only"> : {projet.nom} (nouvel onglet)</span>
          </a>
        ) : null}
      </div>
    </article>
  )
}

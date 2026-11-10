import { useRef, useState } from 'react'
import Chip from '../components/Chip'
import Glass from '../components/Glass'
import Halo from '../components/Halo'
import SectionHeading from '../components/SectionHeading'
import TreeOfSkills, { type GroupeArbre } from '../components/TreeOfSkills'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { contenu } from '../lib/content'
import { gsap, useGSAP } from '../lib/gsap'
import type { GroupeCompetences } from '../types/content'

/** Chaque groupe de compétences (contenu.json) correspond à une partie de l'arbre */
const PARTIE_VERS_GROUPE: Record<string, GroupeArbre> = {
  fruits: 'feuillage',
  branches: 'branches',
  tronc: 'tronc',
  racines: 'racines',
}

type CarteProps = {
  groupe: GroupeCompetences
  surSurvol: (groupe: GroupeArbre | null) => void
}

/** Carte en verre d'un groupe de compétences ; la survoler illumine sa partie de l'arbre. */
function CarteCompetences({ groupe, surSurvol }: CarteProps) {
  const partie = PARTIE_VERS_GROUPE[groupe.partie] ?? null
  return (
    <Glass
      as="article"
      rounded="none"
      ombre={false}
      data-carte
      onMouseEnter={() => surSurvol(partie)}
      onMouseLeave={() => surSurvol(null)}
      className="flex flex-col gap-3.5 rounded-[24px] p-[26px]"
    >
      <h3 className="m-0 font-mono text-[12px] font-normal tracking-[2px] text-accent">{groupe.titre}</h3>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {groupe.items.map((item) => (
          <li key={item}>
            <Chip
              font="body"
              variant={groupe.misEnAvant?.includes(item) ? 'accent' : 'surface'}
              className="text-[13px]"
            >
              {item}
            </Chip>
          </li>
        ))}
      </ul>
    </Glass>
  )
}

/**
 * 02 · Compétences — l'arbre (captures 01-…-02/03 et 03-…-02/03).
 * Desktop : cartes Fruits et Branches à gauche, l'arbre au centre,
 * Tronc et Racines à droite. Mobile : l'arbre en haut, cartes empilées.
 */
export default function Skills() {
  const { competences } = contenu
  const [actif, setActif] = useState<GroupeArbre | null>(null)
  const mouvementReduit = useReducedMotion()
  const section = useRef<HTMLElement>(null)

  const [fruits, branches, tronc, racines] = competences.groupes

  useGSAP(
    () => {
      if (mouvementReduit) return
      gsap.from('[data-monte]', {
        autoAlpha: 0,
        y: 40,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: section.current, start: 'top 75%', once: true },
      })
      gsap.from('[data-carte]', {
        autoAlpha: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: '[data-cartes]', start: 'top 80%', once: true },
      })
    },
    { scope: section, dependencies: [mouvementReduit] },
  )

  return (
    <section
      ref={section}
      id="arbre"
      aria-labelledby="titre-competences"
      className="relative overflow-hidden bg-bg"
    >
      <Halo taille={660} className="left-1/2 top-[52%] -ml-[330px]" />
      <Halo taille={380} teinte={2} className="-left-40 top-[120px]" />

      <div className="relative mx-auto flex max-w-[1280px] flex-col gap-10 px-[22px] py-[72px] md:px-10 lg:gap-14 lg:px-16 lg:py-[120px]">
        <div className="flex max-w-[760px] flex-col gap-[18px]">
          <div data-monte>
            <SectionHeading id="titre-competences" numero={competences.numero} titre={competences.titre} />
          </div>
          <p data-monte className="m-0 text-base leading-[1.65] text-text-muted md:text-lg">
            {competences.texte}
          </p>
        </div>

        <div
          data-cartes
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:flex lg:flex-row lg:items-stretch lg:gap-8"
        >
          {/* L'arbre : en haut sur mobile et tablette, au centre sur desktop */}
          <div className="flex items-center justify-center md:col-span-2 lg:order-2 lg:flex-[1_1_380px]">
            <TreeOfSkills actif={actif} className="max-w-[340px] md:max-w-[380px] lg:max-w-[420px]" />
          </div>

          <div className="contents lg:order-1 lg:flex lg:min-w-0 lg:flex-[1_1_300px] lg:flex-col lg:justify-center lg:gap-5">
            <CarteCompetences groupe={fruits} surSurvol={setActif} />
            <CarteCompetences groupe={branches} surSurvol={setActif} />
          </div>
          <div className="contents lg:order-3 lg:flex lg:min-w-0 lg:flex-[1_1_300px] lg:flex-col lg:justify-center lg:gap-5">
            <CarteCompetences groupe={tronc} surSurvol={setActif} />
            <CarteCompetences groupe={racines} surSurvol={setActif} />
          </div>
        </div>
      </div>
    </section>
  )
}

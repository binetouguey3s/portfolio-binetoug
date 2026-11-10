import { useEffect, useRef } from 'react'
import FeaturedProject from '../components/FeaturedProject'
import Halo from '../components/Halo'
import ProjectCard from '../components/ProjectCard'
import SectionHeading from '../components/SectionHeading'
import { useDonneesApi } from '../hooks/useDonneesApi'
import { contenu } from '../lib/content'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import { obtenirLenis } from '../lib/lenis'
import { LIEN_EXTERNE, lienValide } from '../lib/liens'
import { chargerGalerie } from '../lib/projets-service'

/**
 * 03 · Projets (captures 01-…-03/04/05 et 03-…-03/04/05).
 * - Carte vedette Sen Suivi + fenêtre vidéo.
 * - Galerie de 7 cartes : sur desktop (≥ 1024 px), la galerie est épinglée et glisse
 *   horizontalement au défilement ; sur mobile (ou si mouvement réduit),
 *   carrousel horizontal au doigt avec scroll-snap.
 * - Autres réalisations : lignes cliquables quand elles ont un lien.
 */
export default function Projects() {
  const { projets } = contenu
  const section = useRef<HTMLElement>(null)
  const galerie = useRef<HTMLDivElement>(null)
  const piste = useRef<HTMLDivElement>(null)
  // Projets de l'admin Django (GET /api/projets/) ; repli : projets.galerie de contenu.json
  const galerieProjets = useDonneesApi(chargerGalerie, projets.galerie)

  // La liste vient de changer (réponse de l'API) : la longueur du défilement horizontal est recalculée
  useEffect(() => {
    if (galerieProjets !== projets.galerie) ScrollTrigger.refresh()
  }, [galerieProjets, projets.galerie])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      // Apparition douce de l'en-tête et de la carte vedette
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-monte]', {
          autoAlpha: 0,
          y: 40,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: section.current, start: 'top 75%', once: true },
        })
      })

      // Desktop : galerie épinglée qui glisse horizontalement
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const conteneur = galerie.current
        const rail = piste.current
        if (!conteneur || !rail) return

        conteneur.dataset.epingle = 'oui'
        const distance = () => Math.max(0, rail.scrollWidth - window.innerWidth)

        const tween = gsap.to(rail, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: conteneur,
            start: 'center center',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        })

        // Clavier : un lien de carte qui reçoit le focus est ramené à l'écran
        const surFocus = (e: FocusEvent) => {
          const st = tween.scrollTrigger
          const carte = (e.target as HTMLElement).closest<HTMLElement>('[data-carte-projet]')
          if (!st || !carte || distance() === 0) return
          const progression = Math.min(1, Math.max(0, (carte.offsetLeft - 64) / distance()))
          const cible = st.start + progression * (st.end - st.start)
          const lenis = obtenirLenis()
          if (lenis) lenis.scrollTo(cible, { immediate: true })
          else window.scrollTo(0, cible)
        }
        rail.addEventListener('focusin', surFocus)

        return () => {
          rail.removeEventListener('focusin', surFocus)
          delete conteneur.dataset.epingle
        }
      })

      // Les polices et images changent les hauteurs : on recalcule une fois tout chargé
      const recalculer = () => ScrollTrigger.refresh()
      window.addEventListener('load', recalculer)
      return () => {
        window.removeEventListener('load', recalculer)
        mm.revert()
      }
    },
    { scope: section },
  )

  return (
    <section
      ref={section}
      id="projets"
      aria-labelledby="titre-projets"
      className="relative overflow-hidden border-t border-surface bg-bg-2"
    >
      <Halo taille={620} className="-right-[200px] top-[200px]" />
      <Halo taille={520} teinte={2} className="-left-[180px] bottom-[260px]" />

      <div className="relative mx-auto flex max-w-[1280px] flex-col gap-10 px-[22px] pb-10 pt-[72px] md:px-10 lg:gap-12 lg:px-16 lg:pb-14 lg:pt-[120px]">
        <div data-monte className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            id="titre-projets"
            numero={projets.numero}
            titre={projets.titre}
            className="max-w-[720px]"
          />
          <p className="m-0 hidden font-mono text-[13px] text-accent lg:block motion-reduce:hidden">
            {projets.indication}
          </p>
        </div>

        <div data-monte>
          <FeaturedProject vedette={projets.vedette} />
        </div>
      </div>

      {/* Galerie : épinglée sur desktop, carrousel au doigt sur mobile */}
      <div
        ref={galerie}
        className="sans-barre relative snap-x snap-mandatory overflow-x-auto pb-[72px] data-[epingle=oui]:snap-none data-[epingle=oui]:overflow-visible lg:pb-[120px]"
      >
        <div
          ref={piste}
          className="flex w-max gap-4 px-[22px] md:gap-6 md:px-10 lg:pl-[max(64px,calc((100vw-1280px)/2+64px))] lg:pr-16"
        >
          {galerieProjets.map((projet, i) => (
            <ProjectCard
              key={projet.num}
              projet={projet}
              index={i}
              className="w-[min(82vw,340px)] snap-start scroll-ml-[22px] md:w-[380px] md:scroll-ml-10"
            />
          ))}
        </div>
      </div>

      {/* Autres réalisations */}
      <div className="relative mx-auto flex max-w-[1280px] flex-col gap-[18px] px-[22px] pb-[72px] md:px-10 lg:px-16 lg:pb-[120px]">
        <h3 className="m-0 font-mono text-[12px] font-normal tracking-[2px] text-accent">{projets.autresTitre}</h3>
        <ul className="m-0 grid list-none grid-cols-1 border-t border-surface p-0 md:grid-cols-2 md:gap-x-10 lg:grid-cols-3">
          {projets.autres.map((autre) => {
            const contenuLigne = (
              <>
                <span className="text-base">
                  {autre.nom}
                  {lienValide(autre.url) ? (
                    <span aria-hidden="true" className="ml-1.5 text-[12px] text-accent opacity-70">
                      ↗
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 whitespace-nowrap text-right font-mono text-[12px] text-accent">{autre.detail}</span>
              </>
            )
            const classesLigne = 'flex items-baseline justify-between gap-4 border-b border-surface py-[18px]'
            return (
              <li key={autre.nom}>
                {lienValide(autre.url) ? (
                  <a
                    href={autre.url}
                    {...LIEN_EXTERNE}
                    className={`${classesLigne} text-text no-underline transition-colors duration-200 hover:text-accent`}
                  >
                    {contenuLigne}
                    <span className="sr-only">(nouvel onglet)</span>
                  </a>
                ) : (
                  <div className={classesLigne}>{contenuLigne}</div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

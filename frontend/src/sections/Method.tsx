import { useRef } from 'react'
import SectionHeading from '../components/SectionHeading'
import Terminal from '../components/Terminal'
import { contenu } from '../lib/content'
import { gsap, useGSAP } from '../lib/gsap'

/** Icônes des 4 étapes (tracés de la maquette) : graine, racines, tronc, fruit */
const ICONES = [
  <>
    <ellipse cx="12" cy="14" rx="5" ry="6.5" />
    <path d="M12 7.5c0-2 1-3.5 3-4.5" />
  </>,
  <>
    <path d="M12 3v8" />
    <path d="M12 11c-3 2-5 5-6 9M12 11c0 3 0 6 0 9M12 11c3 2 5 5 6 9" />
    <path d="M4 11h16" />
  </>,
  <>
    <path d="M9 21V10M15 21V10" />
    <path d="M9 13l-4-4M15 11l4-4" />
    <path d="M7 21h10" />
  </>,
  <>
    <circle cx="12" cy="14" r="6" />
    <path d="M12 8c0-2.5 1.5-4 4-5" />
  </>,
]

/**
 * 04 · Ma méthode (captures 02-…-01/02 et 04-…-01/02).
 * Variation de ton, pas d'inversion : variables --contrast-* uniquement, sauf
 * - la 4e carte « Livrer » : fond --bg et bordure 1 px --accent (mise en avant) ;
 * - les ronds des étapes et le fond du terminal en --bg, le cuivre (--glow) pour
 *   la ligne et les chiffres romains, comme la maquette.
 * Animation : la ligne se dessine au défilement et chaque étape apparaît
 * quand la ligne l'atteint (horizontale sur desktop, verticale sur mobile).
 */
export default function Method() {
  const { methode, profilApi } = contenu
  const section = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(
        {
          desktop: '(min-width: 1024px)',
          anime: '(prefers-reduced-motion: no-preference)',
        },
        (contexte) => {
          const { desktop, anime } = contexte.conditions as { desktop: boolean; anime: boolean }
          if (!anime) return

          gsap.from('[data-monte]', {
            autoAlpha: 0,
            y: 40,
            duration: 0.9,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: section.current, start: 'top 75%', once: true },
          })

          // Ligne qui se dessine + étapes qui apparaissent quand elle les atteint
          const etapes = gsap.utils.toArray<HTMLElement>('[data-etape]')
          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { trigger: '[data-etapes]', start: 'top 80%', end: 'bottom 60%', scrub: 1 },
          })
          tl.fromTo(
            '[data-ligne-methode]',
            desktop ? { scaleX: 0 } : { scaleY: 0 },
            { ...(desktop ? { scaleX: 1 } : { scaleY: 1 }), duration: etapes.length - 1 },
            0,
          )
          etapes.forEach((etape, i) => {
            tl.from(etape, { autoAlpha: 0, y: 30, duration: 0.5, ease: 'power2.out' }, Math.max(0, i - 0.15))
          })

          // Engagements i à iv : apparition décalée
          gsap.from('[data-engagement]', {
            autoAlpha: 0,
            x: 24,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: { trigger: '[data-engagements]', start: 'top 80%', once: true },
          })
        },
      )
      return () => mm.revert()
    },
    { scope: section },
  )

  return (
    <section
      ref={section}
      id="methode"
      aria-labelledby="titre-methode"
      className="overflow-x-clip bg-contrast-bg text-contrast-text"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-12 px-[22px] py-[72px] md:px-10 lg:gap-[72px] lg:px-16 lg:py-[120px]">
        {/* En-tête */}
        <div data-monte className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading
            id="titre-methode"
            numero={methode.numero}
            titre={methode.titre}
            ton="contrast"
            className="min-w-0 flex-[1_1_640px]"
          />
          <p className="m-0 flex-[0_1_360px] text-base leading-[1.7] text-contrast-text-soft md:text-[17px]">
            {methode.texte}
          </p>
        </div>

        {/* Les 4 étapes reliées par une ligne */}
        <div data-etapes className="relative">
          <div
            aria-hidden="true"
            data-ligne-methode
            className="absolute bottom-28 left-[27px] top-7 w-0.5 origin-top bg-glow lg:bottom-auto lg:top-[27px] lg:h-0.5 lg:w-[calc(75%-8px)] lg:origin-left"
          />
          <ol className="relative m-0 grid list-none grid-cols-1 gap-8 p-0 lg:grid-cols-4 lg:gap-5">
            {methode.etapes.map((etape, i) => {
              const enAvant = Boolean(etape.misEnAvant)
              return (
                <li key={etape.num} data-etape className="relative flex flex-col gap-5">
                  <span
                    aria-hidden="true"
                    className={`flex size-14 items-center justify-center rounded-full ${enAvant ? 'bg-accent' : 'bg-bg'}`}
                  >
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={enAvant ? 'stroke-on-accent' : 'stroke-contrast-label'}
                    >
                      {ICONES[i]}
                    </svg>
                  </span>
                  <article
                    className={[
                      'flex flex-1 flex-col gap-3 rounded-[26px] border p-[26px]',
                      enAvant ? 'border-accent bg-bg' : 'border-contrast-card-border bg-contrast-card',
                    ].join(' ')}
                  >
                    <p className="m-0 font-mono text-[12px] tracking-[2px] text-contrast-label">
                      {etape.num} · {etape.nom}
                    </p>
                    <h3 className="m-0 font-display text-[30px] leading-[1.1] font-normal">{etape.titre}</h3>
                    <p
                      className={`m-0 text-[15px] leading-[1.65] ${enAvant ? 'text-contrast-text/85' : 'text-contrast-text-soft'}`}
                    >
                      {etape.texte}
                    </p>
                    <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0 pt-1">
                      {etape.tags.map((tag) => (
                        <li
                          key={tag}
                          className={`rounded-pill border border-contrast-card-border px-2.5 py-[5px] font-mono text-[11px] ${
                            enAvant ? 'text-contrast-label' : 'text-contrast-text'
                          }`}
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </article>
                </li>
              )
            })}
          </ol>
        </div>

        {/* Terminal + engagements */}
        <div className="flex flex-wrap items-stretch gap-10">
          <div className="min-w-0 flex-[1_1_600px]">
            <Terminal donnees={methode.terminal} profil={profilApi} />
          </div>
          <div data-engagements className="flex min-w-0 flex-[1_1_360px] flex-col justify-center gap-[22px]">
            <h3 className="m-0 font-mono text-[12px] font-normal tracking-[2px] text-contrast-label">
              {methode.engagementsTitre}
            </h3>
            <ul className="m-0 flex list-none flex-col p-0">
              {methode.engagements.map((engagement, i) => (
                <li
                  key={engagement.num}
                  data-engagement
                  className={`flex gap-[18px] py-[18px] ${
                    i < methode.engagements.length - 1 ? 'border-b border-contrast-border' : ''
                  }`}
                >
                  <p aria-hidden="true" className="m-0 w-[34px] shrink-0 font-display text-[22px] text-contrast-label">
                    {engagement.num}
                  </p>
                  <div className="flex flex-col gap-1">
                    <p className="m-0 text-[17px] font-semibold">{engagement.titre}</p>
                    <p className="m-0 text-[15px] leading-[1.6] text-contrast-text-soft">
                      {engagement.texte}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

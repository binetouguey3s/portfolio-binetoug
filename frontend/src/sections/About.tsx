import { useRef } from 'react'
import SectionHeading from '../components/SectionHeading'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { contenu } from '../lib/content'
import { gsap, useGSAP } from '../lib/gsap'
import Image from '../components/Image'

/**
 * 01 · À propos (captures 01-…-02 et 03-…-02).
 * Variation de ton, PAS d'inversion : la section n'utilise que les
 * variables --contrast-* (fond, texte, libellés, bordures).
 * Exceptions voulues par la maquette :
 *  - la citation : fond --accent, texte --on-accent ;
 *  - la 1re étiquette : fond --bg (ébène en sombre, papier en clair).
 * Animation au défilement : la photo se dévoile de bas en haut (clip-path),
 * le texte monte en fondu. Rien ne bouge si mouvement réduit.
 */
export default function About() {
  const { apropos } = contenu
  const mouvementReduit = useReducedMotion()
  const section = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (mouvementReduit) return
      const declencheur = { trigger: section.current, start: 'top 70%', once: true }

      gsap
        .timeline({ scrollTrigger: declencheur })
        // clip-path de bas en haut (valeurs de départ et d'arrivée explicites)
        .fromTo(
          '[data-photo]',
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.out' },
        )
        .from('[data-photo] img', { scale: 1.15, duration: 1.6, ease: 'expo.out' }, 0)
        .from('[data-citation]', { opacity: 0, y: 24, duration: 0.8, ease: 'power3.out' }, 0.7)
        .from(
          '[data-monte]',
          { opacity: 0, y: 40, duration: 0.9, stagger: 0.1, ease: 'power3.out' },
          0.15,
        )
    },
    { scope: section, dependencies: [mouvementReduit] },
  )

  return (
    <section
      ref={section}
      id="apropos"
      aria-labelledby="titre-apropos"
      className="bg-contrast-bg text-contrast-text"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-12 px-[22px] py-[72px] md:px-10 lg:flex-row lg:items-center lg:gap-[72px] lg:px-16 lg:py-[120px]">
        {/* Photo en arche + citation qui déborde */}
        <div className="relative mx-auto w-full min-w-0 max-w-[460px] lg:mx-0 lg:max-w-none lg:flex-[1_1_380px]">
          <div data-photo className="overflow-hidden rounded-[200px_200px_28px_28px]">
            <Image
              src="/images/portrait-apropos.jpg"
              sizes="(min-width: 1024px) 560px, (min-width: 768px) 460px, calc(100vw - 44px)"
              alt="Binetou Gueye en pied, tenue à motifs floraux"
              width={880}
              height={1100}
              loading="lazy"
              decoding="async"
              className="block aspect-[4/5] w-full object-cover object-[50%_15%]"
            />
          </div>
          <p
            data-citation
            className="absolute bottom-6 right-3 m-0 max-w-[284px] rounded-[18px] bg-accent px-[22px] py-4 font-display text-lg leading-[1.35] text-on-accent italic md:text-xl lg:-right-[18px] lg:bottom-10"
          >
            {apropos.citation}
          </p>
        </div>

        {/* Texte */}
        <div className="flex min-w-0 flex-col gap-6 lg:flex-[1_1_520px]">
          <div data-monte>
            <SectionHeading
              id="titre-apropos"
              numero={apropos.numero}
              titre={apropos.titre}
              ton="contrast"
              espace="gap-6"
            />
          </div>

          {apropos.paragraphes.map((paragraphe) => (
            <p
              key={paragraphe.slice(0, 24)}
              data-monte
              className="m-0 text-base leading-[1.7] text-contrast-text-soft md:text-lg"
            >
              {paragraphe}
            </p>
          ))}

          <ul data-monte className="m-0 flex list-none flex-wrap gap-3 p-0 pt-2">
            {apropos.etiquettes.map((etiquette, i) => (
              <li
                key={etiquette}
                className={[
                  'rounded-pill text-[14px] font-medium leading-tight text-contrast-text',
                  i === 0
                    ? 'bg-bg px-4 py-2.5'
                    : 'border border-contrast-card-border px-[15px] py-[9px]',
                ].join(' ')}
              >
                {etiquette}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

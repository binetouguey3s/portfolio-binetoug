import { useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import Button from '../components/Button'
import Chip from '../components/Chip'
import CvMenu from '../components/CvMenu'
import { fichierCv, LANGUE_CV, libelleTelechargementCv } from '../lib/cv'
import Halo from '../components/Halo'
import Rings from '../components/Rings'
import { useEstMobile } from '../hooks/useMediaQuery'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { contenu } from '../lib/content'
import { gsap, SplitText, useGSAP } from '../lib/gsap'
import { surFinIntro } from '../lib/intro'

/**
 * Positions des étiquettes autour du portrait (valeurs de la maquette).
 * Desktop : 4 étiquettes (hero.etiquettesPortrait), « IA · RAG » en plein.
 * Mobile  : 2 étiquettes (hero.etiquettesPortraitMobile), la première en plein.
 */
const POSITIONS_DESKTOP = [
  { place: 'left-[2%] top-[22%]', plein: false },
  { place: 'right-0 top-[14%]', plein: true },
  { place: 'right-[2%] bottom-[20%]', plein: false },
  { place: 'left-[8%] bottom-[10%]', plein: false },
]
const POSITIONS_MOBILE = [
  { place: '-right-[14.5%] top-[9.7%]', plein: true },
  { place: '-left-[16%] bottom-[8.2%]', plein: false },
]

/**
 * Section Accueil (captures 01-…-01, 03-…-01, 05 et 06).
 * Sous 768 px : portrait en haut, textes courts, 2 étiquettes.
 * Animations (coupées si prefers-reduced-motion) : titre révélé mot par mot
 * après le préchargement, cernes qui tournent et suivent la souris,
 * étiquettes qui flottent, halo qui suit le curseur, boutons magnétiques.
 */
export default function Hero() {
  const { hero } = contenu
  const estMobile = useEstMobile()
  const mouvementReduit = useReducedMotion()
  const section = useRef<HTMLElement>(null)

  const titre = estMobile ? hero.titreMobile : hero.titre
  const etiquettes = estMobile ? hero.etiquettesPortraitMobile : hero.etiquettesPortrait
  const positions = estMobile ? POSITIONS_MOBILE : POSITIONS_DESKTOP

  useGSAP(
    () => {
      if (mouvementReduit) return

      // 1. Révélation après le préchargement
      const elementsTexte = gsap.utils.toArray<HTMLElement>('[data-apparait]')
      gsap.set(elementsTexte, { autoAlpha: 0, y: 24 })
      const portrait = section.current?.querySelector<HTMLElement>('[data-portrait]') ?? null
      const titreEl = section.current?.querySelector<HTMLElement>('[data-titre]') ?? null
      gsap.set([portrait, titreEl], { autoAlpha: 0 })
      gsap.set(portrait, { scale: 0.92 })

      let decoupe: SplitText | null = null
      const arreter = surFinIntro(() => {
        if (!titreEl || !portrait) return
        decoupe = SplitText.create(titreEl, { type: 'words', mask: 'words' })
        gsap.set(titreEl, { autoAlpha: 1 })

        gsap
          .timeline({ defaults: { ease: 'power4.out' } })
          .from(decoupe.words, { yPercent: 110, duration: 1, stagger: 0.07 })
          .to(portrait, { autoAlpha: 1, scale: 1, duration: 1.2, ease: 'expo.out' }, 0.1)
          .to(elementsTexte, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08 }, 0.25)
          // Le découpage est retiré à la fin : le titre redevient un texte simple
          .call(() => {
            decoupe?.revert()
            decoupe = null
          })
      })

      // 2. Cernes : rotation lente et continue (arc dans un sens, pointillés dans l'autre)
      const svg = section.current?.querySelector<SVGSVGElement>('[data-centre]')
      const centre = svg?.dataset.centre ?? '0 0'
      gsap.to('[data-cerne="arc"]', { rotation: 360, svgOrigin: centre, duration: 60, ease: 'none', repeat: -1 })
      gsap.to('[data-cerne="pointilles"]', {
        rotation: -360,
        svgOrigin: centre,
        duration: 90,
        ease: 'none',
        repeat: -1,
      })

      // 3. Étiquettes qui flottent doucement, chacune à son rythme
      gsap.utils.toArray<HTMLElement>('[data-flotte]').forEach((el, i) => {
        gsap.to(el, {
          y: i % 2 ? 8 : -8,
          duration: 2.6 + i * 0.4,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: i * 0.3,
        })
      })

      // 4. Souris (desktop) : cernes en parallaxe légère, halo qui suit le curseur
      const mm = gsap.matchMedia()
      mm.add('(hover: hover) and (pointer: fine)', () => {
        const cernesX = gsap.quickTo('[data-parallaxe]', 'x', { duration: 1, ease: 'power3.out' })
        const cernesY = gsap.quickTo('[data-parallaxe]', 'y', { duration: 1, ease: 'power3.out' })
        const haloX = gsap.quickTo('[data-halo-curseur]', 'x', { duration: 0.9, ease: 'power3.out' })
        const haloY = gsap.quickTo('[data-halo-curseur]', 'y', { duration: 0.9, ease: 'power3.out' })
        let haloVisible = false

        const surMouvement = (e: PointerEvent) => {
          const zone = section.current?.getBoundingClientRect()
          if (!zone) return
          if (!haloVisible) {
            haloVisible = true
            gsap.set('[data-halo-curseur]', { x: e.clientX - zone.left, y: e.clientY - zone.top })
            gsap.to('[data-halo-curseur]', { autoAlpha: 1, duration: 0.6 })
          }
          const nx = (e.clientX - zone.left) / zone.width - 0.5
          const ny = (e.clientY - zone.top) / zone.height - 0.5
          cernesX(nx * 24)
          cernesY(ny * 24)
          haloX(e.clientX - zone.left)
          haloY(e.clientY - zone.top)
        }
        section.current?.addEventListener('pointermove', surMouvement)
        return () => section.current?.removeEventListener('pointermove', surMouvement)
      })

      return () => {
        arreter()
        decoupe?.revert()
        mm.revert()
      }
    },
    { scope: section, dependencies: [mouvementReduit, estMobile], revertOnUpdate: true },
  )

  return (
    <section
      ref={section}
      id="accueil"
      aria-labelledby="titre-accueil"
      className="relative overflow-x-clip pt-[76px] md:pt-28 xl:pt-[132px]"
    >
      {/* Halo qui suit le curseur (desktop uniquement, invisible tant que la souris n'a pas bougé) */}
      <div data-halo-curseur className="pointer-events-none invisible absolute left-0 top-0 hidden opacity-0 lg:block">
        <Halo taille={420} teinte={2} flou={40} className="-left-[210px] -top-[210px]" />
      </div>

      <div className="relative mx-auto flex max-w-[1280px] flex-col gap-1.5 px-[22px] md:gap-12 md:px-10 lg:flex-row lg:items-center lg:px-16 lg:pb-24">
        {/* Texte */}
        <div className="relative z-[2] flex min-w-0 flex-col gap-3.5 md:gap-7 lg:flex-[1_1_520px]">
          <p
            data-apparait
            className="m-0 flex items-center gap-3 font-mono text-[11px] tracking-[2px] text-accent md:text-[13px] md:whitespace-nowrap lg:text-[12px] lg:tracking-[1.5px] xl:text-[13px] xl:tracking-[2px]"
          >
            <span aria-hidden="true" className="hidden h-px w-9 bg-accent md:block" />
            {estMobile ? hero.surtitreMobile : hero.surtitre}
          </p>

          <h1
            key={estMobile ? 'mobile' : 'desktop'}
            id="titre-accueil"
            data-titre
            className="m-0 font-display text-[40px] leading-[1.02] font-normal tracking-[-1px] text-text md:text-[length:var(--fs-hero)] md:leading-[0.98] md:tracking-[-2.5px]"
          >
            {titre.avant} <em className="font-light text-accent">{titre.italique}</em> {titre.apres}
          </h1>

          <p
            data-apparait
            className="m-0 max-w-[560px] text-[15px] leading-[1.6] text-text-muted md:text-[19px] md:leading-[1.65]"
          >
            {estMobile ? hero.texteMobile : hero.texte}
          </p>

          {/* z-10 : le menu des CV doit passer au-dessus des puces CV en dessous */}
          <div data-apparait className="relative z-10 flex flex-col gap-2.5 pt-1 md:flex-row md:flex-wrap md:items-center md:gap-3.5 md:pt-0">
            <Button href={hero.ctaPrincipal.ancre} size="lg" magnetic className="max-md:py-[15px]">
              {hero.ctaPrincipal.label}
              <ArrowRight aria-hidden="true" size={18} strokeWidth={2} className="hidden md:block" />
            </Button>
            <CvMenu
              label={hero.ctaSecondaire}
              variant={estMobile ? 'glass' : 'secondary'}
              size={estMobile ? 'md' : 'lg'}
              chevron={!estMobile}
              magnetic
            />
          </div>

          {/* Puces CV (desktop) : téléchargement direct, dans la langue du navigateur */}
          <ul data-apparait className="m-0 hidden list-none flex-wrap gap-2.5 p-0 md:flex">
            {contenu.identite.cv.map((cv) => (
              <li key={cv.fichier}>
                <a
                  href={fichierCv(cv, LANGUE_CV)}
                  download
                  target="_blank"
                  rel="noopener"
                  aria-label={libelleTelechargementCv(cv, LANGUE_CV)}
                  className="block rounded-pill no-underline"
                >
                  <Chip variant="mono" className="transition-colors duration-200 hover:border-accent">
                    {cv.label}
                  </Chip>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Portrait */}
        <div
          data-portrait
          className="relative z-[1] order-first flex min-w-0 justify-center lg:order-none lg:flex-[1_1_440px]"
        >
          <div className="relative aspect-square w-[268px] md:w-[min(100%,440px)] lg:w-full lg:max-w-[540px]">
            {estMobile ? (
              <>
                <Halo taille={460} className="left-1/2 top-1/2 -translate-1/2" />
                <Halo taille={220} teinte={2} className="-right-[90px] -top-[34px]" />
              </>
            ) : (
              <>
                <Halo taille={600} className="left-1/2 top-1/2 -translate-1/2" />
                <Halo taille={300} teinte={2} className="-right-[120px] -top-[60px]" />
              </>
            )}

            <div data-parallaxe className="absolute inset-0">
              <Rings variant={estMobile ? 'portraitMobile' : 'portrait'} />
            </div>

            <img
              src="/images/portrait-accueil.jpg"
              alt="Portrait de Binetou Gueye"
              width={900}
              height={900}
              fetchPriority="high"
              decoding="async"
              className="absolute left-1/2 top-1/2 aspect-square w-[62.7%] -translate-1/2 rounded-full border-2 border-glow object-cover object-[50%_20%] md:w-[53.7%]"
            />

            {etiquettes.map((texte, i) => {
              const position = positions[i] ?? positions[0]
              return (
                <span key={texte} data-flotte className={`absolute ${position.place}`}>
                  <Chip
                    variant={position.plein ? 'accent' : 'glass'}
                    size="md"
                    className="max-md:px-[11px] max-md:py-[7px] max-md:text-[11px]"
                  >
                    {texte}
                  </Chip>
                </span>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

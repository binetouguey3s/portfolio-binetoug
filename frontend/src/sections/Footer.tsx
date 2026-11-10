import { useRef } from 'react'
import { ArrowUp } from 'lucide-react'
import Button from '../components/Button'
import CvLiens from '../components/CvLiens'
import Glass from '../components/Glass'
import Halo from '../components/Halo'
import Logo from '../components/Logo'
import { useChat } from '../hooks/useChat'
import { contenu } from '../lib/content'
import { useLangueCv } from '../hooks/useLangueCv'
import { gsap, useGSAP } from '../lib/gsap'
import { LIEN_EXTERNE } from '../lib/liens'

/** Icônes des réseaux (tracés de la maquette ; lucide-react n'a plus les logos de marque) */
function IconeReseau({ icone }: { icone: string }) {
  const commun = {
    'aria-hidden': true,
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'stroke-accent',
  }
  if (icone === 'github')
    return (
      <svg {...commun}>
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    )
  if (icone === 'linkedin')
    return (
      <svg {...commun}>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    )
  return (
    <svg {...commun}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

/** Adresse d'un réseau : réutilise les valeurs de identite (un seul endroit à modifier) */
function adresseReseau(source: string): string {
  const { identite } = contenu
  if (source === 'identite.github') return identite.github
  if (source === 'identite.linkedin') return identite.linkedin
  if (source === 'mailto:identite.email') return `mailto:${identite.email}`
  return '#'
}

/**
 * Footer (captures 02-…-04 et 04-…-04) : appel à l'action en verre, grille de
 * 4 colonnes (marque, navigation, réseaux, CV), barre de bas de page et
 * signature géante en dégradé qui monte quand on arrive en bas.
 */
export default function Footer() {
  const langue = useLangueCv()
  const { footer, identite } = contenu
  const { ouvrirPanneau } = useChat()
  const pied = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '[data-signature]',
          { yPercent: 55, autoAlpha: 0.2 },
          {
            yPercent: 0,
            autoAlpha: 1,
            ease: 'none',
            scrollTrigger: { trigger: pied.current, start: 'center bottom', end: 'bottom bottom', scrub: 1 },
          },
        )
      })
      return () => mm.revert()
    },
    { scope: pied },
  )

  const titreColonne = 'm-0 mb-1.5 font-mono text-[12px] font-normal tracking-[2.5px] text-accent'

  return (
    <footer ref={pied} className="relative overflow-hidden bg-bg">
      <Halo
        taille={900}
        flou={30}
        className="left-1/2 top-[60px] -translate-x-1/2"
        style={{ height: 360, background: 'radial-gradient(ellipse, var(--halo-1) 0%, transparent 70%)' }}
      />

      <div className="relative mx-auto flex max-w-[1280px] flex-col gap-14 px-[22px] pt-16 md:px-10 lg:gap-[72px] lg:px-16 lg:pt-24">
        {/* Appel à l'action en verre */}
        <Glass
          rounded="panel"
          className="flex flex-wrap items-center justify-between gap-7 px-6 py-8 md:px-11 md:py-10"
        >
          <div className="flex flex-col gap-2">
            <p className="m-0 font-mono text-[12px] tracking-[2.5px] text-accent">{footer.cta.surtitre}</p>
            <p className="m-0 font-display text-[34px] leading-[1.05] font-normal tracking-[-1px] text-text md:text-[46px]">
              {footer.cta.titre.avant} <em className="font-light text-accent">{footer.cta.titre.italique}</em>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href={`mailto:${identite.email}`} size="lg" magnetic>
              {footer.cta.bouton1}
            </Button>
            <Button variant="glass" size="lg" aria-haspopup="dialog" onClick={ouvrirPanneau}>
              {footer.cta.bouton2}
            </Button>
          </div>
        </Glass>

        {/* Grille 4 colonnes */}
        <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1.15fr_1.15fr]">
          <div className="flex flex-col gap-[22px]">
            <Logo alt="Binetou Gueye" className="h-auto w-[260px] md:w-[300px]" />
            <p className="m-0 max-w-[360px] text-[15px] leading-[1.7] text-text/80">{footer.presentation}</p>
            <p className="glass glass-sans-ombre m-0 flex items-center gap-2.5 self-start rounded-pill px-4 py-2.5 text-[14px] text-text">
              <span
                aria-hidden="true"
                className="block size-[9px] rounded-full bg-accent ring-4 ring-accent/25"
              />
              {identite.disponibilite}
            </p>
          </div>

          <nav aria-label="Pied de page" className="flex flex-col gap-3.5">
            <h2 className={titreColonne}>{footer.colonnes.navigation}</h2>
            {footer.navigation.map((lien) => (
              <a
                key={lien.ancre}
                href={lien.ancre}
                className="self-start text-[15px] text-text/85 no-underline transition-colors hover:text-accent"
              >
                {lien.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-3.5">
            <h2 className={titreColonne}>{footer.colonnes.reseaux}</h2>
            {footer.reseaux.map((reseau) => {
              const externe = reseau.icone !== 'mail'
              return (
                <a
                  key={reseau.label}
                  href={adresseReseau(reseau.source)}
                  {...(externe ? LIEN_EXTERNE : {})}
                  className="flex items-center gap-3 self-start text-[15px] text-text no-underline transition-colors hover:text-accent"
                >
                  <span className="glass glass-sans-ombre flex size-[38px] shrink-0 items-center justify-center rounded-full">
                    <IconeReseau icone={reseau.icone} />
                  </span>
                  {reseau.label}
                  {externe ? <span className="sr-only"> (nouvel onglet)</span> : null}
                </a>
              )
            })}
          </div>

          {/* @container : les cartes CV s'empilent si la colonne est trop étroite pour le libellé et les pastilles */}
          <div className="@container flex flex-col gap-3">
            <h2 className={titreColonne}>{footer.colonnes.cv}</h2>
            {identite.cv.map((cv) => (
              <div
                key={cv.fichier}
                className="glass glass-sans-ombre flex flex-col items-start gap-2 rounded-[14px] py-[9px] pl-3.5 pr-[7px] text-[15px] text-text @[270px]:flex-row @[270px]:items-center @[270px]:justify-between @[270px]:gap-3 @[270px]:py-[7px]"
              >
                <span className="whitespace-nowrap">{cv.label}</span>
                <CvLiens cv={cv} />
              </div>
            ))}
            {langue === 'en' ? (
              <p lang="en" className="m-0 font-mono text-[11px] tracking-[1px] text-text-muted">
                {identite.cvSuggestionEN}
              </p>
            ) : null}
          </div>
        </div>

        {/* Barre de bas de page */}
        <div className="flex flex-wrap items-center justify-between gap-6 border-y border-surface py-[26px]">
          <p className="m-0 text-[14px] text-text/75">{footer.copyright}</p>
          <p className="m-0 font-mono text-[12px] tracking-[1px] text-accent">{footer.mention}</p>
          <a
            href="#accueil"
            className="group flex items-center gap-3 text-[14px] text-text no-underline transition-colors hover:text-accent"
          >
            {footer.retourHaut}
            <span className="flex size-11 items-center justify-center rounded-full bg-accent text-on-accent transition-transform group-hover:-translate-y-0.5 motion-reduce:transition-none">
              <ArrowUp aria-hidden="true" size={18} strokeWidth={2} />
            </span>
          </a>
        </div>
      </div>

      {/* Signature géante en dégradé (décorative) */}
      <p
        aria-hidden="true"
        data-signature
        className="relative m-0 mb-[-0.19em] mt-[22px] whitespace-nowrap bg-[linear-gradient(180deg,var(--border)_0%,var(--surface)_45%,transparent_92%)] bg-clip-text text-center font-display text-[clamp(64px,15vw,214px)] leading-none font-normal tracking-[-0.037em] text-transparent"
      >
        {footer.signature.avant} <em className="font-light">{footer.signature.italique}</em>
      </p>
    </footer>
  )
}

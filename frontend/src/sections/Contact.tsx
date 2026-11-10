import { useId, useRef, useState, type FocusEvent, type FormEvent } from 'react'
import { LoaderCircle } from 'lucide-react'
import Glass from '../components/Glass'
import Halo from '../components/Halo'
import SectionHeading from '../components/SectionHeading'
import { envoyerMessageContact, LIMITES_CONTACT } from '../lib/contact-service'
import { contenu } from '../lib/content'
import { gsap, useGSAP } from '../lib/gsap'
import { LIEN_EXTERNE } from '../lib/liens'

type Etat = 'repos' | 'envoi' | 'succes' | 'erreur'
type Champ = 'nom' | 'email' | 'message'
type Erreurs = Partial<Record<Champ, string>>

const ORDRE_CHAMPS: Champ[] = ['nom', 'email', 'message']
const MOTIF_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Message d'erreur d'un champ (textes de contact.formulaire.erreurs), ou undefined s'il est valide. */
function verifier(champ: Champ, brut: string): string | undefined {
  const e = contenu.contact.formulaire.erreurs
  const valeur = brut.trim()
  if (champ === 'nom') {
    if (!valeur) return e.nomRequis
    if (valeur.length < 2) return e.nomCourt
  }
  if (champ === 'email') {
    if (!valeur) return e.emailRequis
    if (!MOTIF_EMAIL.test(valeur)) return e.emailInvalide
  }
  if (champ === 'message') {
    if (!valeur) return e.messageRequis
    if (valeur.length < LIMITES_CONTACT.messageMin) return e.messageCourt
  }
  return undefined
}

/** Rend l'adresse email cliquable (mailto) à l'intérieur d'un texte de contenu.json. */
function avecLienEmail(texte: string, email: string) {
  const morceaux = texte.split(email)
  if (morceaux.length === 1) return texte
  return morceaux.flatMap((morceau, i) =>
    i === 0
      ? [morceau]
      : [
          <a
            key={i}
            href={`mailto:${email}`}
            className="font-medium text-current underline underline-offset-2"
          >
            {email}
          </a>,
          morceau,
        ],
  )
}

/**
 * 06 · Contact (captures 02-…-03 et 04-…-03).
 * Gauche : titre, email cliquable souligné, texte, boutons GitHub et LinkedIn.
 * Droite : formulaire en verre (nom, email, message).
 * - Validation côté client : à la sortie de chaque champ et à l'envoi, avec nos
 *   messages (contact.formulaire.erreurs) sous le champ, reliés par aria-describedby,
 *   et aria-invalid sur le champ. À l'envoi, le focus va sur le premier champ en erreur.
 *   Un champ déjà en erreur est revérifié pendant la saisie, pour effacer le message dès qu'il est corrigé.
 * - Anti-spam : champ piège invisible ; s'il est rempli, rien n'est envoyé.
 * - États : envoi (bouton occupé), succès, erreur (textes de contenu.json).
 */
export default function Contact() {
  const { contact, identite, footer } = contenu
  const f = contact.formulaire
  const [etat, setEtat] = useState<Etat>('repos')
  const [erreurs, setErreurs] = useState<Erreurs>({})
  const section = useRef<HTMLElement>(null)
  const ids = { nom: useId(), email: useId(), message: useId(), piege: useId() }
  const github = footer.reseaux.find((r) => r.icone === 'github')?.label ?? 'GitHub'
  const linkedin = footer.reseaux.find((r) => r.icone === 'linkedin')?.label ?? 'LinkedIn'

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-monte]', {
          autoAlpha: 0,
          y: 40,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: section.current, start: 'top 70%', once: true },
        })
      })
      return () => mm.revert()
    },
    { scope: section },
  )

  const soumettre = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formulaire = e.currentTarget
    if (etat === 'envoi') return
    const donnees = new FormData(formulaire)

    // Vérification de tous les champs ; focus sur le premier en erreur
    const nouvelles: Erreurs = {}
    for (const champ of ORDRE_CHAMPS) {
      const message = verifier(champ, String(donnees.get(champ) ?? ''))
      if (message) nouvelles[champ] = message
    }
    setErreurs(nouvelles)
    const premier = ORDRE_CHAMPS.find((champ) => nouvelles[champ])
    if (premier) {
      formulaire.querySelector<HTMLElement>(`[name="${premier}"]`)?.focus()
      return
    }

    // Champ piège rempli = robot : on affiche un succès sans rien envoyer
    if (String(donnees.get('site_web') ?? '').trim() !== '') {
      formulaire.reset()
      setEtat('succes')
      return
    }

    setEtat('envoi')
    try {
      await envoyerMessageContact({
        nom: String(donnees.get('nom')).trim(),
        email: String(donnees.get('email')).trim(),
        message: String(donnees.get('message')).trim(),
      })
      formulaire.reset()
      setEtat('succes')
    } catch {
      setEtat('erreur')
    }
  }

  // Vérification à la sortie du champ
  const surSortie = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // On lit le champ tout de suite : React ne garde pas e.currentTarget après l'événement
    const champ = e.currentTarget.name as Champ
    const message = verifier(champ, e.currentTarget.value)
    setErreurs((avant) => ({ ...avant, [champ]: message }))
  }
  // Un champ en erreur est revérifié pendant la saisie (le message disparaît dès que c'est corrigé)
  const surSaisie = (champ: Champ, valeur: string) => {
    if (erreurs[champ]) {
      const message = verifier(champ, valeur)
      setErreurs((avant) => ({ ...avant, [champ]: message }))
    }
  }

  const classesChamp =
    'w-full rounded-[14px] border border-glass-border bg-bg/50 px-4 py-3.5 text-[15px] text-text placeholder:text-text-muted transition-colors focus:border-accent aria-invalid:border-accent'
  const idErreur = (champ: Champ) => `${ids[champ]}-erreur`
  const proprietesErreur = (champ: Champ) => ({
    'aria-invalid': erreurs[champ] ? true : undefined,
    'aria-describedby': erreurs[champ] ? idErreur(champ) : undefined,
    onBlur: surSortie,
  })
  const messageErreur = (champ: Champ) =>
    erreurs[champ] ? (
      <p id={idErreur(champ)} className="m-0 text-[13px] leading-snug text-accent">
        {erreurs[champ]}
      </p>
    ) : null

  return (
    <section
      ref={section}
      id="contact"
      aria-labelledby="titre-contact"
      className="relative overflow-hidden bg-contact-bg"
    >
      <Halo taille={560} teinte={2} className="right-[8%] top-[120px]" />

      <div className="relative mx-auto flex max-w-[1280px] flex-col gap-12 px-[22px] pb-10 pt-[72px] md:px-10 lg:flex-row lg:gap-16 lg:px-16 lg:pt-[120px]">
        {/* Coordonnées */}
        <div data-monte className="flex min-w-0 flex-col gap-[26px] lg:flex-[1_1_460px]">
          <SectionHeading
            id="titre-contact"
            numero={contact.numero}
            titre={contact.titre}
            taille="grande"
            espace="gap-[26px]"
          />
          <a
            href={`mailto:${identite.email}`}
            className="self-start break-all font-display text-[22px] text-text underline decoration-glow underline-offset-8 transition-colors hover:text-accent md:text-[30px]"
          >
            {identite.email}
          </a>
          <p className="m-0 text-base leading-[1.7] text-text/85">{contact.texte}</p>
          <div className="flex flex-wrap gap-3">
            <a
              href={identite.github}
              {...LIEN_EXTERNE}
              className="rounded-pill border border-glow px-[18px] py-[11px] text-[15px] text-text no-underline transition-colors hover:border-accent hover:text-accent"
            >
              {github} ↗<span className="sr-only"> (nouvel onglet)</span>
            </a>
            <a
              href={identite.linkedin}
              {...LIEN_EXTERNE}
              className="rounded-pill border border-glow px-[18px] py-[11px] text-[15px] text-text no-underline transition-colors hover:border-accent hover:text-accent"
            >
              {linkedin} ↗<span className="sr-only"> (nouvel onglet)</span>
            </a>
          </div>
        </div>

        {/* Formulaire en verre */}
        <Glass
          as="form"
          rounded="card"
          data-monte
          noValidate
          onSubmit={soumettre}
          aria-busy={etat === 'envoi'}
          // Verre un peu plus couvrant que .glass (comme la maquette : 45 % en sombre, 60 % en clair) :
          // le halo derrière le formulaire ne fait plus passer les labels sous le contraste AA
          style={{ background: 'color-mix(in srgb, var(--bg) 60%, transparent)' }}
          className="relative flex min-w-0 flex-col gap-[18px] p-6 md:p-9 lg:flex-[1_1_420px]"
        >
          <div className="flex flex-col gap-2">
            <label htmlFor={ids.nom} className="text-[14px] text-accent">
              {f.nom.label}
            </label>
            <input
              id={ids.nom}
              name="nom"
              type="text"
              required
              maxLength={LIMITES_CONTACT.nomMax}
              autoComplete="name"
              placeholder={f.nom.placeholder}
              onChange={(e) => surSaisie('nom', e.target.value)}
              {...proprietesErreur('nom')}
              className={classesChamp}
            />
            {messageErreur('nom')}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor={ids.email} className="text-[14px] text-accent">
              {f.email.label}
            </label>
            <input
              id={ids.email}
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={f.email.placeholder}
              onChange={(e) => surSaisie('email', e.target.value)}
              {...proprietesErreur('email')}
              className={classesChamp}
            />
            {messageErreur('email')}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor={ids.message} className="text-[14px] text-accent">
              {f.message.label}
            </label>
            <textarea
              id={ids.message}
              name="message"
              rows={4}
              required
              maxLength={LIMITES_CONTACT.messageMax}
              placeholder={f.message.placeholder}
              onChange={(e) => surSaisie('message', e.target.value)}
              {...proprietesErreur('message')}
              className={`${classesChamp} resize-y`}
            />
            {messageErreur('message')}
          </div>

          {/* Champ piège anti-spam : invisible et hors du parcours clavier */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor={ids.piege}>Site web</label>
            <input id={ids.piege} name="site_web" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <button
            type="submit"
            disabled={etat === 'envoi'}
            className="inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-pill bg-accent p-4 text-base font-semibold text-on-accent transition-[filter] hover:brightness-110 disabled:cursor-wait disabled:opacity-80"
          >
            {etat === 'envoi' ? (
              <LoaderCircle
                aria-hidden="true"
                size={18}
                strokeWidth={2}
                className="animate-spin motion-reduce:animate-none"
              />
            ) : null}
            {f.bouton}
          </button>

          {/* Annonce du résultat (lue par les lecteurs d'écran) */}
          <div role="status" aria-live="polite" className="empty:hidden">
            {etat === 'succes' ? (
              <p className="m-0 rounded-[14px] border border-glass-border bg-surface/60 px-4 py-3 text-[15px] leading-[1.6] text-text">
                {f.succes}
              </p>
            ) : null}
            {etat === 'erreur' ? (
              <p className="m-0 rounded-[14px] border border-accent bg-surface/60 px-4 py-3 text-[15px] leading-[1.6] text-text">
                {avecLienEmail(f.erreur, identite.email)}
              </p>
            ) : null}
          </div>
        </Glass>
      </div>
    </section>
  )
}

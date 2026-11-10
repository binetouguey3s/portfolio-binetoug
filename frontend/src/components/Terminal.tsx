import { useMemo, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { urlApi } from '../lib/api'
import { gsap, useGSAP } from '../lib/gsap'
import type { ProfilApi, Terminal as DonneesTerminal } from '../types/content'

/** Un morceau de ligne coloré : clé et littéral true / nombre (--contrast-label), valeur (texte) */
type Morceau = { texte: string; type: 'cle' | 'valeur' | 'litteral' | 'ponctuation' }
type Ligne = Morceau[]

const COULEURS: Record<Morceau['type'], string> = {
  cle: 'text-contrast-label',
  valeur: 'text-contrast-text',
  litteral: 'text-contrast-label',
  ponctuation: 'text-contrast-text',
}

/** Commande affichée : VITE_API_URL + /api/profil/, ou « curl /api/profil » sans API configurée */
function construireCommande(terminal: DonneesTerminal): string {
  const base = urlApi()
  return base ? terminal.commande.replace('{VITE_API_URL}', base) : terminal.commandeSansApi
}

function valeurJson(v: unknown): Morceau[] {
  if (typeof v === 'boolean' || typeof v === 'number') return [{ texte: String(v), type: 'litteral' }]
  if (Array.isArray(v)) {
    const morceaux: Morceau[] = [{ texte: '[', type: 'ponctuation' }]
    v.forEach((x, i) => {
      morceaux.push(...valeurJson(x))
      if (i < v.length - 1) morceaux.push({ texte: ', ', type: 'ponctuation' })
    })
    morceaux.push({ texte: ']', type: 'ponctuation' })
    return morceaux
  }
  return [{ texte: JSON.stringify(v), type: 'valeur' }]
}

/**
 * Met le JSON en forme comme la maquette : 2 espaces d'indentation,
 * tableaux sur une ligne, valeurs de « stack » alignées.
 */
function mettreEnForme(objet: Record<string, unknown>, retrait = 2): Ligne[] {
  const lignes: Ligne[] = []
  const cles = Object.keys(objet)
  const aligner = cles.every((c) => Array.isArray(objet[c]))
  const largeur = Math.max(...cles.map((c) => c.length))
  cles.forEach((cle, i) => {
    const v = objet[cle]
    const fin: Morceau[] = i < cles.length - 1 ? [{ texte: ',', type: 'ponctuation' }] : []
    const debut: Morceau[] = [
      { texte: ' '.repeat(retrait), type: 'ponctuation' },
      { texte: JSON.stringify(cle), type: 'cle' },
      { texte: ': ' + (aligner ? ' '.repeat(largeur - cle.length) : ''), type: 'ponctuation' },
    ]
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      lignes.push([...debut, { texte: '{', type: 'ponctuation' }])
      lignes.push(...mettreEnForme(v as Record<string, unknown>, retrait + 2))
      lignes.push([{ texte: ' '.repeat(retrait) + '}', type: 'ponctuation' }, ...fin])
    } else {
      lignes.push([...debut, ...valeurJson(v), ...fin])
    }
  })
  return lignes
}

type TerminalProps = {
  donnees: DonneesTerminal
  /** Réponse JSON affichée : GET /api/profil/, ou profilApi de contenu.json si l'API ne répond pas */
  profil: ProfilApi
}

/**
 * Fenêtre de terminal (captures 02-…-01/02 et 04-…-01/02).
 * À l'apparition : la commande se tape, puis la réponse JSON s'affiche
 * ligne par ligne, avec un curseur qui clignote. Tout est affiché
 * directement si mouvement réduit. Couleurs : variables --contrast-*,
 * fond --bg, invite, « $ » et true en --contrast-label
 * (le cuivre de la maquette n'atteignait pas le contraste AA en petit texte).
 */
export default function Terminal({ donnees, profil }: TerminalProps) {
  const fenetre = useRef<HTMLDivElement>(null)
  const mouvementReduit = useReducedMotion()
  const commande = construireCommande(donnees)
  const lignes = useMemo<Ligne[]>(
    () => [
      [{ texte: '{', type: 'ponctuation' }],
      ...mettreEnForme(profil as unknown as Record<string, unknown>),
      [{ texte: '}', type: 'ponctuation' }],
    ],
    [profil],
  )

  useGSAP(
    () => {
      if (mouvementReduit) return
      const frappe = fenetre.current?.querySelector<HTMLElement>('[data-frappe]')
      const lignesEl = gsap.utils.toArray<HTMLElement>('[data-ligne]')
      if (!frappe) return

      const etat = { n: 0 }
      frappe.textContent = ''
      gsap.set(lignesEl, { opacity: 0 })
      gsap
        .timeline({ scrollTrigger: { trigger: fenetre.current, start: 'top 75%', once: true } })
        .to(etat, {
          n: commande.length,
          duration: commande.length * 0.035,
          ease: 'none',
          onUpdate: () => {
            frappe.textContent = commande.slice(0, Math.round(etat.n))
          },
        })
        .to(lignesEl, { opacity: 1, duration: 0.01, stagger: 0.09 }, '+=0.35')
    },
    { scope: fenetre, dependencies: [mouvementReduit, commande] },
  )

  return (
    <div ref={fenetre} className="flex min-w-0 flex-col overflow-hidden rounded-card bg-bg">
      <div className="flex items-center gap-2 border-b border-contrast-border px-5 py-4">
        <span aria-hidden="true" className="block size-[11px] rounded-full bg-contrast-card-border" />
        <span aria-hidden="true" className="block size-[11px] rounded-full bg-glow" />
        <span aria-hidden="true" className="block size-[11px] rounded-full bg-contrast-label" />
        <p className="m-0 ml-3 font-mono text-[12px] text-contrast-label">{donnees.invite}</p>
      </div>
      <pre className="m-0 overflow-x-auto px-5 pb-[30px] pt-[26px] font-mono text-[12.5px] leading-[1.75] whitespace-pre-wrap text-contrast-text md:px-7 md:text-[14.5px]">
        <span aria-hidden="true" className="text-contrast-label">
          ${' '}
        </span>
        <span aria-hidden="true" data-frappe>
          {commande}
        </span>
        <span className="sr-only">{commande}</span>
        {'\n\n'}
        {lignes.map((ligne, i) => (
          <span key={i} data-ligne className="block">
            {ligne.map((m, j) => (
              <span key={j} className={COULEURS[m.type]}>
                {m.texte}
              </span>
            ))}
          </span>
        ))}
        <span data-ligne className="block">
          <span aria-hidden="true" className="text-contrast-label">
            ${' '}
          </span>
          <span aria-hidden="true" className="curseur inline-block h-[17px] w-[9px] bg-contrast-label align-text-bottom" />
        </span>
      </pre>
    </div>
  )
}

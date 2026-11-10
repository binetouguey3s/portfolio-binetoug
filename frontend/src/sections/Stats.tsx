import { useRef } from 'react'
import Glass from '../components/Glass'
import { useEstMobile } from '../hooks/useMediaQuery'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { contenu } from '../lib/content'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'

/**
 * Bande de chiffres en verre (captures 01-…-01, 03-…-01, 05 et 06).
 * Desktop : 4 colonnes (chiffres). Mobile : 3 colonnes (chiffresMobile)
 * séparées par des filets, puis « DÉFILER ↓ ».
 * À l'apparition, les nombres comptent de 0 à leur valeur ;
 * « Certifiée » (texte) apparaît en fondu. Rien ne bouge si mouvement réduit.
 * Les valeurs viennent toutes de contenu.json : aucun chiffre ajouté.
 */
export default function Stats() {
  const { chiffres, chiffresMobile, hero } = contenu
  const estMobile = useEstMobile()
  const mouvementReduit = useReducedMotion()
  const section = useRef<HTMLElement>(null)
  const liste = estMobile ? chiffresMobile : chiffres

  useGSAP(
    () => {
      if (mouvementReduit) return
      const valeurs = gsap.utils.toArray<HTMLElement>('[data-valeur]')

      valeurs.forEach((el) => {
        const cible = Number(el.dataset.valeur)
        if (Number.isFinite(cible)) {
          // Nombre : compteur de 0 à la valeur
          const compteur = { n: 0 }
          el.textContent = '0'
          gsap.to(compteur, {
            n: cible,
            duration: 1.6,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = String(Math.round(compteur.n))
            },
            scrollTrigger: { trigger: section.current, start: 'top 95%', once: true },
          })
        } else {
          // Texte (« Certifiée ») : fondu
          gsap.from(el, {
            autoAlpha: 0,
            y: 12,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: { trigger: section.current, start: 'top 95%', once: true },
          })
        }
      })
      ScrollTrigger.refresh()
    },
    { scope: section, dependencies: [mouvementReduit, estMobile], revertOnUpdate: true },
  )

  return (
    <section
      ref={section}
      className="relative px-[22px] pt-5 md:px-10 md:pt-0 md:pb-10 lg:px-16"
    >
      <Glass
        rounded="none"
        ombre={false}
        className="mx-auto grid max-w-[1152px] grid-cols-3 rounded-[22px] px-1.5 py-3.5 md:flex md:flex-wrap md:justify-between md:gap-8 md:rounded-panel md:px-11 md:py-9"
      >
        {liste.map((chiffre, i) => (
          <div
            key={chiffre.libelle}
            className={[
              'flex flex-col items-center gap-0.5 text-center md:flex-[1_1_200px] md:items-start md:gap-1.5 md:text-left',
              estMobile && i === 1 ? 'border-x border-glass-border' : '',
            ].join(' ')}
          >
            <p className="m-0 font-display text-[22px] leading-none text-accent md:text-[56px]">
              {/* Le nombre animé est caché aux lecteurs d'écran, qui lisent la valeur finale */}
              <span aria-hidden="true" data-valeur={chiffre.valeur}>
                {chiffre.valeur}
              </span>
              <span className="sr-only">{chiffre.valeur}</span>
            </p>
            <p className="m-0 text-[11px] text-text/80 md:text-[15px]">{chiffre.libelle}</p>
          </div>
        ))}
      </Glass>

      {/* Mobile uniquement (capture 05) */}
      <p className="m-0 mt-[18px] text-center md:hidden">
        <a href="#apropos" className="font-mono text-[11px] tracking-[2px] text-accent no-underline">
          {hero.defiler}
        </a>
      </p>
    </section>
  )
}

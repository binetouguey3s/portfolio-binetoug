import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { X } from 'lucide-react'
import Glass from '../components/Glass'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import { useChat } from '../hooks/useChat'
import { useScrollNavbar } from '../hooks/useScrollNavbar'
import { contenu } from '../lib/content'
import { bloquerDefilement } from '../lib/lenis'

/** Id du conteneur du reste de la page, rendu inerte quand le menu mobile est ouvert */
export const ID_CONTENU = 'contenu'

/**
 * Menu flottant (captures 01-…-01, 03-…-01 et 05).
 * - Desktop (≥ 1280 px) : pilule en verre avec logo, liens, ThemeToggle, bouton IA.
 * - Mobile et tablette : pilule avec logo, ThemeToggle, bouton menu
 *   qui ouvre un menu plein écran en verre (liens en Fraunces).
 * - Au défilement : compact, caché en descendant, visible en remontant.
 */
export default function Navbar() {
  const { navigation, boutonIA } = contenu
  const { compact, cache } = useScrollNavbar()
  const { ouvrirPanneau } = useChat()
  const [menuOuvert, setMenuOuvert] = useState(false)
  const [focusDedans, setFocusDedans] = useState(false)
  const idMenu = useId()
  const boutonMenu = useRef<HTMLButtonElement>(null)
  const premierLien = useRef<HTMLAnchorElement>(null)

  const fermerMenu = useCallback((rendreFocus = true) => {
    setMenuOuvert(false)
    if (rendreFocus) boutonMenu.current?.focus()
  }, [])

  // Menu ouvert : page bloquée et inerte (focus piégé dans le menu), Échap pour fermer
  useEffect(() => {
    if (!menuOuvert) return
    const reste = document.getElementById(ID_CONTENU)
    if (reste) reste.inert = true
    bloquerDefilement(true)
    premierLien.current?.focus()

    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fermerMenu()
    }
    document.addEventListener('keydown', surTouche)
    return () => {
      if (reste) reste.inert = false
      bloquerDefilement(false)
      document.removeEventListener('keydown', surTouche)
    }
  }, [menuOuvert, fermerMenu])

  // Le menu reste visible s'il est ouvert ou si le focus clavier est dedans
  const visible = !cache || menuOuvert || focusDedans

  return (
    <>
      <header
        onFocus={() => setFocusDedans(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setFocusDedans(false)
        }}
        className={[
          'fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-out-soft motion-reduce:transition-none',
          visible ? (compact ? '-translate-y-2' : 'translate-y-0') : '-translate-y-[130%]',
        ].join(' ')}
      >
        <div className="relative z-10 mx-auto max-w-[1312px] px-3.5 pt-3.5 md:px-8 xl:px-12 xl:pt-[22px]">
          <Glass
            rounded="pill"
            className={[
              'flex items-center justify-between gap-6 transition-[padding] duration-300 ease-out-soft motion-reduce:transition-none',
              'py-[7px] pl-4 pr-[7px]',
              compact ? 'xl:py-2 xl:pl-6 xl:pr-2.5' : 'xl:py-3 xl:pl-[26px] xl:pr-3.5',
            ].join(' ')}
          >
            <a href="#accueil" className="block shrink-0 leading-none" onClick={() => fermerMenu(false)}>
              <Logo alt="Binetou Gueye — accueil" className="h-[34px] w-auto xl:h-[46px]" />
            </a>

            {/* Desktop */}
            <nav aria-label="Navigation principale" className="hidden items-center gap-7 xl:flex">
              {navigation.map((lien) => (
                <a
                  key={lien.ancre}
                  href={lien.ancre}
                  className="text-[15px] text-text no-underline transition-colors duration-200 hover:text-accent"
                >
                  {lien.label}
                </a>
              ))}
              <ThemeToggle />
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={ouvrirPanneau}
                className="inline-flex cursor-pointer items-center gap-2.5 rounded-pill bg-accent px-5 py-3 text-[14px] font-semibold text-on-accent transition-[filter] duration-200 hover:brightness-110"
              >
                <span aria-hidden="true" className="block size-2 rounded-full bg-on-accent" />
                {boutonIA}
              </button>
            </nav>

            {/* Mobile et tablette */}
            <div className="flex items-center gap-1.5 xl:hidden">
              <ThemeToggle className="size-[42px]" />
              <button
                ref={boutonMenu}
                type="button"
                aria-label={menuOuvert ? 'Fermer le menu' : 'Ouvrir le menu'}
                aria-expanded={menuOuvert}
                aria-controls={idMenu}
                onClick={() => (menuOuvert ? fermerMenu() : setMenuOuvert(true))}
                className="inline-flex size-[42px] cursor-pointer items-center justify-center rounded-full bg-accent text-on-accent"
              >
                {menuOuvert ? (
                  <X aria-hidden="true" size={18} strokeWidth={2} />
                ) : (
                  <svg
                    aria-hidden="true"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M4 8h16M4 16h10" />
                  </svg>
                )}
              </button>
            </div>
          </Glass>
        </div>
      </header>

      {/* Menu plein écran (mobile et tablette), hors du header : un parent
          déplacé (translate) empêcherait le position: fixed de couvrir l'écran */}
      <Glass
        id={idMenu}
        rounded="none"
        ombre={false}
        hidden={!menuOuvert}
        className="fixed inset-0 z-40 h-dvh overflow-y-auto xl:hidden"
      >
        <nav
          aria-label="Navigation principale"
          className="flex min-h-full flex-col justify-center gap-10 px-[22px] pb-10 pt-28"
        >
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {navigation.map((lien, i) => (
              <li key={lien.ancre}>
                <a
                  ref={i === 0 ? premierLien : undefined}
                  href={lien.ancre}
                  onClick={() => fermerMenu(false)}
                  className="block py-1.5 font-display text-[40px] leading-[1.1] tracking-[-1px] text-text no-underline transition-colors duration-200 hover:text-accent"
                >
                  {lien.label}
                </a>
              </li>
            ))}
          </ul>
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => {
              fermerMenu(false)
              ouvrirPanneau()
            }}
            className="inline-flex cursor-pointer items-center justify-center gap-2.5 self-stretch rounded-pill bg-accent px-6 py-4 text-base font-semibold text-on-accent sm:self-start"
          >
            <span aria-hidden="true" className="block size-2 rounded-full bg-on-accent" />
            {boutonIA}
          </button>
        </nav>
      </Glass>
    </>
  )
}

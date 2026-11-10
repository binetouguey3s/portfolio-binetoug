import { useRef } from 'react'
import ChatWindow from '../components/ChatWindow'
import Glass from '../components/Glass'
import Halo from '../components/Halo'
import SectionHeading from '../components/SectionHeading'
import { useChat } from '../hooks/useChat'
import { useEstMobile } from '../hooks/useMediaQuery'
import { contenu } from '../lib/content'
import { gsap, useGSAP } from '../lib/gsap'

/**
 * 05 · Binetou IA (captures 02-…-02/03 et 04-…-02/03).
 * Gauche : titre, texte, 3 suggestions cliquables en verre.
 * Droite : fenêtre de chat en verre (même conversation que le panneau flottant).
 */
export default function Chatbot() {
  const { chatbot } = contenu
  const { envoyer, enAttente, enEcriture } = useChat()
  const estMobile = useEstMobile()
  const section = useRef<HTMLElement>(null)
  const suggestions = estMobile ? chatbot.suggestionsMobile : chatbot.suggestions
  const occupe = enAttente || enEcriture

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-monte]', {
          opacity: 0,
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

  return (
    <section ref={section} id="ia" aria-labelledby="titre-ia" className="relative overflow-hidden bg-bg">
      <Halo taille={640} className="right-10 top-1/2 -mt-80" />
      <Halo taille={360} teinte={2} className="-bottom-[120px] left-[30%]" />

      <div className="relative mx-auto flex max-w-[1280px] flex-col gap-10 px-[22px] py-[72px] md:px-10 lg:flex-row lg:items-center lg:gap-16 lg:px-16 lg:py-[120px]">
        <div data-monte className="flex min-w-0 flex-col gap-6 lg:flex-[1_1_420px]">
          <SectionHeading id="titre-ia" numero={chatbot.numero} titre={chatbot.titre} espace="gap-6" />
          <p className="m-0 text-base leading-[1.65] text-text-muted md:text-lg">{chatbot.texte}</p>
          <ul className="m-0 flex list-none flex-wrap gap-2.5 p-0">
            {suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  disabled={occupe}
                  onClick={() => envoyer(s)}
                  className="glass glass-sans-ombre cursor-pointer rounded-pill px-4 py-[11px] text-[14px] text-text transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <Glass rounded="panel" data-monte className="relative min-w-0 overflow-hidden lg:flex-[1_1_460px]">
          <ChatWindow variante="section" />
        </Glass>
      </div>
    </section>
  )
}

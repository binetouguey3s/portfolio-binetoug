import { Fragment, useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { ArrowRight, X } from 'lucide-react'
import ChatBubble from './ChatBubble'
import Logo from './Logo'
import { useChat } from '../hooks/useChat'
import { useEstMobile } from '../hooks/useMediaQuery'
import { LONGUEUR_MAX_QUESTION } from '../lib/chat-service'
import { contenu } from '../lib/content'

type ChatWindowProps = {
  /** section : fenêtre en verre de la section 05 · panneau : panneau latéral / plein écran */
  variante: 'section' | 'panneau'
  /** Bouton de fermeture (panneau uniquement) */
  surFermeture?: () => void
  className?: string
}

/**
 * Fenêtre de conversation Binetou IA : en-tête, messages, indicateur « … », champ de saisie.
 * Accessibilité : les messages sont dans une zone role="log" aria-live="polite",
 * marquée occupée (aria-busy) pendant l'écriture pour n'annoncer la réponse qu'une fois complète.
 */
export default function ChatWindow({ variante, surFermeture, className = '' }: ChatWindowProps) {
  const { chatbot } = contenu
  const { messages, enAttente, enEcriture, envoyer } = useChat()
  const estMobile = useEstMobile()
  const [question, setQuestion] = useState('')
  const idChamp = useId()
  const journal = useRef<HTMLDivElement>(null)
  const estPanneau = variante === 'panneau'
  const suggestions = estMobile ? chatbot.suggestionsMobile : chatbot.suggestions
  const occupe = enAttente || enEcriture

  // Le journal défile tout seul vers le dernier message
  const dernier = messages[messages.length - 1]
  useEffect(() => {
    const el = journal.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length, dernier?.affiche, enAttente])

  const soumettre = (e: FormEvent) => {
    e.preventDefault()
    if (occupe || !question.trim()) return
    envoyer(question)
    setQuestion('')
  }

  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      {/* En-tête */}
      <div
        className={[
          'flex shrink-0 items-center',
          estPanneau
            ? 'gap-3 border-b border-glass-border bg-glass-bg p-4 backdrop-blur-[20px] backdrop-saturate-[1.4]'
            : 'gap-3.5 border-b border-surface px-6 py-5',
        ].join(' ')}
      >
        {estPanneau && surFermeture ? (
          <button
            type="button"
            aria-label="Fermer"
            onClick={surFermeture}
            className="glass glass-sans-ombre inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-text"
          >
            <X aria-hidden="true" size={18} strokeWidth={2} />
          </button>
        ) : null}
        <Logo variant="icone" alt="" className={estPanneau ? 'size-10' : 'size-11'} />
        <div className="flex flex-col gap-0.5">
          <p className="m-0 text-base font-semibold">{chatbot.nom}</p>
          <p className="m-0 flex items-center gap-1.5 text-[12px] text-accent md:text-[13px]">
            {estPanneau ? (
              <span aria-hidden="true" className="block size-[7px] rounded-full bg-accent" />
            ) : null}
            {estMobile ? chatbot.statutCourt : chatbot.statut}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={journal}
        role="log"
        aria-live="polite"
        aria-busy={occupe}
        aria-label={`Conversation avec ${chatbot.nom}`}
        data-lenis-prevent
        className={[
          'flex flex-1 flex-col gap-3.5 overflow-y-auto overscroll-contain',
          estPanneau ? 'px-4 py-5' : 'max-h-[440px] min-h-[300px] p-6',
        ].join(' ')}
      >
        {messages.map((message, i) => (
          <Fragment key={message.id}>
            <ChatBubble message={message} />
            {/* Dans le panneau, les suggestions suivent le message d'accueil (captures 07 et 08) */}
            {estPanneau && i === 0 ? (
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                {suggestions.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      disabled={occupe}
                      onClick={() => envoyer(s)}
                      className="glass glass-sans-ombre cursor-pointer rounded-pill px-3.5 py-2.5 text-[14px] text-text disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </Fragment>
        ))}

        {enAttente ? (
          <p
            aria-hidden="true"
            className="m-0 flex gap-1.5 self-start rounded-[18px_18px_18px_4px] border border-glass-border bg-surface/70 px-[18px] py-4"
          >
            {[0, 1, 2].map((n) => (
              <span
                key={n}
                className="points-attente block size-1.5 rounded-full bg-accent"
                style={{ animationDelay: `${n * 160}ms` }}
              />
            ))}
          </p>
        ) : null}
      </div>

      {/* Saisie */}
      <form
        onSubmit={soumettre}
        className={[
          'flex shrink-0 items-center gap-2.5',
          estPanneau
            ? 'border-t border-glass-border bg-glass-bg px-3.5 pb-6 pt-3 backdrop-blur-[20px] backdrop-saturate-[1.4]'
            : 'border-t border-surface p-4',
        ].join(' ')}
      >
        <label htmlFor={idChamp} className="sr-only">
          Votre question
        </label>
        <input
          id={idChamp}
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={chatbot.placeholder}
          maxLength={LONGUEUR_MAX_QUESTION}
          autoComplete="off"
          className={[
            'min-w-0 flex-1 rounded-pill border px-[18px] py-3.5 text-[15px] text-text placeholder:text-text-muted',
            estPanneau ? 'border-glass-border bg-bg/50' : 'border-surface bg-bg',
          ].join(' ')}
        />
        <button
          type="submit"
          aria-label="Envoyer"
          disabled={occupe}
          className="inline-flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-accent text-on-accent transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowRight aria-hidden="true" size={20} strokeWidth={2} />
        </button>
      </form>
    </div>
  )
}

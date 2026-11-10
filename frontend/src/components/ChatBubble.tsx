import { resoudreActions } from '../lib/chat-actions'
import { LIEN_EXTERNE } from '../lib/liens'
import type { MessageChat } from '../lib/chat-contexte'

/**
 * Bulle de message (captures 02-…-02, 07 et 08).
 * Visiteuse : plein accent, à droite. Assistante : verre teinté, à gauche,
 * puis ses boutons d'action (contour) une fois la réponse entièrement écrite.
 */
export default function ChatBubble({ message }: { message: MessageChat }) {
  const estUtilisateur = message.role === 'utilisateur'
  const ecrit = message.affiche >= message.texte.length
  // Hors ligne aussi : les actions de secours (CV) restent proposées
  const actions = ecrit ? resoudreActions(message.actions) : []

  return (
    <>
      <p
        className={[
          'm-0 text-[15px] whitespace-pre-line',
          estUtilisateur
            ? 'max-w-[80%] self-end rounded-[18px_18px_4px_18px] bg-accent px-4 py-3 leading-normal text-on-accent'
            : 'max-w-[88%] self-start rounded-[18px_18px_18px_4px] border border-glass-border bg-surface/70 px-[17px] py-[13px] leading-[1.6] text-text backdrop-blur-[20px]',
        ].join(' ')}
      >
        {message.texte.slice(0, message.affiche)}
      </p>

      {actions.length > 0 ? (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {actions.map((action) => (
            <li key={action.id}>
              <a
                href={action.href}
                {...(action.externe ? LIEN_EXTERNE : {})}
                {...(action.telechargement ? { download: true } : {})}
                className="inline-block rounded-pill border border-border px-3 py-[7px] text-[13px] text-accent no-underline transition-colors duration-200 hover:border-accent"
              >
                {action.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  )
}

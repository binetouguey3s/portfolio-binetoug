import type { MouseEvent, ReactNode } from 'react'
import { useChat } from '../hooks/useChat'
import { resoudreActions } from '../lib/chat-actions'
import { contenu } from '../lib/content'
import { LIEN_EXTERNE, lienGmail } from '../lib/liens'
import { allerA } from '../lib/navigation'
import type { MessageChat } from '../lib/chat-contexte'

/** L'adresse email dans une réponse devient un lien qui ouvre Gmail (nouvel onglet) */
function avecEmailCliquable(texte: string): ReactNode {
  const email = contenu.identite.email
  const morceaux = texte.split(email)
  if (morceaux.length === 1) return texte
  return morceaux.flatMap((morceau, i) =>
    i === 0
      ? [morceau]
      : [
          <a key={i} href={lienGmail(email)} {...LIEN_EXTERNE} className="font-medium text-accent underline underline-offset-2">
            {email}
          </a>,
          morceau,
        ],
  )
}

/**
 * Bulle de message (captures 02-…-02, 07 et 08).
 * Visiteuse : plein accent, à droite. Assistante : verre teinté, à gauche,
 * puis ses boutons d'action (contour) une fois la réponse entièrement écrite.
 * Un bouton qui mène ailleurs sur la page (formulaire, projets, vidéo…) ferme d'abord
 * le panneau flottant du chat, puis y conduit.
 */
export default function ChatBubble({ message }: { message: MessageChat }) {
  const { panneauOuvert, fermerPanneau } = useChat()
  const estUtilisateur = message.role === 'utilisateur'
  const ecrit = message.affiche >= message.texte.length
  // Hors ligne aussi : les actions de secours (CV) restent proposées
  const actions = ecrit ? resoudreActions(message.actions) : []

  const versLaPage = (e: MouseEvent<HTMLAnchorElement>, ancre: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (panneauOuvert) {
      fermerPanneau()
      // Le temps que la fenêtre se ferme et que la page puisse de nouveau défiler
      window.setTimeout(() => allerA(ancre), 80)
    } else {
      allerA(ancre)
    }
  }

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
        {ecrit && !estUtilisateur ? avecEmailCliquable(message.texte) : message.texte.slice(0, message.affiche)}
      </p>

      {actions.length > 0 ? (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {actions.map((action) => (
            <li key={action.id}>
              <a
                href={action.href}
                {...(action.externe ? LIEN_EXTERNE : {})}
                {...(action.telechargement ? { download: true } : {})}
                {...(action.href.startsWith('#') ? { onClick: (e: MouseEvent<HTMLAnchorElement>) => versLaPage(e, action.href) } : {})}
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

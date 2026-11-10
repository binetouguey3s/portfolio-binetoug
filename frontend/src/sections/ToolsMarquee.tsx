import Marquee from '../components/Marquee'
import { contenu } from '../lib/content'

/**
 * Bandeaux d'outils (captures 02-…-03/04 et 04-…-03/04).
 * Fond moitié --contact-bg, moitié --bg ; deux rubans qui se croisent :
 * ruban 1 plein accent incliné de −3° (vers la gauche),
 * ruban 2 en verre incliné de +2,5° (vers la droite).
 * Les rubans sont décoratifs : une liste lisible est fournie aux lecteurs d'écran.
 */
export default function ToolsMarquee() {
  const { ruban1, ruban2 } = contenu.bandeaux
  const tous = [...ruban1, ...ruban2]

  return (
    <section
      aria-label="Technologies, outils et méthodes"
      className="relative h-[240px] overflow-hidden bg-[linear-gradient(180deg,var(--contact-bg)_48%,var(--bg)_48%)] md:h-[330px]"
    >
      {/* Version lisible (lecteurs d'écran) */}
      <ul className="sr-only">
        {tous.map((groupe) => (
          <li key={groupe.categorie}>
            {groupe.categorie} : {groupe.items.join(', ')}
          </li>
        ))}
      </ul>

      <Marquee
        groupes={ruban1}
        variante="plein"
        sens="gauche"
        className="absolute -left-[10%] top-9 w-[120%] -rotate-3 md:top-[52px]"
      />
      <Marquee
        groupes={ruban2}
        variante="verre"
        sens="droite"
        className="absolute -left-[10%] top-[140px] w-[120%] rotate-[2.5deg] md:top-[196px]"
      />
    </section>
  )
}

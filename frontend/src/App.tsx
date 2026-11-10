import { lazy, Suspense, useEffect, useState, useSyncExternalStore, type ComponentType } from 'react'
import ChatLauncher from './components/ChatLauncher'
import ChatProvider from './components/ChatProvider'
import Grain from './components/Grain'
import Preloader from './components/Preloader'
import { useLenis } from './hooks/useLenis'
import { ScrollTrigger } from './lib/gsap'
import { obtenirLenis } from './lib/lenis'
import Hero from './sections/Hero'
import Navbar, { ID_CONTENU } from './sections/Navbar'

const ChatPanel = lazy(() => import('./components/ChatPanel'))

/**
 * Sections sous la ligne de flottaison, dans l'ordre de la page : chargées à part pour
 * alléger le premier affichage. La dernière (le footer) est placée après <main>.
 */
function chargerSuite(): Promise<ComponentType[]> {
  return Promise.all([
    import('./sections/Stats'),
    import('./sections/About'),
    import('./sections/Skills'),
    import('./sections/Projects'),
    import('./sections/Method'),
    import('./sections/Chatbot'),
    import('./sections/Contact'),
    import('./sections/ToolsMarquee'),
    import('./sections/Footer'),
  ]).then((modules) => modules.map((m) => m.default))
}

/** Prochain moment calme du navigateur (ou une image plus tard s'il ne sait pas le dire) */
function quandCalme(rappel: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(rappel, { timeout: 200 })
    return () => window.cancelIdleCallback(id)
  }
  const id = window.setTimeout(rappel, 16)
  return () => window.clearTimeout(id)
}

const sansAbonnement = () => () => undefined

/** false pendant le pré-rendu et l'hydratation, true ensuite (dans le navigateur) */
function useDansLeNavigateur(): boolean {
  return useSyncExternalStore(
    sansAbonnement,
    () => true,
    () => false,
  )
}

/**
 * Page unique (ancres), dans l'ordre du cahier des charges :
 * accueil, chiffres, à propos, compétences, projets, méthode, Binetou IA,
 * contact, bandeaux d'outils, footer. Chaque section est dans src/sections/.
 *
 * Seuls le menu et l'accueil sont dans le premier fichier JavaScript.
 * Les autres sections arrivent juste après et s'affichent une par une, de haut en bas :
 * les animations au défilement (galerie épinglée…) sont créées dans l'ordre de la page.
 */
function App() {
  useLenis()
  const dansLeNavigateur = useDansLeNavigateur()
  const [suite, setSuite] = useState<ComponentType[]>([])
  // Nombre de sections différées déjà affichées : une de plus à chaque moment calme
  const [affichees, setAffichees] = useState(0)
  const complete = suite.length > 0 && affichees === suite.length

  useEffect(() => {
    let actif = true
    chargerSuite().then((s) => {
      if (actif) setSuite(s)
    })
    return () => {
      actif = false
    }
  }, [])

  // Une section par tâche, de haut en bas : pas de longue tâche qui bloque la page,
  // et les animations au défilement sont créées dans l'ordre de la page, comme avant
  useEffect(() => {
    if (suite.length === 0 || affichees >= suite.length) return
    return quandCalme(() => setAffichees((n) => n + 1))
  }, [suite, affichees])

  // Tout est affiché : positions des animations recalculées,
  // puis retour sur l'ancre demandée dans l'adresse (ex. /#contact)
  useEffect(() => {
    if (!complete) return
    const image = requestAnimationFrame(() => {
      ScrollTrigger.refresh()
      const cible = window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null
      if (!cible) return
      const lenis = obtenirLenis()
      if (lenis) {
        // Lenis garde la hauteur de la page de son démarrage (accueil seul) : on la lui fait remesurer
        lenis.resize()
        lenis.scrollTo(cible, { immediate: true })
      } else cible.scrollIntoView()
    })
    return () => cancelAnimationFrame(image)
  }, [complete])

  const sections = suite.slice(0, affichees)
  const Footer = affichees === suite.length ? sections.pop() : undefined

  return (
    <ChatProvider>
      <Preloader />
      <Grain />
      <Navbar />

      {/* Tout sauf le menu : rendu inerte quand le menu mobile est ouvert */}
      <div id={ID_CONTENU}>
        <main>
          <Hero />

          {/* Chiffres, à propos, compétences, projets, méthode, Binetou IA, contact, bandeaux d'outils */}
          {sections.map((Section, i) => (
            <Section key={i} />
          ))}
        </main>

        {Footer ? <Footer /> : null}

        {/* Bulle Binetou IA flottante (inerte avec le reste quand le menu mobile est ouvert) */}
        <ChatLauncher />
      </div>

      {/* Panneau Binetou IA (fenêtre modale), chargé à part, seulement dans le navigateur
          (le pré-rendu ne produit pas les composants chargés à part) */}
      {dansLeNavigateur ? (
        <Suspense fallback={null}>
          <ChatPanel />
        </Suspense>
      ) : null}
    </ChatProvider>
  )
}

export default App

import ChatLauncher from './components/ChatLauncher'
import ChatPanel from './components/ChatPanel'
import ChatProvider from './components/ChatProvider'
import Grain from './components/Grain'
import Preloader from './components/Preloader'
import { useLenis } from './hooks/useLenis'
import About from './sections/About'
import Chatbot from './sections/Chatbot'
import Contact from './sections/Contact'
import Footer from './sections/Footer'
import Hero from './sections/Hero'
import Method from './sections/Method'
import Navbar, { ID_CONTENU } from './sections/Navbar'
import Projects from './sections/Projects'
import Skills from './sections/Skills'
import Stats from './sections/Stats'
import ToolsMarquee from './sections/ToolsMarquee'

/**
 * Page unique (ancres), dans l'ordre du cahier des charges :
 * accueil, chiffres, à propos, compétences, projets, méthode, Binetou IA,
 * contact, bandeaux d'outils, footer. Chaque section est dans src/sections/.
 */
function App() {
  useLenis()

  return (
    <ChatProvider>
      <Preloader />
      <Grain />
      <Navbar />

      {/* Tout sauf le menu : rendu inerte quand le menu mobile est ouvert */}
      <div id={ID_CONTENU}>
        <main>
          <Hero />

          <Stats />
          <About />

          <Skills />

          <Projects />

          <Method />

          <Chatbot />

          <Contact />
          <ToolsMarquee />
        </main>

        <Footer />

        {/* Bulle Binetou IA flottante (inerte avec le reste quand le menu mobile est ouvert) */}
        <ChatLauncher />
      </div>

      {/* Panneau Binetou IA (fenêtre modale) */}
      <ChatPanel />
    </ChatProvider>
  )
}

export default App

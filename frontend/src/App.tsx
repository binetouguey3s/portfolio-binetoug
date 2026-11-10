import Grain from './components/Grain'
import Preloader from './components/Preloader'
import { useLenis } from './hooks/useLenis'
import About from './sections/About'
import Hero from './sections/Hero'
import Method from './sections/Method'
import Navbar, { ID_CONTENU } from './sections/Navbar'
import Projects from './sections/Projects'
import Skills from './sections/Skills'
import Stats from './sections/Stats'

/**
 * Squelette de la page (une seule page, ancres), dans l'ordre du cahier des charges.
 * Les sections sont encore vides : chacune sera remplacée par son composant
 * (src/sections/) aux étapes 4 à 11. La hauteur minimale (min-h-[80vh])
 * est temporaire, pour pouvoir tester le défilement et le menu.
 */
function App() {
  useLenis()

  return (
    <>
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

          {/* 05 · Binetou IA (étape 9) */}
          <section id="ia" className="min-h-[80vh] bg-bg" />

          {/* 06 · Contact (étape 10) */}
          <section id="contact" className="min-h-[80vh] bg-contact-bg" />

          {/* Bandeaux d'outils : moitié --contact-bg, moitié --bg (étape 11) */}
          <section aria-hidden="true" className="h-[330px] bg-[linear-gradient(180deg,var(--contact-bg)_48%,var(--bg)_48%)]" />
        </main>

        {/* Footer (étape 11) */}
        <footer className="min-h-[50vh] bg-bg" />
      </div>
    </>
  )
}

export default App

import { contenu } from './lib/content'

/**
 * Page temporaire de l'étape 1 : vérifie le fond ébène, les 3 polices
 * et la lecture de contenu.json. Remplacée par le squelette à l'étape 3.
 */
function App() {
  const { hero } = contenu

  return (
    <main className="mx-auto flex min-h-dvh max-w-[1280px] flex-col justify-center gap-6 px-[22px] md:px-16">
      <p className="font-mono text-[13px] tracking-[3px] text-accent">{hero.surtitre}</p>
      <h1 className="font-display text-[clamp(2.75rem,6vw,5.5rem)] leading-none tracking-[-2px] text-text">
        {hero.titre.avant} <em className="font-light text-accent">{hero.titre.italique}</em>{' '}
        {hero.titre.apres}
      </h1>
      <p className="max-w-[560px] text-[19px] leading-[1.65] text-text-muted">{hero.texte}</p>
    </main>
  )
}

export default App

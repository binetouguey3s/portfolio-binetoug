/**
 * PAGE TEMPORAIRE /demo (étape 2) — à supprimer à l'étape 12.
 * Affiche tous les composants de base dans les deux modes côte à côte :
 * chaque colonne porte son propre data-theme, les variables CSS suivent.
 * Le bouton en haut change le mode global (mémorisé dans localStorage).
 */
import Button from '../components/Button'
import Chip from '../components/Chip'
import Flower from '../components/Flower'
import Glass from '../components/Glass'
import Grain from '../components/Grain'
import Halo from '../components/Halo'
import Logo from '../components/Logo'
import Rings from '../components/Rings'
import SectionHeading from '../components/SectionHeading'
import ThemeToggle from '../components/ThemeToggle'
import { useTheme } from '../hooks/useTheme'
import { contenu } from '../lib/content'

function Titre({ children }: { children: string }) {
  return <p className="m-0 font-mono text-[13px] tracking-[3px] text-accent">{children}</p>
}

function Fleche() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function Colonne({ mode }: { mode: 'dark' | 'light' }) {
  const { hero, competences, apropos, projets, bandeaux } = contenu
  const fruits = competences.groupes[0]

  return (
    <div data-theme={mode} className="relative flex flex-col gap-12 overflow-hidden rounded-panel bg-bg p-10 text-text">
      <p className="m-0 font-display text-3xl">{mode === 'dark' ? 'Mode sombre' : 'Mode clair'}</p>

      {/* Logo */}
      <section className="flex flex-col gap-4">
        <Titre>LOGO</Titre>
        <div className="flex items-center gap-6">
          <Logo className="h-[46px] w-auto" />
          <Logo variant="icone" alt="" className="size-14" />
        </div>
      </section>

      {/* Boutons */}
      <section className="flex flex-col gap-4">
        <Titre>BOUTONS</Titre>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Bouton principal</Button>
          <Button variant="secondary">Bouton secondaire</Button>
          <Button variant="glass">Demander à Binetou IA</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button href={hero.ctaPrincipal.ancre} size="lg" magnetic>
            {hero.ctaPrincipal.label} <Fleche />
          </Button>
          <Button variant="secondary" size="lg" magnetic>
            {hero.ctaSecondaire}
          </Button>
          <ThemeToggle />
        </div>
      </section>

      {/* Puces */}
      <section className="flex flex-col gap-4">
        <Titre>PUCES</Titre>
        <div className="flex flex-wrap items-center gap-2">
          <Chip size="md">Django</Chip>
          <Chip variant="accent" size="md">IA · RAG</Chip>
          <Chip variant="mono">CV Général</Chip>
          <Chip variant="outline" font="body" size="md">{apropos.etiquettes[1]}</Chip>
          <Chip size="xs">Django 5</Chip>
        </div>
        <div className="flex flex-wrap gap-2">
          {fruits.items.map((item) => (
            <Chip
              key={item}
              font="body"
              variant={fruits.misEnAvant?.includes(item) ? 'accent' : 'surface'}
              className="text-[13px]"
            >
              {item}
            </Chip>
          ))}
        </div>
      </section>

      {/* Verre + halos */}
      <section className="flex flex-col gap-4">
        <Titre>VERRE DÉPOLI + HALOS</Titre>
        <div className="relative h-64 overflow-hidden rounded-card bg-bg-2">
          <Halo taille={320} className="-left-10 -top-16" />
          <Halo taille={260} teinte={2} className="-bottom-24 right-0" />
          <Glass className="absolute inset-x-10 top-12 flex flex-col gap-3 p-7">
            <p className="m-0 font-mono text-[12px] tracking-[2px] text-accent">{fruits.titre}</p>
            <div className="flex flex-wrap gap-2">
              <Chip variant="glass" size="md">Django · DRF</Chip>
              <Chip variant="glass" size="md">Flutter · PWA</Chip>
            </div>
          </Glass>
        </div>
      </section>

      {/* Cernes */}
      <section className="flex flex-col gap-4">
        <Titre>CERNES</Titre>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative aspect-square">
            <Halo taille={260} className="left-1/2 top-1/2 -translate-1/2" />
            <Rings />
            <img
              src="/images/portrait-accueil.jpg"
              alt="Portrait de Binetou Gueye"
              className="absolute left-1/2 top-1/2 aspect-square w-[53.7%] -translate-1/2 rounded-full border-2 border-glow object-cover object-[50%_20%]"
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="relative h-[105px] overflow-hidden rounded-[20px] bg-surface/60">
              <Rings variant="couverture" rotation={40} />
              <p className="absolute left-4 top-2 m-0 font-display text-3xl text-glow">{projets.galerie[1].num}</p>
            </div>
            <div className="relative h-[140px] overflow-hidden rounded-[20px] bg-surface">
              <Rings variant="angle" />
            </div>
          </div>
        </div>
      </section>

      {/* Fleur */}
      <section className="flex flex-col gap-4">
        <Titre>FLEUR (SÉPARATEUR DES BANDEAUX)</Titre>
        <div className="flex items-center gap-6 rounded-pill bg-accent px-6 py-4 font-display text-[28px] text-on-accent">
          <span>{bandeaux.ruban1[0].items[0]}</span>
          <Flower petales="fill-on-accent" coeur="fill-accent" />
          <span>{bandeaux.ruban1[0].items[1]}</span>
        </div>
        <div className="flex items-center gap-6 px-6 font-display text-[28px]">
          <span>{bandeaux.ruban2[1].items[0]}</span>
          <Flower />
          <span>{bandeaux.ruban2[1].items[1]}</span>
        </div>
      </section>

      {/* En-têtes de section */}
      <section className="flex flex-col gap-4">
        <Titre>EN-TÊTES DE SECTION</Titre>
        <SectionHeading numero={competences.numero} titre={competences.titre} />
        <div className="rounded-card bg-contrast-bg p-8 text-contrast-text">
          <SectionHeading numero={apropos.numero} titre={apropos.titre} ton="contrast" />
        </div>
      </section>
    </div>
  )
}

export default function Demo() {
  const { theme } = useTheme()

  return (
    <main className="mx-auto flex max-w-[1440px] flex-col gap-8 px-[22px] py-10 md:px-16">
      <Grain />
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="m-0 font-display text-4xl">Démo des composants</h1>
        <div className="flex items-center gap-3 text-[15px] text-text-muted">
          Mode global : {theme === 'dark' ? 'sombre' : 'clair'}
          <ThemeToggle />
        </div>
      </header>
      <div className="grid gap-8 lg:grid-cols-2">
        <Colonne mode="dark" />
        <Colonne mode="light" />
      </div>
    </main>
  )
}

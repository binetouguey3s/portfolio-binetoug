import { ArrowLeft } from 'lucide-react'
import Button from '../components/Button'
import Grain from '../components/Grain'
import Halo from '../components/Halo'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import { contenu } from '../lib/content'

/**
 * Page 404 (404.html) dans le style du site : logo, bouton de thème,
 * grand « 404 » en Fraunces, halos et bouton de retour à l'accueil.
 * Textes : page404 de contenu.json.
 */
export default function Page404() {
  const { page404 } = contenu

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-bg text-text">
      <Grain />
      <Halo taille={560} className="-right-[180px] -top-[120px]" />
      <Halo taille={420} teinte={2} className="-bottom-[180px] -left-[160px]" />

      <header className="relative mx-auto flex w-full max-w-[1280px] items-center justify-between px-[22px] py-6 md:px-10 lg:px-16">
        <a href="/" className="inline-flex rounded-[10px]">
          <Logo alt={`${contenu.identite.nom} — ${page404.bouton}`} className="h-[34px] w-auto xl:h-[46px]" />
        </a>
        <ThemeToggle />
      </header>

      <main className="relative mx-auto flex w-full max-w-[1280px] flex-1 flex-col items-start justify-center gap-6 px-[22px] pb-24 md:px-10 lg:px-16">
        <p
          aria-hidden="true"
          className="m-0 font-display text-[120px] leading-none font-light tracking-[-4px] text-glow italic md:text-[200px]"
        >
          {page404.numero}
        </p>
        <h1 className="m-0 font-display text-[38px] leading-[1.05] font-normal tracking-[-1px] md:text-[56px]">
          {page404.titre}
        </h1>
        <p className="m-0 max-w-[520px] text-[16px] leading-[1.65] text-text-muted md:text-[18px]">{page404.texte}</p>
        <Button href="/" size="lg">
          <ArrowLeft aria-hidden="true" size={18} strokeWidth={2} />
          {page404.bouton}
        </Button>
      </main>
    </div>
  )
}

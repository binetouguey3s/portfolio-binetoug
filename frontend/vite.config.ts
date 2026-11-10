import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { PORTRAIT_ACCUEIL, sourcesResponsives } from './src/lib/images'

// Dossier content/ à la racine du dépôt (source unique des textes)
const contentDir = fileURLToPath(new URL('../content', import.meta.url))

/** Image de partage (public/partage.jpg, générée par scripts/generer-image-partage.mjs) */
const IMAGE_PARTAGE = { chemin: '/partage.jpg', largeur: 1200, hauteur: 630 }

type Cv = { label: string; fichier: string; fichierEN: string }
type Contenu = {
  meta: { titre: string; description: string; langue: string; url: string }
  identite: {
    nom: string
    role: string
    ville: string
    email: string
    github: string
    linkedin: string
    disponibilite: string
    cv: Cv[]
  }
  competences: { groupes: { items: string[] }[] }
  profilApi: { langues: string[] }
  projets: {
    vedette: { nom: string; description: string; lienApplication: string }
    galerie: { nom: string; description: string; lien: { url: string } }[]
    autres: { nom: string; detail: string; url?: string }[]
  }
  page404: { titre: string; texte: string; bouton: string }
}

function lireContenu(): Contenu {
  return JSON.parse(readFileSync(`${contentDir}/contenu.json`, 'utf-8')) as Contenu
}

/** Même règle que le site : vide ou « A_COMPLETER… » = pas de lien. */
function lienValide(url: string | undefined): url is string {
  return Boolean(url && url.trim() && !url.startsWith('A_COMPLETER'))
}

/**
 * Adresse publique du site, sans « / » final :
 * 1. meta.url de contenu.json si elle est remplie ;
 * 2. sinon la variable SITE_URL ;
 * 3. sinon l'adresse de production fournie par Vercel au moment du build ;
 * 4. sinon null (balises en chemins relatifs, pas de sitemap.xml).
 */
function adresseDuSite(contenu: Contenu): string | null {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const candidates = [contenu.meta.url, process.env.SITE_URL, vercel ? `https://${vercel}` : undefined]
  const url = candidates.find((u) => lienValide(u) && /^https?:\/\//.test(u))
  return url ? url.replace(/\/+$/, '') : null
}

/** Échappe un texte pour l'insérer dans un attribut HTML. */
function echapperHtml(texte: string): string {
  return texte.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Balises <head> : partage (Open Graph, Twitter), adresse canonique, données structurées Person. */
function balisesSeo(c: Contenu, site: string | null): string {
  const absolu = (chemin: string) => (site ? `${site}${chemin}` : chemin)
  const image = absolu(IMAGE_PARTAGE.chemin)
  const altImage = `${c.identite.nom} — ${c.identite.role}`
  const meta = (attribut: 'property' | 'name', cle: string, valeur: string) =>
    `<meta ${attribut}="${cle}" content="${echapperHtml(valeur)}" />`

  const personne = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: c.identite.nom,
    jobTitle: c.identite.role,
    description: c.meta.description,
    ...(site ? { url: `${site}/`, image: absolu('/images/portrait-accueil.jpg') } : {}),
    email: `mailto:${c.identite.email}`,
    address: { '@type': 'PostalAddress', addressLocality: c.identite.ville, addressCountry: 'SN' },
    sameAs: [c.identite.github, c.identite.linkedin],
    knowsAbout: c.competences.groupes.flatMap((g) => g.items),
    knowsLanguage: c.profilApi.langues,
  }
  // « </ » interdit dans un <script> : on l'échappe dans le JSON
  const jsonLd = JSON.stringify(personne).replace(/<\//g, '<\\/')

  return [
    ...(site ? [`<link rel="canonical" href="${site}/" />`] : []),
    meta('property', 'og:type', 'website'),
    meta('property', 'og:site_name', c.identite.nom),
    meta('property', 'og:locale', 'fr_FR'),
    meta('property', 'og:title', c.meta.titre),
    meta('property', 'og:description', c.meta.description),
    ...(site ? [meta('property', 'og:url', `${site}/`)] : []),
    meta('property', 'og:image', image),
    meta('property', 'og:image:width', String(IMAGE_PARTAGE.largeur)),
    meta('property', 'og:image:height', String(IMAGE_PARTAGE.hauteur)),
    meta('property', 'og:image:alt', altImage),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:title', c.meta.titre),
    meta('name', 'twitter:description', c.meta.description),
    meta('name', 'twitter:image', image),
    meta('name', 'twitter:image:alt', altImage),
    `<script type="application/ld+json">${jsonLd}</script>`,
  ].join('\n    ')
}

/** Préchargement du portrait de l'accueil (AVIF, même srcset et sizes que le composant Image) */
function prechargementPortrait(): string {
  const sources = sourcesResponsives(PORTRAIT_ACCUEIL.src)
  if (!sources) return ''
  return (
    `<link rel="preload" as="image" type="image/avif" fetchpriority="high" ` +
    `imagesrcset="${sources.avif}" imagesizes="${PORTRAIT_ACCUEIL.sizes}" />`
  )
}

/** llms.txt : résumé du site pour les assistants IA (https://llmstxt.org), sans téléphone. */
function llmsTxt(c: Contenu, site: string | null): string {
  const absolu = (chemin: string) => (site ? `${site}${chemin}` : chemin)
  const lignes = [
    `# ${c.identite.nom}`,
    '',
    `> ${c.meta.description}`,
    '',
    `${c.identite.role} · ${c.identite.ville} · ${c.identite.disponibilite}`,
    '',
    '## Profil',
    `- [Portfolio](${absolu('/')}): accueil, compétences, projets, méthode, Binetou IA et contact`,
    `- [GitHub](${c.identite.github})`,
    `- [LinkedIn](${c.identite.linkedin})`,
    `- [Email](mailto:${c.identite.email})`,
    '',
    '## CV',
    ...c.identite.cv.flatMap((cv) => [
      `- [${cv.label} (français)](${absolu(cv.fichier)})`,
      `- [${cv.label} (English)](${absolu(cv.fichierEN)})`,
    ]),
    '',
    '## Projets',
    `- ${c.projets.vedette.nom}: ${c.projets.vedette.description}`,
    ...c.projets.galerie.map((p) =>
      lienValide(p.lien.url) ? `- [${p.nom}](${p.lien.url}): ${p.description}` : `- ${p.nom}: ${p.description}`,
    ),
    ...c.projets.autres.map((a) => (lienValide(a.url) ? `- [${a.nom}](${a.url}): ${a.detail}` : `- ${a.nom}: ${a.detail}`)),
  ]
  return `${lignes.join('\n')}\n`
}

/**
 * Textes et référencement depuis content/contenu.json :
 * - index.html : %TITRE%, %DESCRIPTION%, %LANGUE% et les balises de partage (<!--%SEO%-->) ;
 * - 404.html : %TITRE_404% et %LANGUE% (la page n'est pas indexée) ;
 * - au build : robots.txt, sitemap.xml (si l'adresse du site est connue) et llms.txt.
 */
function metaDepuisContenu(): Plugin {
  let site: string | null = null
  return {
    name: 'meta-depuis-contenu',
    buildStart() {
      site = adresseDuSite(lireContenu())
      if (!site) {
        this.warn(
          'Adresse du site inconnue (meta.url vaut A_COMPLETER, ni SITE_URL ni Vercel) : ' +
            'balises de partage en chemins relatifs et pas de sitemap.xml.',
        )
      }
    },
    transformIndexHtml(html) {
      const c = lireContenu()
      const adresse = adresseDuSite(c)
      return html
        .replace('%TITRE%', echapperHtml(c.meta.titre))
        .replace('%DESCRIPTION%', echapperHtml(c.meta.description))
        .replace('%TITRE_404%', echapperHtml(`${c.page404.titre} — ${c.identite.nom}`))
        .replace(/%LANGUE%/g, echapperHtml(c.meta.langue))
        .replace('<!--%SEO%-->', balisesSeo(c, adresse))
        .replace('<!--%PRECHARGEMENT%-->', prechargementPortrait())
    },
    generateBundle() {
      const c = lireContenu()
      const robots = ['User-agent: *', 'Allow: /', ...(site ? ['', `Sitemap: ${site}/sitemap.xml`] : [])]
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `${robots.join('\n')}\n` })
      this.emitFile({ type: 'asset', fileName: 'llms.txt', source: llmsTxt(c, site) })
      if (site) {
        const jour = new Date().toISOString().slice(0, 10)
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source:
            '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
            `  <url><loc>${site}/</loc><lastmod>${jour}</lastmod></url>\n` +
            '</urlset>\n',
        })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), metaDepuisContenu()],
  // Plusieurs pages (index + 404) : pas de renvoi automatique vers index.html pour une adresse inconnue
  appType: 'mpa',
  resolve: {
    alias: {
      '@content': contentDir,
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        404: fileURLToPath(new URL('./404.html', import.meta.url)),
      },
    },
  },
  server: {
    // Autorise Vite à lire content/, situé en dehors de frontend/
    fs: { allow: ['..'] },
  },
})

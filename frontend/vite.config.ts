import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Dossier content/ à la racine du dépôt (source unique des textes)
const contentDir = fileURLToPath(new URL('../content', import.meta.url))

/** Échappe un texte pour l'insérer dans un attribut HTML. */
function echapperHtml(texte: string): string {
  return texte
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Remplace %TITRE%, %DESCRIPTION% et %LANGUE% dans index.html
 * par les valeurs de meta dans content/contenu.json.
 */
function metaDepuisContenu(): Plugin {
  return {
    name: 'meta-depuis-contenu',
    transformIndexHtml(html) {
      const brut = readFileSync(`${contentDir}/contenu.json`, 'utf-8')
      const { meta } = JSON.parse(brut) as {
        meta: { titre: string; description: string; langue: string }
      }
      return html
        .replace('%TITRE%', echapperHtml(meta.titre))
        .replace('%DESCRIPTION%', echapperHtml(meta.description))
        .replace('%LANGUE%', echapperHtml(meta.langue))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), metaDepuisContenu()],
  resolve: {
    alias: {
      '@content': contentDir,
    },
  },
  server: {
    // Autorise Vite à lire content/, situé en dehors de frontend/
    fs: { allow: ['..'] },
  },
})

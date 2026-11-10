/**
 * Insère le HTML pré-rendu (src/entry-prerender.tsx, compilé dans dist-prerendu/) dans dist/index.html.
 * Lancé par « npm run build » après les deux compilations de Vite.
 */
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ici = (chemin) => fileURLToPath(new URL(chemin, import.meta.url))
const page = ici('../dist/index.html')
const entree = ici('../dist-prerendu/entry-prerender.js')

const { rendre } = await import(pathToFileURL(entree).href)
const html = readFileSync(page, 'utf-8')
const racineVide = '<div id="root"></div>'
if (!html.includes(racineVide)) throw new Error('dist/index.html : <div id="root"></div> introuvable')

writeFileSync(page, html.replace(racineVide, `<div id="root">${rendre()}</div>`))
rmSync(ici('../dist-prerendu'), { recursive: true, force: true })
console.log('Pré-rendu inséré dans dist/index.html')

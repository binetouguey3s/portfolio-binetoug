/**
 * Génère public/partage.jpg (1200 × 630), l'image affichée quand le site est partagé
 * (LinkedIn, WhatsApp, X…). Modèle : scripts/image-partage.html, textes : content/contenu.json.
 * À relancer si le titre, le portrait ou le logo changent :
 *
 *   node scripts/generer-image-partage.mjs        (depuis frontend/, sur macOS)
 *
 * Aucune dépendance : capture d'écran de Google Chrome en mode sans fenêtre
 * (chemin modifiable avec CHROME_PATH), puis conversion en JPEG avec sips (macOS).
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const ici = (chemin) => fileURLToPath(new URL(chemin, import.meta.url))
const contenu = JSON.parse(readFileSync(ici('../../content/contenu.json'), 'utf-8'))
const echapper = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const html = readFileSync(ici('./image-partage.html'), 'utf-8')
  .replace('{{SURTITRE}}', echapper(contenu.hero.surtitre))
  .replace('{{TITRE_AVANT}}', echapper(contenu.hero.titre.avant))
  .replace('{{TITRE_ITALIQUE}}', echapper(contenu.hero.titre.italique))
  .replace('{{TITRE_APRES}}', echapper(contenu.hero.titre.apres))
  .replace('{{DISPONIBILITE}}', echapper(contenu.identite.disponibilite))

// Fichier temporaire à côté du modèle : les chemins relatifs (tokens, polices, images) restent valables
const temporaire = ici('./.image-partage-rendu.html')
const capture = ici('./.image-partage.png')
writeFileSync(temporaire, html)

const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
try {
  execFileSync(chrome, [
    '--headless=new',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--window-size=1200,630',
    '--virtual-time-budget=4000', // laisse le temps aux polices et images de charger
    '--allow-file-access-from-files',
    `--screenshot=${capture}`,
    `file://${temporaire}`,
  ], { stdio: 'ignore' })
  execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '88', capture, '--out', ici('../public/partage.jpg')], {
    stdio: 'ignore',
  })
  console.log('public/partage.jpg générée (1200 × 630)')
} finally {
  rmSync(temporaire, { force: true })
  rmSync(capture, { force: true })
}

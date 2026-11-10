/**
 * Images responsives générées par scripts/optimiser-images.sh (WebP + AVIF).
 * Clé : chemin de l'original (celui écrit dans le code ou dans contenu.json).
 * Les largeurs doivent correspondre à celles du script.
 */
export const IMAGES_RESPONSIVES: Record<string, readonly number[]> = {
  '/images/portrait-accueil.jpg': [360, 540, 720],
  '/images/portrait-apropos.jpg': [400, 600, 880],
  '/images/projets/sensuivi-logo-sombre.png': [150, 300, 450],
  '/images/projets/sensuivi-logo-clair.png': [150, 300, 450],
}

/** Portrait de l'accueil : image principale de la page, annoncée dès le HTML (vite.config.ts) */
export const PORTRAIT_ACCUEIL = {
  src: '/images/portrait-accueil.jpg',
  sizes: '(min-width: 1024px) 290px, (min-width: 768px) 240px, 170px',
}

export type SourcesImage = { avif: string; webp: string; defaut: string }

/** srcset AVIF et WebP d'une image, ou null si elle n'a pas de versions responsives. */
export function sourcesResponsives(original: string): SourcesImage | null {
  const largeurs = IMAGES_RESPONSIVES[original]
  if (!largeurs) return null
  const base = original.replace(/\.[a-z]+$/i, '')
  const srcset = (format: string) => largeurs.map((l) => `${base}-${l}.${format} ${l}w`).join(', ')
  // Image par défaut (navigateurs sans srcset) : la largeur du milieu
  const milieu = largeurs[Math.floor(largeurs.length / 2)]
  return { avif: srcset('avif'), webp: srcset('webp'), defaut: `${base}-${milieu}.webp` }
}

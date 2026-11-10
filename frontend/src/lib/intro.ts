/**
 * Signal « le préchargement est terminé ».
 * Le Preloader l'émet à la fin de son animation ; l'accueil (Hero)
 * l'attend pour lancer la révélation du titre.
 */
let fini = false
const abonnes = new Set<() => void>()

export function signalerFinIntro(): void {
  if (fini) return
  fini = true
  abonnes.forEach((rappel) => rappel())
  abonnes.clear()
}

/** Appelle « rappel » dès que l'intro est finie (tout de suite si c'est déjà le cas). */
export function surFinIntro(rappel: () => void): () => void {
  if (fini) {
    rappel()
    return () => undefined
  }
  abonnes.add(rappel)
  return () => abonnes.delete(rappel)
}

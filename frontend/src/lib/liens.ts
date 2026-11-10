/**
 * Un lien n'est affiché que s'il est renseigné dans contenu.json :
 * vide ou « A_COMPLETER… » = bouton masqué.
 */
export function lienValide(url: string | undefined | null): url is string {
  return Boolean(url && url.trim() !== '' && !url.startsWith('A_COMPLETER'))
}

/** Attributs d'un lien externe : nouvel onglet, sans accès à la page d'origine. */
export const LIEN_EXTERNE = { target: '_blank', rel: 'noopener noreferrer' } as const

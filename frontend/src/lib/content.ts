/**
 * Accès au contenu du site.
 * Le JSON est importé au moment du build depuis content/contenu.json
 * (alias @content défini dans vite.config.ts).
 * L'annotation « : Contenu » fait vérifier par TypeScript que le fichier
 * correspond bien aux types de src/types/content.ts.
 */
import data from '@content/contenu.json'
import type { Contenu } from '../types/content'

export const contenu: Contenu = data

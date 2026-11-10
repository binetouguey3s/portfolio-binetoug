/**
 * CV en français et en anglais (identite.cv : fichier et fichierEN).
 * Langue proposée en premier : celle du navigateur (français si elle commence par « fr », sinon anglais).
 */
import { contenu } from './content'
import type { Cv, LangueCv } from '../types/content'

/** Langue du navigateur : « fr » si elle commence par fr, sinon « en ». */
export function langueNavigateur(): LangueCv {
  return typeof navigator !== 'undefined' && !(navigator.language ?? '').toLowerCase().startsWith('fr') ? 'en' : 'fr'
}

/** Ordre d'affichage des pastilles : la langue donnée d'abord. */
export function ordreLanguesCv(langue: LangueCv): readonly LangueCv[] {
  return langue === 'fr' ? ['fr', 'en'] : ['en', 'fr']
}

export function fichierCv(cv: Cv, langue: LangueCv): string {
  return langue === 'en' ? cv.fichierEN : cv.fichier
}

/** aria-label explicite, ex. « Télécharger le CV Front-End en anglais » */
export function libelleTelechargementCv(cv: Cv, langue: LangueCv): string {
  return contenu.identite.cvTelecharger[langue].replace('{cv}', cv.label)
}

/** Identifiants d'actions du chatbot proposés quand l'API est hors ligne : le CV Général dans les deux langues. */
export function actionsCvHorsLigne(): string[] {
  return ordreLanguesCv(langueNavigateur()).map((l) => (l === 'en' ? 'cv-general-en' : 'cv-general'))
}

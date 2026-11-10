/**
 * Types du fichier content/contenu.json (source unique des textes).
 * Si tu ajoutes une clé dans le JSON, ajoute-la ici : TypeScript signalera
 * alors toute différence entre le fichier et ces types (voir src/lib/content.ts).
 *
 * Règle d'affichage : les versions courtes (clés …Mobile, statutCourt)
 * s'utilisent sous 768 px, les versions longues au-dessus.
 */

/** Titre en trois morceaux : la partie « italique » prend la couleur d'accent. */
export interface TitreItalique {
  avant: string
  italique: string
  apres?: string
}

export interface LienAncre {
  label: string
  /** Ancre interne, ex. « #projets » */
  ancre: string
}

export interface Lien {
  label: string
  /** Lien vide = bouton masqué */
  url: string
}

export interface Cv {
  label: string
  /** Chemin dans public/, ex. « /cv/CV_Binetou_Gueye_General.pdf » */
  fichier: string
}

export interface Meta {
  titre: string
  description: string
  langue: string
  url: string
}

export interface Identite {
  nom: string
  role: string
  ville: string
  email: string
  /** Le numéro n'est jamais dans ce fichier (il serait lisible dans le code du site) : voir base-connaissances-chatbot.md */
  telephone_affiche: boolean
  github: string
  linkedin: string
  disponibilite: string
  cv: Cv[]
}

export interface Hero {
  surtitre: string
  surtitreMobile: string
  titre: TitreItalique
  titreMobile: TitreItalique
  texte: string
  texteMobile: string
  ctaPrincipal: LienAncre
  ctaSecondaire: string
  etiquettesPortrait: string[]
  etiquettesPortraitMobile: string[]
  defiler: string
}

export interface Chiffre {
  valeur: string
  libelle: string
}

export interface APropos {
  numero: string
  titre: TitreItalique
  paragraphes: string[]
  citation: string
  etiquettes: string[]
}

export type PartieArbre = 'fruits' | 'branches' | 'tronc' | 'racines'

export interface GroupeCompetences {
  /** Une des valeurs de PartieArbre (le JSON importé est typé en string) */
  partie: string
  titre: string
  items: string[]
  misEnAvant?: string[]
}

export interface Competences {
  numero: string
  titre: TitreItalique
  texte: string
  groupes: GroupeCompetences[]
}

export interface ProjetVedette {
  badge: string
  nom: string
  description: string
  role: string
  stack: string[]
  devise: string
  piliers: string
  logo: { sombre: string; clair: string }
  lienApplication: string
  /** Vidéo horizontale 16:9 (écrans larges) */
  video: string
  /** Vidéo verticale 9:16 (téléphone tenu à la verticale) */
  videoMobile: string
  videoAffiche: string
  videoAfficheMobile: string
  /** Texte des boutons de la carte vedette (maquette) */
  boutonApplication: string
  boutonVideo: string
}

export interface ProjetGalerie {
  num: string
  nom: string
  meta: string
  domaine: string
  description: string
  stack: string[]
  lien: Lien
}

export interface AutreRealisation {
  nom: string
  detail: string
  /** Si présent : ligne cliquable (nouvel onglet, petite flèche ↗) */
  url?: string
}

export interface Projets {
  numero: string
  titre: TitreItalique
  indication: string
  _noteLiens: string
  vedette: ProjetVedette
  galerie: ProjetGalerie[]
  autresTitre: string
  autres: AutreRealisation[]
}

export interface EtapeMethode {
  num: string
  nom: string
  titre: string
  texte: string
  tags: string[]
  misEnAvant?: boolean
}

export interface Terminal {
  invite: string
  /** Contient « {VITE_API_URL} », remplacé à l'affichage */
  commande: string
  /** Affichée si VITE_API_URL est absente */
  commandeSansApi: string
  noteCommande: string
  note: string
}

export interface Engagement {
  num: string
  titre: string
  texte: string
}

export interface Methode {
  numero: string
  titre: TitreItalique
  texte: string
  etapes: EtapeMethode[]
  terminal: Terminal
  engagementsTitre: string
  engagements: Engagement[]
}

export interface ProfilApi {
  nom: string
  role: string
  base: string
  stack: { back: string[]; front: string[]; ia: string[] }
  certification: string
  langues: string[]
  disponible: boolean
}

/** Identifiants fixes des boutons d'action du chatbot */
export type ActionChatId =
  | 'voir-sen-suivi'
  | 'voir-ande-setal'
  | 'voir-yees-naa'
  | 'voir-agrimeteo'
  | 'voir-vision'
  | 'voir-senagrolink'
  | 'voir-afristory'
  | 'cv-general'
  | 'cv-front'
  | 'cv-back'
  | 'ecrire-email'
  | 'voir-projets'
  | 'voir-contact'

export interface ActionChat {
  id: string
  label: string
  /** Chemin vers une autre clé du JSON, ancre (#…) ou « mailto:identite.email » */
  cible: string
  /** Cible de repli si la cible principale est vide ou A_COMPLETER */
  repli?: string
}

export interface Chatbot {
  numero: string
  titre: TitreItalique
  texte: string
  nom: string
  statut: string
  statutCourt: string
  accueil: string
  suggestions: string[]
  suggestionsMobile: string[]
  placeholder: string
  horsLigne: string
  _noteActions: string
  actions: ActionChat[]
}

export interface ChampFormulaire {
  label: string
  placeholder: string
}

export interface Contact {
  numero: string
  titre: TitreItalique
  texte: string
  formulaire: {
    nom: ChampFormulaire
    email: ChampFormulaire
    message: ChampFormulaire
    bouton: string
    succes: string
    erreur: string
    /** Messages de validation, affichés sous chaque champ */
    erreurs: {
      nomRequis: string
      nomCourt: string
      emailRequis: string
      emailInvalide: string
      messageRequis: string
      messageCourt: string
    }
  }
}

export interface GroupeBandeau {
  categorie: string
  items: string[]
}

export interface Bandeaux {
  ruban1: GroupeBandeau[]
  ruban2: GroupeBandeau[]
}

export type IconeReseau = 'github' | 'linkedin' | 'mail'

export interface ReseauFooter {
  label: string
  /** Clé de identite (ex. « identite.github ») ou « mailto:identite.email » */
  source: string
  icone: string
}

export interface Footer {
  cta: {
    surtitre: string
    titre: TitreItalique
    bouton1: string
    bouton2: string
  }
  presentation: string
  colonnes: { navigation: string; reseaux: string; cv: string }
  navigation: LienAncre[]
  reseaux: ReseauFooter[]
  copyright: string
  mention: string
  retourHaut: string
  signature: TitreItalique
}

export interface Contenu {
  _note: string
  _affichageMobile: string
  meta: Meta
  identite: Identite
  navigation: LienAncre[]
  boutonIA: string
  hero: Hero
  chiffres: Chiffre[]
  chiffresMobile: Chiffre[]
  apropos: APropos
  competences: Competences
  projets: Projets
  methode: Methode
  profilApi: ProfilApi
  chatbot: Chatbot
  contact: Contact
  bandeaux: Bandeaux
  footer: Footer
}

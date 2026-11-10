# 01 — Cahier des charges

**Objectif** : un portfolio professionnel qui donne envie à un recruteur ou à un client de travailler avec Binetou. Concept **« Racines & Code »** : le site raconte un arbre qui pousse au fil du défilement.

Captures de référence : `design/maquette-captures/`. Textes : `content/contenu.json`.

## Structure de la page (une seule page, ancres)

| # | Section (id) | Fond sombre / clair | Capture |
|---|---|---|---|
| — | Menu flottant | verre | 01-…-01 |
| — | Accueil (`#accueil`) | `--bg` | 01-…-01 |
| — | Chiffres | panneau en verre | 01-…-01/02 |
| 01 | À propos (`#apropos`) | `--contrast-bg` (variation de ton, pas d'inversion) | 01-…-02 |
| 02 | Compétences (`#arbre`) | `--bg` | 01-…-02/03 |
| 03 | Projets (`#projets`) | `--bg-2` | 01-…-03/04/05 |
| 04 | Ma méthode (`#methode`) | `--contrast-bg` | 02-…-01/02 |
| 05 | Binetou IA (`#ia`) | `--bg` | 02-…-02/03 |
| 06 | Contact (`#contact`) | `--contact-bg` | 02-…-03 |
| — | Bandeaux d'outils | moitié `--contact-bg` / moitié `--bg` | 02-…-03/04 |
| — | Footer | `--bg` | 02-…-04 |
| — | Bulle Binetou IA flottante | caramel, en bas à droite, sur toute la page | mobile 05/06 |

## Détail par section

### Menu
- Pilule en verre flottante (sticky, 22 px du haut), logo à gauche (version sombre ou claire selon le mode).
- Liens : À propos, Compétences, Projets, Méthode, Contact. Bouton rond lune/soleil (bascule du mode). Bouton plein « Demander à Binetou IA » (ouvre le chatbot).
- Au défilement : le menu se compacte légèrement (padding réduit). Il se cache en descendant et réapparaît en remontant.
- Mobile : logo + lune/soleil + bouton menu ; menu plein écran en verre avec les liens en Fraunces.

### Accueil
- Gauche : surtitre mono, grand titre Fraunces avec « pousser » en italique accent, texte, boutons « Voir mes projets » (plein) et « Télécharger mon CV » (contour, ouvre un petit menu avec les 3 CV), puis 3 puces CV.
- Droite : portrait rond (`assets/photos/portrait-accueil.jpg`) entouré de cernes (SVG), un arc accent avec un point, 4 étiquettes en verre (Django · DRF, IA · RAG en plein, Angular · React, Flutter · PWA), halos cuivrés derrière.
- **Animations** : préchargement court (le logo se dessine : l'anneau du G en stroke-dashoffset, puis la fleur éclot), titre révélé mot par mot (SplitText), cernes qui tournent lentement et réagissent à la souris (parallaxe légère), étiquettes qui flottent, halo qui suit le curseur, boutons magnétiques.

### Chiffres
- Panneau en verre à 4 colonnes : Certifiée · 10 · 1 · 3 (voir `chiffres`). Les nombres comptent de 0 à leur valeur à l'apparition (« Certifiée » apparaît en fondu).

### 01 · À propos
- Photo en arche (`portrait-apropos.jpg`, coins haut arrondis à 200 px) avec citation en bulle sombre qui déborde à droite.
- Titre, 2 paragraphes, étiquettes (la première en plein).
- **Animation** : la photo se dévoile de bas en haut (clip-path), le texte monte en fondu.

### 02 · Compétences — l'arbre
- 3 colonnes : à gauche les cartes « Fruits · IA » et « Branches · Front & Mobile », au centre l'arbre, à droite « Tronc · Méthode » et « Racines · Back-end ». Cartes en verre, puces `--surface` (LLM et RAG en plein accent).
- Arbre : `assets/illustrations/arbre-competences.svg` (sombre) et `arbre-competences-clair.svg` (clair). Le convertir en composant React (`TreeOfSkills.tsx`), avec des groupes nommés (racines, tronc, branches, feuillage, lucioles, soleil) pour l'animer.
- **Animation (ScrollTrigger, scrub)** : le tronc pousse de bas en haut, les racines se dessinent (stroke-dashoffset), puis les branches, puis le feuillage apparaît par vagues, les lucioles scintillent en boucle. Survoler une carte met en lumière la partie correspondante de l'arbre.
- Mobile : arbre en haut, cartes empilées dessous.

### 03 · Projets
- **Carte vedette Sen Suivi** : moitié gauche texte (badge, nom, description validée, rôle, stack, boutons « Voir l'application ↗ » et « Vidéo de présentation ▶ »), moitié droite fond `--surface` avec cernes, logo Sen Suivi monochrome (sombre/clair), devise, piliers. La vidéo s'ouvre dans une fenêtre modale (lecteur HTML5, sous-titres si possible).
- **Galerie de 7 cartes en verre** : couverture (numéro + cernes + domaine, en attendant les vraies captures), méta, nom, description, stack, lien.
- **Animation** : sur desktop, section épinglée et défilement horizontal de la galerie (ScrollTrigger pin + scrub), légère inclinaison 3D des cartes au survol. Sur mobile : carrousel horizontal au doigt (scroll-snap).
- **Autres réalisations** : grille de 3 colonnes de lignes (nom à gauche, détail mono à droite).

### 04 · Ma méthode
- 4 étapes reliées par une ligne horizontale (Graine / Racines / Tronc / Fruit), chaque étape avec un rond icône et une carte ; la 4e carte est inversée (mise en avant).
- **Terminal** : fenêtre sombre (claire en mode clair) avec `curl …/api/profil`. Animation : la commande se tape, puis la réponse JSON (récupérée sur `GET /api/profil/`, repli `profilApi` de `contenu.json`) s'affiche ligne par ligne avec coloration, curseur clignotant.
- **Engagements** i à iv, apparition décalée.
- **Animation** : la ligne se dessine de gauche à droite au défilement, chaque étape apparaît quand la ligne l'atteint.

### 05 · Binetou IA
- Gauche : titre, texte, 3 suggestions cliquables en verre. Droite : fenêtre de chat en verre (en-tête avec icône BG et statut, messages, champ de saisie, bouton envoyer).
- Fonctionnement : voir `docs/03-architecture.md`. Les réponses s'affichent en flux (effet machine à écrire), avec indicateur « … » pendant l'attente. Historique conservé pendant la visite (pas de stockage serveur des conversations nominatives).
- La bulle flottante ouvre le même chat en panneau latéral (desktop) ou plein écran (mobile, capture 07/08).

### 06 · Contact
- Titre, email cliquable souligné, texte (CDI, CDD, stages, freelance), boutons GitHub et LinkedIn.
- Formulaire en verre : nom, email, message, bouton. Validation côté client et serveur, anti-spam (champ piège invisible + limite de débit), messages de succès et d'erreur de `contenu.json`.

### Bandeaux d'outils
- Deux rubans qui se croisent : ruban 1 plein accent incliné de −3°, défile vers la gauche ; ruban 2 en verre incliné de +2,5°, défile vers la droite. Catégories en étiquettes mono contour, outils en Fraunces, séparés par la fleur du logo (SVG).
- Défilement infini en CSS (contenu dupliqué, `translateX`), ralentit au survol, vitesse modulée par la vitesse de défilement (GSAP). Immobile si `prefers-reduced-motion`.

### Footer
- Appel à l'action en verre (« Faisons-la grandir ensemble », boutons email et Binetou IA), grille de 4 colonnes (marque + pastille de disponibilité, navigation, réseaux avec icônes en verre, 3 CV en boutons verre), barre de bas de page (copyright, mention, retour en haut), signature « Binetou Gueye » géante en dégradé qui sort par le bas.
- **Animation** : la signature monte doucement quand on arrive en bas.

## Transverse
- **Grain** sur toute la page (SVG feTurbulence, opacité `--grain-opacity`, `pointer-events: none`).
- **Défilement fluide** Lenis, synchronisé avec ScrollTrigger ; ancres qui défilent en douceur.
- **Curseur** : halo cuivré doux qui suit la souris (desktop uniquement).
- **SEO** : titre et description de `meta`, balises Open Graph avec une image de partage (portrait + logo), `sitemap.xml`, `robots.txt`, données structurées `Person`.
- **Favicon** : `assets/logo/favicon.svg`.
- **Page 404** dans le style du site.
- Langue `fr`.

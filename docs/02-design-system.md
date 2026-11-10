# 02 — Design system

Toutes les valeurs sont dans `design/tokens.css`. Planche de référence : `design/maquette-captures/00-identite.jpg`.

## Couleurs

| Rôle | Variable | Sombre | Clair |
|---|---|---|---|
| Fond principal | `--bg` | Ébène `#220F0B` | Papier `#FBF6F0` |
| Fond intermédiaire (Projets) | `--bg-2` | `#2C140E` | `#F3EADF` |
| Puces, surfaces | `--surface` | Cacao `#4D2519` | Sable `#E8DACA` |
| Bordures | `--border` | Acajou `#733F29` | Tan `#C9A27F` |
| Lueurs, chiffres décoratifs | `--glow` | Cuivre `#A26641` | Cuivre `#A26641` |
| Accent (boutons, liens, italiques) | `--accent` | Caramel `#C5946B` | Acajou `#733F29` |
| Texte sur accent | `--on-accent` | Ébène | Papier |
| Texte | `--text` | Lin `#DECDBB` | Ébène |
| Sections À propos et Méthode | `--contrast-*` | brun chaud `#33180F`, cartes `#3D1D13`, texte Lin | sable `#F1E6D8`, cartes Papier, texte Ébène |
| Fond Contact | `--contact-bg` | Cacao | Sable |

Règles :
- Le cuivre `#A26641` n'est jamais utilisé pour du petit texte (contraste insuffisant) : seulement grands titres, chiffres décoratifs, traits.
- Les italiques des titres prennent `--accent` (ou `--contrast-label` dans les sections contrastées).

## Typographie
| Usage | Police | Détails |
|---|---|---|
| Titres | Fraunces (variable, auto-hébergée via `@fontsource-variable/fraunces`) | poids 400, italique 300 pour le mot mis en valeur, interlettrage négatif (−1,5 à −2,5 px) |
| Texte, interface | Inter (`@fontsource/inter` 400/500/600) | texte 15–19 px, interligne 1,6–1,7 |
| Étiquettes, code, numéros de section | JetBrains Mono (`@fontsource/jetbrains-mono` 400/500) | 11–13 px, MAJUSCULES, interlettrage 2–3 px |

Tailles desktop : titre accueil 88 px, titres de section 60 px, titre contact 76 px, signature footer 214 px. Mobile : accueil 40 px, sections 36–40 px.

## Espacements et formes
- Conteneur 1280 px, marges latérales 64 px (desktop), 22 px (mobile).
- Sections : 120 px en haut et en bas (desktop), 72 px (mobile).
- Rayons : pilule 999 px, cartes 24–28 px, panneaux 32 px, arche photo 200 px en haut.

## Verre dépoli (`Glass`)
```css
background: var(--glass-bg);
backdrop-filter: blur(20px) saturate(140%);
border: 1px solid var(--glass-border);
box-shadow: var(--glass-shadow);
```
Toujours posé au-dessus d'un halo ou d'un contenu coloré, sinon l'effet ne se voit pas. Prévoir un repli sans `backdrop-filter` (fond plus opaque) pour les navigateurs qui ne le gèrent pas.

## Halos
Disques flous `radial-gradient(circle, var(--halo-1) 0%, transparent 70%)` + `filter: blur(24px)`, placés derrière le portrait, l'arbre, la galerie, le chat, le formulaire et le haut du footer.

## Composants à créer
| Composant | Rôle |
|---|---|
| `Glass` | conteneur verre (props : `as`, `rounded`, `className`) |
| `Button` | variantes `primary` (plein accent), `secondary` (contour), `glass` ; tailles `md`, `lg` ; option `magnetic` |
| `Chip` | puces : `surface`, `accent`, `outline`, `mono` |
| `SectionHeading` | numéro mono + titre Fraunces avec partie italique |
| `ThemeToggle` | lune/soleil, gère `data-theme`, `localStorage`, transition |
| `Logo` | choisit la bonne version selon le mode |
| `Rings` | cernes SVG paramétrables (portrait, couvertures de projets, footer) |
| `Flower` | fleur du logo (séparateur des bandeaux) |
| `Halo` | disque lumineux flou |
| `Grain` | texture de grain plein écran |
| `Marquee` | ruban infini (direction, vitesse, inclinaison, variante plein/verre) |
| `ProjectCard`, `FeaturedProject` | cartes projets |
| `ChatWindow`, `ChatBubble`, `ChatLauncher` | chatbot |
| `Terminal` | fenêtre terminal animée |
| `CvMenu` | menu des 3 CV |

## Icônes
Traits fins (1,7–2 px), style Lucide (le paquet `lucide-react` est autorisé). Icônes de marque GitHub / LinkedIn incluses dans Lucide.

## Logos et images
| Fichier | Usage |
|---|---|
| `assets/logo/logo-sombre.svg` / `logo-clair.svg` | menu, footer (selon le mode) |
| `assets/logo/icone-sombre.svg` / `icone-claire.svg` | chatbot, favicon d'appli |
| `assets/logo/favicon.svg` | favicon |
| `assets/photos/portrait-accueil.jpg` | cercle de l'accueil |
| `assets/photos/portrait-apropos.jpg` | arche À propos |
| `assets/projets/sensuivi-logo-sombre.png` / `-clair.png` | carte Sen Suivi |
| `assets/illustrations/arbre-competences(-clair).svg` | section Compétences |
| `assets/cv/*.pdf` | téléchargements (copier dans `frontend/public/cv/`) |
| `assets/videos/sensuivi-presentation-720p.mp4` + affiche | modale vidéo de la carte Sen Suivi (copier dans `frontend/public/videos/`) |

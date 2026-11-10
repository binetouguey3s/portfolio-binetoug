# CLAUDE.md — Portfolio de Binetou Gueye « Racines & Code »

Tu travailles avec Binetou, développeuse full-stack (Angular, Django, IA) qui découvre React avec ce projet. **Réponds et commente en français.** Explique brièvement chaque étape importante, sans jargon inutile. Avance **étape par étape** : une étape du fichier `docs/04-prompts-claude-code.md` à la fois, puis tu t'arrêtes pour qu'elle vérifie.

## Source de vérité
1. **La maquette** : `design/maquette-captures/` (images, à regarder avant chaque section) et `design/maquette-html/` (HTML ouvrable dans le navigateur : styles exacts, espacements, couleurs). Le site doit reproduire la maquette **fidèlement**, en desktop et en mobile, en mode sombre et en mode clair.
2. **Les textes** : `content/contenu.json`. Ne réécris pas les textes, ne les invente pas. Importe-les depuis ce fichier.
3. **Les couleurs et polices** : `design/tokens.css`. Jamais de couleur en dur dans les composants : uniquement les variables CSS (ou les classes Tailwind qui y renvoient).
4. **Les spécifications** : `docs/01-cahier-des-charges.md`, `docs/02-design-system.md`, `docs/03-architecture.md`.

En cas de doute entre deux sources, la maquette gagne pour le visuel, `contenu.json` gagne pour les textes. Si quelque chose manque, demande à Binetou au lieu d'inventer.

## Règles absolues
- **Palette uniquement en marrons** (voir tokens). Aucun vert, bleu ou autre couleur ajoutée. Le logo Sen Suivi s'affiche dans sa version monochrome fournie (`assets/projets/`), jamais en bleu.
- **Jamais de note ni de « 100 % »**, ni aucun chiffre qui n'est pas dans `contenu.json`.
- **Pas d'âge** dans la description de Sen Suivi. Pas de captures d'écran de Sen Suivi, pas d'étude de cas.
- **Pas de numéro de téléphone affiché sur le site.** Le chatbot peut le donner uniquement si on le lui demande, en proposant aussi l'email ou le formulaire. Le numéro est seulement dans `content/base-connaissances-chatbot.md` (lu par le serveur), jamais dans `contenu.json` ni dans le front : il serait lisible dans le code du site.
- **Deux modes** : sombre et clair, via `data-theme` sur `<html>`. Le mode par défaut suit le système (`prefers-color-scheme`), le choix est mémorisé dans `localStorage`, la bascule dure 400 ms. Chaque composant doit être vérifié dans les deux modes.
- **Verre dépoli** (classe ou composant `Glass`) sur : menu flottant, étiquettes du portrait, bande de chiffres, cartes de compétences, cartes de projets, fenêtre du chatbot et ses bulles, formulaire de contact, ruban 2, éléments du footer, et leurs équivalents mobiles.
- **Accessibilité** : contraste AA (texte 4,5:1), vrais `<button>` et `<a href>`, `aria-label` sur les boutons à icône, `alt` sur les images, navigation au clavier, focus visible. Respecter `prefers-reduced-motion` : animations coupées ou réduites, défilement natif, bandeaux immobiles.
- **Responsive** : mobile d'abord (390 px), tablette, desktop (1440 px, conteneur 1280 px).
- **Performance** : images optimisées (WebP/AVIF, tailles adaptées), polices auto-hébergées (`@fontsource`), animations sur `transform`/`opacity` uniquement, chargement différé des sections lourdes. Objectif Lighthouse ≥ 90 partout.
- **Le front doit fonctionner même si l'API Django est hors ligne** : données locales (`contenu.json`) en repli, chatbot qui affiche le message `chatbot.horsLigne`.

## Stack
- **Front** (`frontend/`) : React + Vite + TypeScript, Tailwind CSS v4, GSAP (+ ScrollTrigger, SplitText, `@gsap/react` et `useGSAP`), Motion (`motion/react`) pour les micro-interactions, Lenis pour le défilement fluide. Toutes les extensions GSAP sont gratuites : installer `gsap` depuis npm, sans registre privé ni clé.
- **Back** (`backend/`) : Django 5 + Django REST Framework, base PostgreSQL Neon, chatbot via l'API GroqCloud (modèle configurable par variable d'environnement `GROQ_MODEL`).
- **Hébergement** : Vercel (front et API), Neon pour la base.

## Conventions de code
- Composants React fonctionnels en TypeScript, un composant par fichier, noms en PascalCase, dossiers en kebab-case.
- Sections dans `src/sections/`, composants réutilisables dans `src/components/`, hooks dans `src/hooks/`, animations GSAP dans le composant concerné via `useGSAP` (nettoyage automatique).
- Enregistrer les plugins GSAP une seule fois dans `src/lib/gsap.ts`.
- Pas de `any` en TypeScript. Types des contenus dans `src/types/content.ts`.
- Django : une app `portfolio` (projets, contact, profil) et une app `chatbot`. Secrets uniquement en variables d'environnement, jamais dans le code ni dans Git.
- Commits courts et clairs en français (« feat: section hero », « fix: contraste bouton mode clair »).

## Ce qu'il ne faut pas faire
- Ne pas installer de bibliothèque de composants UI (MUI, Chakra…) : tout est sur mesure.
- Ne pas ajouter de sections, d'emoji ou de textes qui ne sont pas dans la maquette.
- Ne pas modifier `content/`, `design/` ou `assets/` sans demander : ce sont les références validées.

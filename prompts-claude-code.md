# 04 — Prompts pour Claude Code (à copier-coller dans l'ordre)

**Mode d'emploi**
1. Ouvre le dossier `portfolio-binetou` dans VS Code, lance Claude Code.
2. Copie un prompt, attends la fin, fais les **vérifications** indiquées, puis passe au suivant.
3. À la fin de chaque étape validée : `git add . && git commit -m "…"` (Claude Code peut le faire si tu le lui demandes).
4. Si un rendu ne ressemble pas à la maquette, dis-le précisément : « la section X ne ressemble pas à la capture Y : [ce qui ne va pas] ».

Planning conseillé : jour 1 → étapes 0 à 4 · jour 2 → 5 à 7 · jour 3 → 8 à 11 · jour 4 → 12 à 13 · jour 5 → 14 à 16 · jours 6-7 → 17 à 18.

---

### Étape 0 — Prise de connaissance
```
Lis CLAUDE.md, puis tous les fichiers de docs/, content/contenu.json et design/tokens.css. Regarde toutes les images de design/maquette-captures/ (y compris les sous-dossiers). Ne code rien. Résume-moi en français, en 15 lignes maximum, ce que tu as compris du projet, de la maquette et des règles, puis liste les questions éventuelles.
```
✅ Vérifier : le résumé parle bien des 2 modes, du verre, de l'arbre, des bandeaux, de l'interdiction des « 100 % ».

### Étape 1 — Initialisation du front
```
Crée le projet front dans frontend/ : Vite + React + TypeScript. Installe Tailwind CSS v4 avec @tailwindcss/vite, gsap, @gsap/react, motion, lenis, lucide-react, @fontsource-variable/fraunces, @fontsource/inter (400, 500, 600), @fontsource/jetbrains-mono (400, 500). Crée src/styles/index.css qui importe Tailwind et design/tokens.css (copie-le dans src/styles/tokens.css) et déclare un bloc @theme qui mappe les couleurs sur les variables (--color-bg, --color-accent, etc.) et les 3 polices. Crée src/lib/gsap.ts qui enregistre ScrollTrigger, SplitText et useGSAP une seule fois. Copie les assets : logos et favicon dans public/, photos et logos Sen Suivi dans public/images/, CV dans public/cv/, la vidéo Sen Suivi et son affiche (assets/videos/) dans public/videos/, l'arbre dans src/assets/. Crée src/types/content.ts à partir de content/contenu.json. Mets le titre, la description et la langue fr dans index.html. Lance npm run dev et dis-moi l'URL.
```
✅ Vérifier : la page s'ouvre sans erreur, fond ébène.

### Étape 2 — Thème sombre / clair
```
Implémente le système de thème : script anti-flash dans index.html (data-theme posé avant le rendu, depuis localStorage ou prefers-color-scheme), hook useTheme, composant ThemeToggle (lune en mode sombre, soleil en mode clair, aria-label adapté) avec la transition de 400 ms (classe theme-transition retirée après la bascule). Crée aussi les composants de base du docs/02-design-system.md : Glass, Button (primary, secondary, glass, option magnetic), Chip, SectionHeading, Logo (version selon le mode), Halo, Grain, Rings, Flower. Fais une page de démonstration temporaire /demo qui affiche tous ces composants dans les deux modes.
```
✅ Vérifier : la bascule fonctionne, le choix est retenu après rechargement, les composants ressemblent à `00-identite.jpg`.

### Étape 3 — Menu et squelette de page
```
Construis le squelette de App.tsx avec toutes les sections vides (ids : accueil, apropos, arbre, projets, methode, ia, contact) dans l'ordre du cahier des charges, le Grain plein écran et Lenis synchronisé avec ScrollTrigger (désactivé si prefers-reduced-motion). Construis la Navbar exactement comme la maquette (captures 01-desktop-sombre-haut-01 et 03-desktop-clair-haut-01) : pilule en verre flottante, logo, liens, ThemeToggle, bouton « Demander à Binetou IA ». Ajoute le comportement : compacte au défilement, se cache en descendant, réapparaît en remontant. Version mobile (capture 05) : pilule avec logo, ThemeToggle, bouton menu qui ouvre un menu plein écran en verre.
```
✅ Vérifier en desktop et en mobile (outils de développement, 390 px), dans les 2 modes.

### Étape 4 — Accueil
```
Construis la section Accueil (Hero) fidèle aux captures 01-…-01, 03-…-01, 05 et 06 : textes de contenu.json, portrait rond avec cernes SVG (composant Rings), arc accent, 4 étiquettes en verre, halos. Bouton « Télécharger mon CV » qui ouvre CvMenu (3 CV). Animations GSAP : préchargement court où l'anneau du logo se dessine puis la fleur éclot, titre révélé mot par mot avec SplitText, cernes qui tournent lentement et suivent un peu la souris, étiquettes qui flottent, halo qui suit le curseur (desktop), boutons magnétiques. Tout est coupé si prefers-reduced-motion.
```
✅ Comparer côte à côte avec la capture. Tester le mode clair.

### Étape 5 — Chiffres et À propos
```
Construis la bande de chiffres (panneau en verre, compteurs qui s'animent à l'apparition, « Certifiée » en fondu) et la section À propos (photo en arche, citation qui déborde, titre, paragraphes, étiquettes), fidèles aux captures 01-…-01/02 et 03-…-01/02. Fond --contrast-bg. Animation : la photo se dévoile par clip-path de bas en haut, le texte monte en fondu, au défilement.
```

### Étape 6 — Compétences : l'arbre
```
Construis la section Compétences fidèle aux captures 01-…-02/03 et 03-…-02/03. Convertis src/assets/arbre-competences.svg en composant React TreeOfSkills.tsx dont les couleurs utilisent les variables CSS (il doit fonctionner dans les 2 modes, voir arbre-competences-clair.svg pour le rendu attendu en clair). Regroupe les éléments en <g> nommés : soleil, sol, racines, tronc, branches, feuillage, lucioles. Animation ScrollTrigger avec scrub : le tronc pousse, les racines se dessinent (stroke-dashoffset), puis les branches, puis le feuillage apparaît par vagues ; les lucioles scintillent en boucle. Au survol d'une carte de compétences, la partie correspondante de l'arbre s'illumine. Mobile : arbre en haut, cartes empilées.
```

### Étape 7 — Projets
```
Construis la section Projets fidèle aux captures 01-…-03/04/05 et 03-…-03/04/05 : carte vedette Sen Suivi (logo monochrome selon le mode, bouton « Voir l'application » vers projets.vedette.lienApplication, bouton vidéo qui ouvre une modale avec un lecteur vidéo accessible), galerie de 7 ProjectCard en verre avec couvertures en cernes et domaine, puis « Autres réalisations ». Desktop : section épinglée et défilement horizontal de la galerie avec ScrollTrigger, inclinaison 3D au survol. Mobile : carrousel horizontal au doigt avec scroll-snap.
```
✅ Les liens externes s'ouvrent dans un nouvel onglet avec `rel="noopener"`.

### Étape 8 — Ma méthode et terminal
```
Construis la section Ma méthode fidèle aux captures 02-…-01/02 et 04-…-01/02 : 4 étapes reliées par une ligne, 4e carte inversée, composant Terminal, engagements i à iv. Animations : la ligne se dessine au défilement et chaque étape apparaît quand elle est atteinte ; le terminal tape la commande puis affiche le JSON ligne par ligne avec coloration (clés en accent, valeurs en texte, true et nombres en cuivre) et un curseur qui clignote. Pour l'instant, utilise profilApi de contenu.json ; on branchera l'API à l'étape 15.
```

### Étape 9 — Chatbot (interface)
```
Construis l'interface Binetou IA : section 05 (captures 02-…-02/03), bulle flottante ChatLauncher en bas à droite sur toute la page, panneau latéral sur desktop et plein écran sur mobile (captures 07 et 08). Suggestions cliquables, bulles en verre, indicateur « … », réponse affichée progressivement. Pour l'instant, branche un faux service qui répond après 1 seconde avec un texte de test ; on branchera l'API à l'étape 15. Accessibilité : focus piégé dans le panneau ouvert, Échap pour fermer, aria-live pour les nouveaux messages.
```

### Étape 10 — Contact
```
Construis la section Contact fidèle aux captures 02-…-03 et 04-…-03 : titre, email, texte (CDI, CDD, stages, freelance), boutons GitHub et LinkedIn, formulaire en verre avec labels, validation côté client, champ piège invisible anti-spam, états chargement / succès / erreur (textes de contenu.json). Envoi factice pour l'instant ; on branchera l'API à l'étape 15.
```

### Étape 11 — Bandeaux d'outils et footer
```
Construis les bandeaux d'outils (composant Marquee, captures 02-…-03/04 et 04-…-03/04) : section dont le fond est moitié --contact-bg, moitié --bg ; ruban 1 plein accent incliné de −3° qui défile vers la gauche ; ruban 2 en verre incliné de +2,5° qui défile vers la droite ; catégories en étiquettes mono contour, outils en Fraunces, séparés par Flower. Défilement infini en CSS, ralentit au survol, vitesse modulée par la vitesse de scroll, immobile si prefers-reduced-motion. Puis construis le Footer fidèle à la capture 02-…-04 / 04-…-04 : appel à l'action en verre, grille 4 colonnes, barre de bas de page, signature géante en dégradé qui monte quand on arrive en bas.
```

### Étape 12 — Responsive et finitions
```
Passe toute la page en revue à 390 px, 768 px, 1024 px et 1440 px, dans les deux modes. Corrige tout ce qui déborde, se chevauche ou ne ressemble pas aux captures mobiles 05 à 08. Vérifie les contrastes (AA), le focus clavier sur tous les éléments interactifs, les textes alternatifs, et que prefers-reduced-motion coupe bien les animations. Supprime la page /demo. Donne-moi la liste de ce que tu as corrigé.
```

### Étape 13 — Back-end Django
```
Crée le back-end dans backend/ selon docs/03-architecture.md : Django 5 + DRF, django-cors-headers, dj-database-url, psycopg[binary], whitenoise, httpx, python-dotenv. Projet config, apps portfolio et chatbot. Modèles Project (ordre, nom, meta, domaine, description, stack en JSON, lien, label du lien, vedette) et ContactMessage (nom, email, message, date, lu), admin pour les deux, commande de chargement des projets depuis content/contenu.json. Routes /api/profil/, /api/projets/, /api/contact/ (anti-spam + limite de débit), /api/sante/. Réglages par variables d'environnement (fichier .env.example sans secret, .env dans .gitignore). En local, SQLite si DATABASE_URL est absent. Écris des tests simples pour chaque route et lance-les.
```

### Étape 14 — Chatbot (back-end)
```
Implémente /api/chat/ dans l'app chatbot : charge backend/chatbot/data/base-connaissances-chatbot.md (copie de content/), construit le message système à partir de la section « Consignes » et du reste du fichier, appelle l'API GroqCloud (compatible OpenAI) avec httpx, modèle lu dans GROQ_MODEL, température 0,3, historique limité aux 6 derniers échanges, question limitée à 500 caractères, délai 20 s, limite de débit par IP. En cas d'erreur, renvoie un code 503 avec un message clair. Ajoute un test qui simule l'API Groq.
```

### Étape 15 — Brancher le front sur l'API
```
Crée src/lib/api.ts (base VITE_API_URL, délai d'attente, gestion d'erreur) et branche : le terminal sur /api/profil/, la galerie sur /api/projets/, le formulaire sur /api/contact/, le chatbot sur /api/chat/. Pour chacun, garde le repli prévu dans docs/03-architecture.md si l'API ne répond pas. Teste en coupant le serveur Django : le site doit rester complet et propre.
```

### Étape 16 — SEO et performance
```
Ajoute les balises Open Graph et Twitter (image de partage 1200×630 à générer à partir du portrait et du logo dans la palette), les données structurées Person, sitemap.xml, robots.txt, la page 404 dans le style du site. Optimise les images (WebP + tailles responsives), charge la vidéo uniquement à l'ouverture de la modale, découpe le code des sections lourdes. Lance un audit Lighthouse (mobile et desktop) et corrige jusqu'à ≥ 90 partout.
```

### Étape 17 — Déploiement
```
Prépare le déploiement selon docs/05-deploiement.md : vérifie les .gitignore, le requirements.txt, les réglages de production Django, la variable VITE_API_URL. Explique-moi pas à pas ce que je dois faire dans Vercel et Neon, puis aide-moi à lancer les migrations et le chargement des projets sur la base Neon.
```

### Étape 18 — Recette finale
```
Fais une recette complète du site en production : chaque lien, chaque bouton, les 3 CV, le formulaire (vérifie que le message arrive dans l'admin), le chatbot (5 questions variées dont une hors sujet), les deux modes, mobile et desktop. Donne-moi un tableau : élément, résultat, correction faite.
```

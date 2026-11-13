# 07 — Guide du projet

Ce guide explique le portfolio **tel qu'il est construit et en ligne**, pour le comprendre et le faire évoluer.
Les documents 01 à 03 décrivent ce qui était demandé ; 05 le déploiement ; 06 la recette.

- Site : https://portfolio-binetou.vercel.app
- API : https://portfolio-binetou-api.vercel.app (admin : `/admin/`)

---

## 1. Le principe en une page

```
content/contenu.json  ──►  front (textes, liens, projets, CV, actions du chatbot)
        │                     └─► si l'API répond : profil et projets viennent de Django
        │
        ├─► backend/portfolio/data/contenu.json   (copie, lue par Django en production)
        └─► backend/chatbot/data/base-connaissances-chatbot.md
                   ▲
content/base-connaissances-chatbot.md  (consignes du chatbot + ton parcours, avec le téléphone)
```

- **Une seule source pour les textes** : `content/contenu.json`. Le front l'intègre au build ; Django en lit une copie.
- **Le chatbot** reçoit à chaque question un « message système » construit à partir de `content/base-connaissances-chatbot.md`
  (tes consignes et ton parcours), complété par ce que `contenu.json` ajoute (liens, méthode, engagements…).
- **La commande qui relie tout** : `python manage.py construire_base_chatbot` (dans `backend/`). Elle régénère la copie de
  `contenu.json` et la base du chatbot. **À lancer après chaque modification de `content/`, avant de pousser.**
  Si tu l'oublies, deux tests Django échouent pour te le rappeler.
- **Le téléphone** n'est que dans `content/base-connaissances-chatbot.md` (côté serveur), jamais dans `contenu.json`
  (qui finit dans le code du site, lisible par tous).

---

## 2. Organisation des dossiers

```
portfolio-binetou/
├── CLAUDE.md, LISEZ-MOI.md
├── content/          ← textes (contenu.json) et base du chatbot : à modifier pour changer le site
├── design/           ← maquette et tokens.css (références validées, ne pas modifier)
├── assets/           ← originaux : photos, logos, CV, vidéos (source des images optimisées)
├── docs/             ← documentation (01 à 07)
├── frontend/         ← site React (Vercel, projet « portfolio-binetou »)
└── backend/          ← API Django (Vercel, projet « portfolio-binetou-api »)
```

### Front (`frontend/`)
| Dossier / fichier | Rôle |
|---|---|
| `index.html` | page unique : script anti-flash du thème, **préchargeur en CSS**, emplacements des balises SEO |
| `404.html` + `src/page-404.tsx` + `src/sections/Page404.tsx` | page d'erreur dans le style du site |
| `src/main.tsx` | démarre React (« hydrate » la page pré-rendue en production) |
| `src/App.tsx` | ordre des sections ; charge les sections sous l'accueil **une par une** |
| `src/entry-prerender.tsx` | pré-rendu du menu et de l'accueil au build |
| `src/sections/` | une section par fichier : Navbar, Hero, Stats, About, Skills, Projects, Method, Chatbot, Contact, ToolsMarquee, Footer, Page404 |
| `src/components/` | composants réutilisables (Glass, Button, Chip, Image, Logo, Marquee, Terminal, TreeOfSkills, VideoModal, CvMenu, CvLiens, Chat*…) |
| `src/hooks/` | useTheme, useReducedMotion, useMediaQuery/useEstMobile, useLenis, useScrollNavbar, useMagnetic, useChat, useDonneesApi, useLangueCv |
| `src/lib/` | logique sans affichage : `api.ts` (appels Django), services (profil, projets, contact, chat), `gsap.ts`, `lenis.ts`, `theme.ts`, `cv.ts`, `images.ts`, `chat-actions.ts`, `liens.ts` |
| `src/types/content.ts` | types TypeScript de `contenu.json` (le build échoue si le JSON ne correspond pas) |
| `src/data/arbre-competences.ts` | géométrie de l'arbre, extraite du SVG de `assets/` (ne pas modifier à la main) |
| `src/styles/tokens.css` | copie de `design/tokens.css` (couleurs, polices) |
| `src/styles/index.css` | Tailwind, polices, classes globales (verre, préchargeur, bandeaux…) |
| `vite.config.ts` | alias `@content`, textes et SEO injectés dans le HTML, `robots.txt`, `sitemap.xml`, `llms.txt` |
| `scripts/` | `prerender.mjs` (build), `optimiser-images.sh`, `generer-image-partage.mjs` + `image-partage.html` |
| `public/` | fichiers servis tels quels : `cv/`, `images/` (originaux + WebP/AVIF), `videos/`, `logo/`, `partage.jpg` |

### Back (`backend/`)
| Fichier | Rôle |
|---|---|
| `config/settings.py` | réglages ; tout ce qui change entre local et production passe par des variables d'environnement |
| `config/urls.py` | `/admin/` et `/api/` |
| `portfolio/models.py` | `Project` (projets, gérables dans l'admin) et `ContactMessage` (messages du formulaire) |
| `portfolio/views.py` | routes `sante`, `profil`, `projets`, `contact` |
| `portfolio/contenu.py` | lecture de `contenu.json` |
| `portfolio/data/contenu.json` | **copie générée** de `content/contenu.json` (ne pas modifier à la main) |
| `portfolio/management/commands/charger_projets.py` | charge les projets de `contenu.json` dans la base |
| `chatbot/views.py` | route `/api/chat/` |
| `chatbot/base.py` | construit la base et le message système |
| `chatbot/groq.py` | appel à Groq (modèle principal puis secours), nettoyage du Markdown, tokens dans les logs |
| `chatbot/actions.py` | choix des boutons sous les réponses (règles de mots-clés) |
| `chatbot/liens.py` | retire des réponses toute adresse web absente de la base |
| `chatbot/data/base-connaissances-chatbot.md` | **base générée** (ne pas modifier à la main) |
| `chatbot/management/commands/construire_base_chatbot.py` | génère les deux fichiers « copie » ci-dessus |
| `.env` (local, ignoré) · `.env.example` (modèle) · `.env.neon` (local, ignoré : chaîne Neon) | variables d'environnement |

---

## 3. Le front en détail

### Le premier affichage
1. Le navigateur reçoit `index.html` qui contient déjà :
   - le **préchargeur** (anneau du G, B, fleur) animé en CSS : il s'affiche immédiatement ;
   - le **HTML pré-rendu du menu et de l'accueil** (produit au build par `scripts/prerender.mjs`) ;
   - le portrait annoncé en `<link rel="preload">`.
2. Le JavaScript principal (menu + accueil) arrive ; React **hydrate** la page (il reprend le HTML existant sans le reconstruire).
3. `Preloader.tsx` attend la fin de l'animation, efface l'écran, puis l'accueil se révèle (titre mot par mot).
4. Les autres sections (Stats → Footer) arrivent dans des fichiers séparés et s'affichent **une par une, de haut en bas**
   (pour ne pas bloquer le téléphone et garder l'ordre des animations au défilement).

Le pré-rendu est fait en **version mobile** : sur un écran large, les textes longs prennent le relais dès l'hydratation,
sous le préchargeur. Toute valeur qui dépend du navigateur (thème, taille d'écran, langue, mouvement réduit) passe par
`useSyncExternalStore` avec une valeur « serveur », pour éviter les erreurs d'hydratation.

### Thème sombre / clair
- Attribut `data-theme` sur `<html>`, posé avant tout affichage par le script de `index.html` (choix mémorisé dans
  `localStorage`, sinon préférence du système). `useTheme` lit et change ce thème ; transition de 400 ms.
- Les couleurs ne sont **jamais écrites en dur** : variables de `tokens.css`, reliées aux classes Tailwind
  (`bg-bg`, `text-accent`, `contrast-*`…) dans `index.css`.

### Animations
- GSAP (plugins enregistrés une seule fois dans `lib/gsap.ts`), dans chaque composant via `useGSAP`.
- Défilement fluide : Lenis (`lib/lenis.ts`), chargé juste après le premier affichage. Désactivé si mouvement réduit.
- Les apparitions au défilement utilisent `opacity` (pas `visibility`) : le contenu reste lisible par les lecteurs d'écran.
- `prefers-reduced-motion` : pas de préchargeur, pas de Lenis, bandeaux immobiles, animations coupées.
- Bandeaux d'outils : la durée d'un tour est calculée d'après la longueur du ruban (vitesse constante,
  `Marquee.tsx`) ; ajouter des outils ne les accélère pas.

### Données et API
- `lib/api.ts` : base `VITE_API_URL`, délai d'attente (8 s ; 45 s pour le chat), toute panne devient une `ErreurApi`.
- `useDonneesApi` : affiche d'abord `contenu.json`, puis la réponse de l'API si elle arrive (terminal, galerie).
- Replis si l'API ne répond pas :

| Fonction | Repli |
|---|---|
| Terminal | `profilApi` de `contenu.json` |
| Galerie | `projets.galerie` de `contenu.json` |
| Chatbot | message `chatbot.horsLigne` + boutons CV Général FR et EN |
| Formulaire | message d'erreur + lien `mailto:` (le texte saisi est gardé) |

### Images et médias
- Portraits et logo Sen Suivi : versions **AVIF + WebP** à plusieurs largeurs (composant `Image`, liste dans `lib/images.ts`).
- Vidéo Sen Suivi : le lecteur n'est créé qu'à l'ouverture de la fenêtre (rien n'est téléchargé avant le clic).
- CV : `public/cv/` (copies de `assets/cv/`), en français et en anglais ; pastilles FR/EN, langue du navigateur en premier.

### Où mènent les liens
| Lien | Destination |
|---|---|
| Ton adresse email (contact, footer, réponses du chat, messages d'erreur) | rédaction d'un message **dans Gmail**, adresse remplie, nouvel onglet (`lienGmail` dans `lib/liens.ts`) |
| « Écrire un email » (chatbot, footer) | **formulaire de contact**, curseur dans « Nom » (ancre `#formulaire-contact`) |
| « Voir l'application » du chatbot | l'application si `lienApplication` est renseigné, sinon la **fenêtre vidéo** du site (`#video-sen-suivi`) |
| Boutons du chatbot vers la page (`#…`) | ferment d'abord le panneau flottant, puis défilent jusqu'à la cible (`lib/navigation.ts`) |
| GitHub, LinkedIn, projets | nouvel onglet |

Si les deux boutons « Écrire un email » et « Aller au contact » sont choisis, seul le premier est gardé (ils mènent au même endroit).

### SEO
Générés au build depuis `contenu.json` (`vite.config.ts`) : balises Open Graph et Twitter, adresse canonique,
données structurées `Person`, `robots.txt`, `sitemap.xml`, `llms.txt`. L'adresse du site vient de `meta.url`
(sinon de l'adresse de production fournie par Vercel). Image de partage : `public/partage.jpg`.

---

## 4. Le back en détail

### Routes (`/api/…`)
| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/sante/` | vérifie l'API et la base (`{"statut":"ok","base":"ok"}`) |
| GET | `/api/profil/` | JSON du terminal (`profilApi` de `contenu.json`) |
| GET | `/api/projets/` | projets de la base (vedette d'abord, puis la galerie dans l'ordre) |
| POST | `/api/contact/` | enregistre un message ; champ piège anti-robot ; 5 par heure et par IP ; email de notification |
| POST | `/api/chat/` | question au chatbot → `{ "reponse": "…", "actions": ["cv-back", …] }` ; 20 par heure et par IP |
| — | `/admin/` | administration (projets, messages reçus) |

La limite de débit est stockée dans la base (table `cache_django`) pour valoir sur toutes les copies du serveur Vercel.

### Le parcours d'une question au chatbot
1. Le front envoie la question (500 caractères max) et l'historique.
2. Django garde les **6 derniers échanges** et construit le message système : la section « Consignes » de la base,
   puis toutes les informations.
3. `groq.py` appelle le **modèle principal** (`GROQ_MODEL`, température 0,3, réponse limitée à 400 tokens, délai 20 s).
   S'il répond 429 (limite atteinte) ou dépasse le délai, **une** nouvelle tentative avec `GROQ_MODEL_SECOURS`.
   Chaque appel est noté dans les logs avec le nombre de tokens (onglet Logs de Vercel).
4. La réponse est nettoyée : le Markdown est retiré (le chat affiche du texte brut), puis **toute adresse web absente
   de la base est supprimée** (`liens.py`) : le chatbot ne peut pas inventer de lien.
5. Les **boutons** sont choisis par `actions.py`, par mots-clés dans la question (jamais par l'IA), uniquement parmi
   les identifiants de `chatbot.actions` de `contenu.json` (2 au maximum ; versions anglaises des CV si la question est
   en anglais). Le front transforme ces identifiants en liens.
6. En cas de panne (Groq, clé manquante…) : code 503 avec le message `horsLigne`.

**Limites à connaître** :
- La base doit rester sous **~2 500 tokens** (la commande refuse au-delà) : offre gratuite de Groq limitée en tokens.
  Qwen gratuit = 7 000 tokens par minute, soit 2 à 3 questions par minute pour tout le site ; au-delà, le secours prend le relais.
- Le modèle peut encore faire des rapprochements inexacts (ex. associer un outil à un projet) malgré les consignes.

---

## 5. Tâches courantes

### Modifier un texte du site
1. Modifier `content/contenu.json`.
2. `cd backend && .venv/bin/python manage.py construire_base_chatbot`
3. Vérifier : `cd frontend && npm run build` puis `cd backend && .venv/bin/python manage.py test`.
4. Commit et `git push` → Vercel redéploie les deux sites.

### Ajouter ou modifier un projet
1. Dans `contenu.json` : `projets.galerie` (avec `num`, `lien`…) ou `projets.autres`.
2. Si le chatbot doit pouvoir proposer un bouton vers ce projet : ajouter une action dans `chatbot.actions`
   (id + label + cible), puis ajouter ses mots-clés dans `backend/chatbot/actions.py` (`REGLES`).
3. `construire_base_chatbot`, tests, commit, push.
4. **Mettre à jour la base Neon** (la galerie en ligne vient de Django) :
   ```bash
   cd backend && DATABASE_URL="$(.venv/bin/python -c "from dotenv import dotenv_values; print(dotenv_values('.env.neon')['DATABASE_URL'])")" .venv/bin/python manage.py charger_projets
   ```
   (ou modifier le projet directement dans l'admin en ligne). `--purger` supprime aussi les projets retirés du JSON.

### Renseigner le lien de l'application Sen Suivi
`projets.vedette.lienApplication` dans `contenu.json` (remplacer `A_COMPLETER`) : le bouton « Voir l'application »
apparaît, et l'action du chatbot `voir-sen-suivi` pointe vers l'application au lieu de la vidéo. Puis comme
« Modifier un texte » + `charger_projets` sur Neon.

### Ajouter des outils aux bandeaux
`bandeaux.ruban1` / `ruban2` dans `contenu.json`. La vitesse reste la même. Penser à la base du chatbot
(`construire_base_chatbot` ; ajouter l'outil dans `content/base-connaissances-chatbot.md` s'il doit le connaître).

### Changer un CV
1. Mettre le Word et le PDF dans `assets/cv/` (source), ex. `CV_BackEnd_Binetou_Gueye_FR.pdf`.
   Sans PDF : ouvrir le Word dans Pages ou Word et l'exporter en PDF.
2. Copier le PDF dans `frontend/public/cv/` **sous le nom utilisé par le site** (sinon les liens ne changent pas) :

| `assets/cv/` | `frontend/public/cv/` |
|---|---|
| `CV_General_Binetou_Gueye_FR.pdf` / `_EN.pdf` | `CV_Binetou_Gueye_General.pdf` / `CV_Binetou_Gueye_General_EN.pdf` |
| `CV_FrontEnd_Binetou_Gueye_FR.pdf` / `_EN.pdf` | `CV_Binetou_Gueye_Front-End.pdf` / `CV_Binetou_Gueye_Front-End_EN.pdf` |
| `CV_BackEnd_Binetou_Gueye_FR.pdf` / `_EN.pdf` | `CV_Binetou_Gueye_Back-End.pdf` / `CV_Binetou_Gueye_Back-End_EN.pdf` |

Autre nom côté site → mettre à jour `identite.cv` dans `contenu.json`.

### Remplacer une photo ou le logo Sen Suivi
1. Remplacer l'original dans `assets/photos/` ou `assets/projets/` (et dans `frontend/public/images/`).
2. `cd frontend && sh scripts/optimiser-images.sh` (régénère WebP + AVIF).
3. Si le portrait d'accueil change : `node scripts/generer-image-partage.mjs` (image de partage).

### Changer le modèle du chatbot
Variables `GROQ_MODEL` / `GROQ_MODEL_SECOURS` dans `backend/.env` (local) et dans Vercel (projet API), puis redéployer.
Vérifier que le modèle existe dans la console Groq (les modèles sont parfois retirés).

### Modifier les consignes ou le parcours dans la base du chatbot
`content/base-connaissances-chatbot.md` (la section « Consignes » doit garder son titre `## Consignes…`), puis
`construire_base_chatbot` : elle indique le nombre de tokens et refuse au-delà de 2 500.

### Changer une variable en production
Vercel → projet → Settings → Environment Variables, puis **Deployments → « … » → Redeploy** (sans redéploiement,
la variable n'est pas prise en compte).

---

## 6. Commandes et scripts

| Où | Commande | Rôle |
|---|---|---|
| `frontend/` | `npm run dev` | site en local (http://localhost:5173) |
| `frontend/` | `npm run build` | build de production (types, Vite, pré-rendu) dans `dist/` |
| `frontend/` | `npm run preview` | servir le build (http://localhost:4173) |
| `frontend/` | `npm run lint` | vérification du code |
| `frontend/` | `sh scripts/optimiser-images.sh` | images WebP + AVIF depuis `assets/` |
| `frontend/` | `node scripts/generer-image-partage.mjs` | `public/partage.jpg` (macOS, Chrome) |
| `backend/` | `.venv/bin/python manage.py runserver 8000` | API en local |
| `backend/` | `.venv/bin/python manage.py test` | tests Django |
| `backend/` | `.venv/bin/python manage.py construire_base_chatbot [--verifier]` | copies de `content/` pour le back |
| `backend/` | `.venv/bin/python manage.py charger_projets [--purger]` | projets de `contenu.json` → base |
| `backend/` | `.venv/bin/python manage.py createsuperuser` | compte admin |

Pour lancer une commande **sur la base Neon** depuis ton Mac, préfixe-la ainsi (l'adresse contient des `&`, ne pas
faire `source .env.neon`) :
```bash
DATABASE_URL="$(.venv/bin/python -c "from dotenv import dotenv_values; print(dotenv_values('.env.neon')['DATABASE_URL'])")" .venv/bin/python manage.py <commande>
```
Pour `migrate` (changement de structure), utiliser de préférence l'adresse **sans** `-pooler` (connexion directe).

---

## 7. Tests

- **Back** : `cd backend && .venv/bin/python manage.py test` (47 tests). Ils couvrent toutes les routes, le formulaire
  (validation, anti-spam, limite de débit, email en échec), le chatbot avec **Groq simulé** (jamais appelé pour de vrai),
  le secours, les actions, le filtre de liens, la taille de la base, et vérifient que les copies de `content/` sont à jour.
- **Front** : `npm run build` (vérifie les types, donc la forme de `contenu.json`) et `npm run lint`.
- **Recette** : voir `docs/06-recette.md`.

---

## 8. Pièges connus

| Symptôme | Cause | Solution |
|---|---|---|
| Le chat affiche « Binetou IA revient bientôt » en local alors que Django tourne | adresse du site non autorisée par CORS (ex. ouvert sous `127.0.0.1` ou un autre port) | ouvrir `http://localhost:5173` ; en local, 5173 et 4173 sont autorisés, sous `localhost` comme `127.0.0.1` |
| Même message en production | `CORS_ALLOWED_ORIGINS` du projet API ≠ adresse exacte du front, ou limite de 20 questions/heure atteinte | corriger la variable puis redéployer ; ou attendre |
| Tests Django en échec « pas à jour » | `content/` modifié sans relancer la commande | `construire_base_chatbot` |
| `construire_base_chatbot` refuse : « Base trop longue » | base du chatbot > 2 500 tokens | raccourcir `content/base-connaissances-chatbot.md` |
| Erreur Groq « model_not_found » dans les logs | modèle retiré par Groq | choisir un modèle disponible (console Groq) |
| `parse error near '&'` dans le terminal | `source .env.neon` avec une adresse contenant `&` | utiliser la commande de la section 6 |
| Le formulaire marche mais aucun email n'arrive | mot de passe d'application Gmail absent ou faux | `EMAIL_HOST_PASSWORD` (local et Vercel) ; le message reste dans l'admin |
| La page 404 ne s'affiche plus | une réécriture « tout vers index.html » ajoutée dans Vercel | la supprimer |
| Le menu du haut disparaît en descendant | comportement voulu | il revient en remontant |
| Une variable Vercel modifiée n'a pas d'effet | pas de redéploiement | Deployments → « … » → Redeploy |

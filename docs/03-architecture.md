# 03 — Architecture technique

> Mis à jour après la mise en ligne (10/11/2026). Le fonctionnement détaillé et les tâches courantes sont dans `docs/07-guide-du-projet.md`.

## Dépôt (monorepo GitHub : `portfolio-binetou`)
```
portfolio-binetou/
├── CLAUDE.md                ← règles du projet (copié depuis le pack)
├── content/                 ← contenu.json, base-connaissances-chatbot.md
├── design/                  ← tokens.css, maquette-captures/, maquette-html/
├── docs/                    ← ces documents
├── assets/                  ← sources (logos, photos, arbre, CV)
├── frontend/                ← React + Vite + TypeScript
│   ├── index.html, 404.html ← page (préchargeur CSS, SEO) et page d'erreur
│   ├── public/              ← favicon, cv/ (FR + EN), images (originaux + WebP/AVIF), videos/, partage.jpg
│   ├── scripts/             ← prerender.mjs, optimiser-images.sh, generer-image-partage.mjs
│   └── src/
│       ├── main.tsx, App.tsx, entry-prerender.tsx, page-404.tsx
│       ├── lib/             ← gsap.ts, lenis.ts, api.ts, services (profil, projets, contact, chat), theme, cv, images
│       ├── hooks/           ← useTheme, useReducedMotion, useEstMobile, useLenis, useScrollNavbar, useDonneesApi…
│       ├── types/content.ts
│       ├── components/      ← Glass, Button, Chip, Image, Rings, Marquee, ThemeToggle, CvMenu, Chat*…
│       ├── sections/        ← Navbar, Hero, Stats, About, Skills, Projects, Method, Chatbot, Contact, ToolsMarquee, Footer, Page404
│       └── styles/          ← index.css (Tailwind, @theme), tokens.css
└── backend/                 ← Django + DRF
    ├── manage.py
    ├── requirements.txt
    ├── config/              ← settings.py, urls.py, wsgi.py
    ├── portfolio/           ← modèles Project, ContactMessage ; vues santé, profil, projets, contact ;
    │                          data/contenu.json (copie générée) ; commande charger_projets
    └── chatbot/             ← vue chat (GroqCloud), base, actions, filtre de liens ;
                               data/ (base générée) ; commande construire_base_chatbot
```

## Front
- Vite + React + TypeScript. Tailwind CSS v4 (`@tailwindcss/vite`), thème branché sur les variables de `tokens.css` via `@theme` (ex. `--color-accent: var(--accent)`), variante `dark` non utilisée : le thème passe par `data-theme`.
- Le contenu vient de `content/contenu.json` (importé au build). Le profil (terminal) et les projets viennent de l'API quand elle répond ; sinon on garde le JSON.
- **Premier affichage** : préchargeur en CSS dans `index.html` ; menu et accueil **pré-rendus au build** (version mobile) puis hydratés par React ; les autres sections sont chargées à part et affichées une par une.
- Images en WebP + AVIF à plusieurs largeurs ; vidéo chargée seulement à l'ouverture de la fenêtre.
- SEO généré au build depuis `contenu.json` : Open Graph, Twitter, données `Person`, `robots.txt`, `sitemap.xml`, `llms.txt`.
- Variables d'environnement Vite : `VITE_API_URL` (URL de l'API Django).
- Script anti-flash dans `index.html` : lit `localStorage.theme` ou `prefers-color-scheme` et pose `data-theme` avant le premier rendu.

## API Django (préfixe `/api/`)
| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/profil/` | JSON du terminal (identique à `profilApi` de `contenu.json`) |
| GET | `/api/projets/` | liste des projets (modèle `Project`, gérable dans l'admin Django) |
| POST | `/api/contact/` | enregistre un `ContactMessage` (nom, email, message), anti-spam (champ piège + limite de débit DRF), notification email optionnelle |
| POST | `/api/chat/` | `{ "message": "…", "history": [...] }` → `{ "reponse": "…", "actions": [...] }` (pas de flux) |
| GET | `/api/sante/` | vérification de l'API et de la base (pour les tests et la surveillance ; le front ne l'appelle pas) |
| — | `/admin/` | administration Django (projets, messages reçus) |

Réglages :
- `DATABASE_URL` (Neon, avec `sslmode=require`) lu par `dj-database-url` ; pilote `psycopg[binary]`.
- `django-cors-headers` : autoriser seulement l'URL du front (`CORS_ALLOWED_ORIGINS`).
- `DEBUG=False` en production, `SECRET_KEY` et `ALLOWED_HOSTS` en variables d'environnement.
- Fichiers statiques de l'admin : `STATIC_ROOT` ; Vercel lance `collectstatic` et les sert (WhiteNoise en local).
- Limites de débit : contact 5/heure, chat 20/heure par IP ; stockées dans la base (`cache_django`) en production.
- Sur Vercel, seul `backend/` est déployé : Django lit `portfolio/data/contenu.json`, copie de `content/contenu.json`.

## Chatbot « Binetou IA »
- Contexte : base générée dans `backend/chatbot/data/`, envoyée en message système (consignes d'abord, puis les informations). Courte (**~2 500 tokens maximum**, offre gratuite de Groq) : **pas besoin de base vectorielle**.
- Fournisseur : API GroqCloud (compatible OpenAI) via `httpx` ; `GROQ_MODEL` = `qwen/qwen3.8-27b`, `GROQ_MODEL_SECOURS` = `openai/gpt-oss-20b` (une nouvelle tentative si 429 ou délai dépassé). Les modèles Llama prévus au départ ont été retirés par Groq.
- Garde-fous : question de 500 caractères max, 20 questions/heure par IP, 6 derniers échanges, température 0,3, réponse de 400 tokens max, délai de 20 s, Markdown retiré, **toute adresse web absente de la base est supprimée** de la réponse.
- Si l'API est indisponible : code 503 et le front affiche `chatbot.horsLigne` avec les boutons CV Général FR et EN.
- **Le chatbot répond à toutes les questions sur le contenu du site.** Sa base de connaissances est **générée automatiquement** à partir de deux sources :
  1. `content/base-connaissances-chatbot.md` (consignes et présentation) ;
  2. `content/contenu.json` : projets avec leurs liens, compétences, méthode, engagements, disponibilité, contact, outils des bandeaux.
- La **commande Django** `python manage.py construire_base_chatbot` assemble les deux sources en **un seul texte**, en ne gardant de `contenu.json` que ce qui n'est pas déjà dans le fichier `.md` (pas de doublons), et écrit aussi la copie de `contenu.json`. Elle se lance **sur le Mac, avant de pousser**, après chaque modification de `content/` ; des tests échouent si on l'oublie.
- Les **boutons d'action** sont choisis par des règles de mots-clés (`chatbot/actions.py`), jamais par l'IA : 2 au maximum, parmi `chatbot.actions` ; CV en anglais si la question est en anglais.
- Les consignes ne changent pas : **ne rien inventer**, **pas de note ni de pourcentage**. **Téléphone** : jamais affiché sur le site ; le chatbot le donne uniquement si on le lui demande. Le numéro est seulement dans `base-connaissances-chatbot.md` (côté serveur), jamais dans `contenu.json`, qui est intégré au code du front. Les liens ne sont jamais produits par l'IA : les boutons d'action restent des identifiants fixes de `chatbot.actions`.

## Repli hors ligne (obligatoire)
| Fonction | Si l'API ne répond pas |
|---|---|
| Terminal | affiche `profilApi` de `contenu.json` |
| Projets | affiche `projets` de `contenu.json` |
| Chatbot | message `horsLigne` (avec l'email) + boutons CV Général FR et EN |
| Formulaire | message d'erreur + lien `mailto:` (texte saisi conservé) |

## Hébergement
- **Vercel**, deux projets reliés au même dépôt GitHub :
  1. `portfolio-binetou` : dossier racine `frontend/` (détection Vite automatique).
  2. `portfolio-binetou-api` : dossier racine `backend/` (Vercel détecte Django automatiquement grâce à `manage.py`, sans configuration).
- **Neon** : une base PostgreSQL gratuite (Francfort) ; la chaîne **pooled** va dans `DATABASE_URL` du projet API.
- En ligne : https://portfolio-binetou.vercel.app et https://portfolio-binetou-api.vercel.app
- Voir `docs/05-deploiement.md`.

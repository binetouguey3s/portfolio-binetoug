# 03 — Architecture technique

## Dépôt (monorepo GitHub : `portfolio-binetou`)
```
portfolio-binetou/
├── CLAUDE.md                ← règles du projet (copié depuis le pack)
├── content/                 ← contenu.json, base-connaissances-chatbot.md
├── design/                  ← tokens.css, maquette-captures/, maquette-html/
├── docs/                    ← ces documents
├── assets/                  ← sources (logos, photos, arbre, CV)
├── frontend/                ← React + Vite + TypeScript
│   ├── public/              ← favicon, cv/, images optimisées, videos/
│   └── src/
│       ├── main.tsx, App.tsx
│       ├── lib/             ← gsap.ts (plugins), lenis.ts, api.ts
│       ├── hooks/           ← useTheme, useReducedMotion, useMagnetic, useCountUp
│       ├── types/content.ts
│       ├── components/      ← Glass, Button, Chip, Rings, Marquee, ThemeToggle…
│       ├── sections/        ← Navbar, Hero, Stats, About, Skills, Projects, Method, Chatbot, Contact, ToolsMarquee, Footer
│       └── styles/index.css ← @import "tailwindcss"; tokens; @theme
└── backend/                 ← Django + DRF
    ├── manage.py
    ├── requirements.txt
    ├── config/              ← settings.py, urls.py, wsgi.py
    ├── portfolio/           ← modèles Project, ContactMessage ; vues profil, projets, contact
    └── chatbot/             ← vue chat (GroqCloud), chargement de la base de connaissances
```

## Front
- Vite + React + TypeScript. Tailwind CSS v4 (`@tailwindcss/vite`), thème branché sur les variables de `tokens.css` via `@theme` (ex. `--color-accent: var(--accent)`), variante `dark` non utilisée : le thème passe par `data-theme`.
- Le contenu vient de `content/contenu.json` (importé au build). Les projets peuvent aussi venir de l'API ; en cas d'échec, on garde le JSON.
- Variables d'environnement Vite : `VITE_API_URL` (URL de l'API Django).
- Script anti-flash dans `index.html` : lit `localStorage.theme` ou `prefers-color-scheme` et pose `data-theme` avant le premier rendu.

## API Django (préfixe `/api/`)
| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/profil/` | JSON du terminal (identique à `profilApi` de `contenu.json`) |
| GET | `/api/projets/` | liste des projets (modèle `Project`, gérable dans l'admin Django) |
| POST | `/api/contact/` | enregistre un `ContactMessage` (nom, email, message), anti-spam (champ piège + limite de débit DRF), notification email optionnelle |
| POST | `/api/chat/` | `{ "message": "…", "history": [...] }` → réponse du modèle (option : flux en `text/event-stream`) |
| GET | `/api/sante/` | vérification simple (le front l'utilise pour savoir si l'API répond) |
| — | `/admin/` | administration Django (projets, messages reçus) |

Réglages :
- `DATABASE_URL` (Neon, avec `sslmode=require`) lu par `dj-database-url` ; pilote `psycopg[binary]`.
- `django-cors-headers` : autoriser seulement l'URL du front (`CORS_ALLOWED_ORIGINS`).
- `DEBUG=False` en production, `SECRET_KEY` et `ALLOWED_HOSTS` en variables d'environnement.
- Fichiers statiques de l'admin : `STATIC_ROOT` + WhiteNoise.

## Chatbot « Binetou IA »
- Contexte : `content/base-connaissances-chatbot.md` (copié dans `backend/chatbot/data/`), envoyé en message système avec les consignes du haut du fichier. Le fichier est court : **pas besoin de base vectorielle**, tout tient dans le contexte.
- Fournisseur : API GroqCloud (compatible OpenAI) via `httpx` ; variables `GROQ_API_KEY`, `GROQ_MODEL` (choisir un modèle Llama récent listé dans la console Groq).
- Garde-fous : longueur maximale de la question (500 caractères), limite de débit par IP, historique limité aux 6 derniers échanges, température basse (0,3), délai d'attente de 20 s.
- Si l'API est indisponible ou dépasse le délai : le front affiche `chatbot.horsLigne`.

## Repli hors ligne (obligatoire)
| Fonction | Si l'API ne répond pas |
|---|---|
| Terminal | affiche `profilApi` de `contenu.json` |
| Projets | affiche `projets` de `contenu.json` |
| Chatbot | message `horsLigne` + lien email |
| Formulaire | message d'erreur + lien `mailto:` |

## Hébergement
- **Vercel**, deux projets reliés au même dépôt GitHub :
  1. `portfolio-binetou` : dossier racine `frontend/` (détection Vite automatique).
  2. `portfolio-binetou-api` : dossier racine `backend/` (Vercel détecte Django automatiquement grâce à `manage.py`, sans configuration).
- **Neon** : une base PostgreSQL gratuite ; la chaîne de connexion va dans `DATABASE_URL` du projet API.
- Voir `docs/05-deploiement.md`.

# 05 — Comptes, outils et déploiement

## Avant de commencer (une seule fois)
| Outil | Pourquoi | Comment vérifier |
|---|---|---|
| Node.js 20 ou plus récent | front React | `node -v` |
| Python 3.12 ou plus récent | back Django | `python --version` |
| Git | versions du code | `git --version` |
| VS Code + extension Claude Code | coder avec Claude | panneau Claude visible dans VS Code |
| Compte GitHub (binetouguey3s) | héberger le code | — |
| Compte Vercel (connexion avec GitHub) | mise en ligne gratuite | — |
| Compte Neon | base PostgreSQL gratuite | — |
| Compte GroqCloud | clé API du chatbot (offre gratuite) | console.groq.com → API Keys |

## Installer le pack
1. Crée le dossier `portfolio-binetou` et décompresse le pack dedans (CLAUDE.md doit être à la racine).
2. `git init`, puis crée le dépôt `portfolio-binetou` sur GitHub et pousse-le.
3. Ouvre le dossier dans VS Code et suis `docs/04-prompts-claude-code.md`.

## Variables d'environnement
**Back-end** (`backend/.env` en local, et dans Vercel pour le projet API) :
| Variable | Exemple / source |
|---|---|
| `SECRET_KEY` | longue chaîne aléatoire (Claude Code peut la générer) |
| `DEBUG` | `True` en local, `False` en production |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1,.vercel.app` |
| `DATABASE_URL` | chaîne Neon (`postgresql://…?sslmode=require`) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,https://<ton-front>.vercel.app` |
| `GROQ_API_KEY` | clé GroqCloud |
| `GROQ_MODEL` | nom d'un modèle Llama récent listé dans la console Groq |
| `CONTACT_NOTIFY_EMAIL` (option) | `binetouguey3s@gmail.com` |

**Front-end** (`frontend/.env.local`, et dans Vercel pour le projet front) :
| Variable | Exemple |
|---|---|
| `VITE_API_URL` | `http://localhost:8000` en local, `https://<ton-api>.vercel.app` en production |

Ne jamais pousser de fichier `.env` sur GitHub.

## Neon
1. Crée un projet « portfolio-binetou », région la plus proche (Europe).
2. Copie la chaîne de connexion dans `DATABASE_URL`.
3. Depuis `backend/` : `python manage.py migrate`, puis la commande de chargement des projets, puis `python manage.py createsuperuser` pour l'admin.

## Vercel
1. **Projet API** : « Add New Project » → dépôt `portfolio-binetou` → Root Directory `backend` → Vercel détecte Django automatiquement → ajoute les variables du back → Deploy. Teste `https://<api>.vercel.app/api/sante/`.
2. **Projet front** : nouveau projet sur le même dépôt → Root Directory `frontend` → preset Vite → variable `VITE_API_URL` = URL de l'API → Deploy.
3. Mets à jour `CORS_ALLOWED_ORIGINS` du projet API avec l'URL finale du front, puis redéploie l'API.
4. Chaque `git push` sur `main` redéploie automatiquement les deux projets.

## Nom de domaine (option)
Sans nom de domaine, l'adresse sera du type `portfolio-binetou.vercel.app` : c'est gratuit et parfait pour commencer. Un domaine personnel (ex. `binetougueye.dev`) pourra être ajouté plus tard dans Vercel → Settings → Domains.

## Avant la venue des recruteurs
- [ ] Liens de tous les projets renseignés dans `contenu.json` (champs `A_COMPLETER`)
- [ ] Lien de l'application Sen Suivi et vidéo de présentation en place
- [ ] Les 3 CV se téléchargent
- [ ] Le formulaire arrive bien dans l'admin
- [ ] Le chatbot répond (et affiche le message de repli si on coupe la clé)
- [ ] Testé sur un vrai téléphone, en mode sombre et en mode clair
- [ ] Lien du portfolio ajouté au CV, à LinkedIn et au profil GitHub

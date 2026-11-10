# 06 — Recette du site en production

Document vivant : à compléter à chaque nouvelle vérification (ajouter une ligne dans l'historique en bas).

- **Site** : https://portfolio-binetou.vercel.app
- **API** : https://portfolio-binetou-api.vercel.app
- **Admin** : https://portfolio-binetou-api.vercel.app/admin/

## Recette du 10 novembre 2026 (étape 18)

Testé sur le site en production, en mobile (390 px) et desktop (1440 px), en mode sombre et en mode clair.
Résultat : **aucun bug trouvé, aucune correction de code nécessaire.**

| Élément | Résultat | Correction faite |
|---|---|---|
| Liens internes (7 ancres : accueil, à propos, compétences, projets, méthode, Binetou IA, contact) | ✓ chaque ancre mène à sa section ; le menu mobile se referme après le clic | — |
| Liens externes (11 projets et réalisations, GitHub, LinkedIn) | ✓ les 14 adresses répondent ; nouvel onglet avec `rel="noopener noreferrer"` | — |
| Lien email (`mailto:`) | ✓ adresse correcte (footer, contact, chatbot) | — |
| 3 CV × 2 langues | ✓ les 6 PDF répondent, identiques aux originaux ; menu « Télécharger mon CV » avec 6 liens FR/EN, Échap referme | — |
| Menu desktop (5 liens + « Demander à Binetou IA ») | ✓ ; la barre se cache en descendant et revient en remontant (voulu) | — |
| Menu mobile | ✓ ouverture, fermeture par Échap, liens fonctionnels | — |
| Bouton de thème | ✓ desktop et mobile ; choix gardé après rechargement | — |
| « Voir mes projets », « Retour en haut » | ✓ | — |
| Vidéo Sen Suivi | ✓ 16:9 sur desktop, 9:16 sur mobile ; fermeture OK | — |
| Bulle du chat et boutons « Demander à Binetou IA » | ✓ le panneau s'ouvre, Échap le ferme | — |
| Formulaire vide | ✓ les 3 messages d'erreur de `contenu.json`, curseur sur « Nom » | — |
| Formulaire envoyé → admin | ✓ message de succès ; message reçu dans la base Neon (non lu) ; admin protégée par connexion | — |
| Chatbot 1 — suggestion « Quelle est sa stack principale ? » | ✓ réponse juste + bouton CV Général | — |
| Chatbot 2 — « Quels projets IA a-t-elle réalisés ? » | ✓ RAG, sentiment, vision, Smart-Help + bouton Voir les projets | — |
| Chatbot 3 — « What is her experience with Django? » | ✓ réponse en anglais + CV Back-End anglais | — |
| Chatbot 4 — « Comment puis-je la contacter ? » | ✓ email, formulaire, LinkedIn + boutons Email et Contact | — |
| Chatbot 5 — hors sujet (« capitale de l'Australie ») | ✓ refus poli, aucun bouton | — |
| Accessibilité (axe-core, 4 combinaisons mode × écran) | ✓ aucun problème, contrastes compris ; aucun débordement | — |
| Console du navigateur | ✓ aucune erreur | — |
| Lighthouse en ligne | mobile 94 / 100 / 100 / 100 ; desktop 97 / 100 / 100 / 100 | — |

**Remarque** : à la question 4, le chatbot propose « vous aider à rédiger un email », ce qu'il ne fait pas vraiment.
Pas bloquant ; une consigne peut être ajoutée dans `content/base-connaissances-chatbot.md` si besoin.

## Reste à faire

- [ ] Se connecter à l'admin et supprimer le message « Recette étape 18 »
- [ ] Tester sur un vrai téléphone, en mode sombre et en mode clair
- [ ] Renseigner le lien de l'application Sen Suivi (`projets.vedette.lienApplication`, encore `A_COMPLETER` : bouton masqué)
- [ ] Renseigner le lien de la maquette JOJ Dakar 2026 (vide : bouton masqué)
- [ ] Ajouter https://portfolio-binetou.vercel.app au CV, à LinkedIn et au profil GitHub

## Refaire une recette

À chaque modification importante, revérifier au minimum :
1. `https://portfolio-binetou-api.vercel.app/api/sante/` répond `{"statut":"ok","base":"ok"}`.
2. Le terminal, la galerie, le chatbot et le formulaire fonctionnent sur le site.
3. Les liens de projets et les 6 CV s'ouvrent.
4. Mobile et desktop, mode sombre et mode clair.

Après une modification de `content/` : lancer `python manage.py construire_base_chatbot` dans `backend/` avant de pousser ;
si des projets ont changé, les recharger sur Neon avec `charger_projets` (ou les modifier dans l'admin).

## Historique

| Date | Vérification | Résultat |
|---|---|---|
| 10/11/2026 | Recette complète (étape 18) | tout ✓, aucune correction |

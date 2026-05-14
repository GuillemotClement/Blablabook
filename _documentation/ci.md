# Documentation CI GitHub Actions

La CI est decoupee en 4 workflows GitHub Actions, avec un fichier par responsabilite.

Ces workflows se lancent automatiquement sur :

- les pull requests vers `dev`
- les pull requests vers `main`
- les pushs sur `dev`
- les pushs sur `main`

Si un job echoue, GitHub affiche un check en erreur sur la PR. Selon les protections de branches configurees, cela peut bloquer le merge.

## Frontend CI

Fichier : `.github/workflows/frontend.yml`

Cette CI verifie que le frontend React/Vite peut etre installe et compile.

Elle lance principalement :

- `npm ci` dans le dossier `frontend`
- `npm run build` dans le dossier `frontend`

Elle publie aussi le dossier `frontend/dist` comme artifact GitHub, ce qui permet de recuperer le build genere depuis la page du workflow.

Si cette CI echoue, le probleme vient generalement du frontend : erreur TypeScript, build Vite casse, dependance manquante ou variable d'environnement necessaire au build.

## Backend CI

Fichier : `.github/workflows/backend.yml`

Cette CI verifie que le backend NestJS peut etre installe et compile.

Elle lance principalement :

- `npm ci` dans le dossier `backend`
- `npm run build` dans le dossier `backend`

Si cette CI echoue, le probleme vient generalement du backend : erreur TypeScript, build NestJS casse, import invalide ou dependance manquante.

## Docker CI

Fichier : `.github/workflows/docker.yml`

Cette CI verifie que les services principaux demarrent correctement ensemble avec Docker Compose.

Elle lance :

- PostgreSQL
- le backend
- le frontend

Puis elle controle que chaque service repond :

- Postgres avec `pg_isready`
- backend avec `http://localhost:3000/health`
- frontend avec `http://localhost:5173`

Si cette CI echoue, le probleme vient souvent de l'integration entre les services : variable d'environnement incorrecte, container qui ne demarre pas, migration backend en erreur, ou service inaccessible.

## Lighthouse

Fichier : `.github/workflows/lighthouse.yml`

Cette CI mesure la qualite des pages frontend avec Lighthouse.

Elle lance les audits en deux versions :

- desktop
- mobile

Les seuils minimums sont fixes a 95 pour chaque categorie Lighthouse :

- Performance
- Accessibilite
- Bonnes pratiques
- SEO

Les pages principales de l'application sont auditees, puis un commentaire est ajoute automatiquement sur la PR avec :

- les scores par page
- les liens vers les rapports Lighthouse HTML
- les assertions en echec si une categorie passe sous 95

Si cette CI echoue, cela signifie qu'au moins une page auditee a un score Lighthouse inferieur au seuil attendu.

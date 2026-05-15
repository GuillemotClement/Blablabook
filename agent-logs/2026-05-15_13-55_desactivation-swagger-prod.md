# Tâche : desactivation-swagger-prod

Date de réalisation : 2026-05-15 13:55

## Objectif

Desactiver Swagger en production et le laisser disponible uniquement en environnement de developpement.

## Modifications effectuées

- Ajout d'une condition autour de l'initialisation Swagger.
- Swagger est maintenant monte sur `/api` uniquement quand `NODE_ENV === 'dev'`.
- En production (`NODE_ENV=prod`), la documentation Swagger n'est pas exposee.

## Fichiers créés

- `agent-logs/2026-05-15_13-55_desactivation-swagger-prod.md`

## Fichiers modifiés

- `backend/src/main.ts`

## Tests effectués

- `npm run build` dans `backend`
  - Resultat: build OK, 0 erreur TypeScript.
- `npm test` dans `backend`
  - Resultat: 12 suites OK, 86 tests OK.

## Remarques

- Le projet utilise deja `NODE_ENV === 'prod'` pour d'autres comportements de securite, notamment les cookies secure et la configuration SSL de la base.
- La convention retenue est donc `NODE_ENV=dev` pour activer Swagger.

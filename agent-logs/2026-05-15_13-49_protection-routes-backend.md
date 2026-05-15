# Tâche : protection-routes-backend

Date de réalisation : 2026-05-15 13:49

## Objectif

Proteger les routes backend par defaut, tout en laissant accessibles sans authentification le healthcheck et les routes necessaires a l'authentification.

## Modifications effectuées

- Ajout d'un decorateur `@Public()` pour declarer les routes publiques.
- Enregistrement de `AuthGuard` comme guard global via `APP_GUARD`.
- Ajout du support des routes publiques dans `AuthGuard`.
- Marquage de `POST /auth/register`, `POST /auth/login` et `GET /health` comme routes publiques.
- Conservation de `POST /auth/logout` comme route protegee.
- Mise a jour des healthchecks Docker pour utiliser `/health`.
- Ajout d'un test unitaire verifiant qu'une route publique bypass le guard sans cookies.
- Ajout d'une documentation de test manuel.

## Fichiers créés

- `backend/src/auth/public.decorator.ts`
- `documentation/test-protection-routes-backend.md`
- `agent-logs/2026-05-15_13-49_protection-routes-backend.md`

## Fichiers modifiés

- `backend/src/app.controller.ts`
- `backend/src/auth/auth.controller.ts`
- `backend/src/auth/auth.guard.ts`
- `backend/src/auth/auth.guard.spec.ts`
- `backend/src/auth/auth.module.ts`
- `docker-compose.yml`
- `docker-compose.prod.yml`

## Tests effectués

- `npm run build` dans `backend`
  - Resultat: build OK, 0 erreur TypeScript.
- `npm test -- auth.guard.spec.ts` dans `backend`
  - Resultat: 1 suite OK, 7 tests OK.
- `npm test` dans `backend`
  - Resultat: 12 suites OK, 86 tests OK.

## Remarques

- Les tests Supertest ont necessite une execution avec autorisation car ils ouvrent un serveur HTTP local.
- `GET /` est maintenant protege; seul `GET /health` reste public pour le healthcheck.
- Le worktree contenait deja des changements non lies dans `documentation/` et `agent_logs/`; ils n'ont pas ete modifies pour cette evolution.

# Tâche : configuration-jwt

Date de réalisation : 2026-05-15 17:54

## Objectif

Mettre en place une configuration JWT correcte en supprimant le fallback hardcode et en rendant le secret obligatoire.

## Modifications effectuées

- Ajout d'un helper `getJwtSecret()` pour valider `JWT_SECRET`.
- Suppression du fallback `mimixlatrix` dans le module JWT.
- Validation du secret JWT au demarrage:
  - variable obligatoire;
  - longueur minimale de 32 caracteres;
  - rejet des valeurs par defaut connues.
- Modification du guard pour utiliser la configuration globale du `JwtModule` lors de la verification des JWT.
- Mise a jour de `.env.example` avec un placeholder non utilisable.
- Ajout d'une indication de generation de secret JWT dans la documentation de test manuel.
- Ajout de tests unitaires pour la validation du secret JWT.

## Fichiers créés

- `backend/src/auth/jwt.config.ts`
- `backend/src/auth/jwt.config.spec.ts`
- `agent-logs/2026-05-15_17-54_configuration-jwt.md`

## Fichiers modifiés

- `backend/src/auth/auth.module.ts`
- `backend/src/auth/auth.guard.ts`
- `.env.example`
- `documentation/test-protection-routes-backend.md`

## Tests effectués

- `npm run build` dans `backend`
  - Resultat: build OK, 0 erreur TypeScript.
- `npm test -- jwt.config.spec.ts auth.guard.spec.ts token.service.spec.ts`
  - Resultat: 3 suites OK.
- `npm test` dans `backend`
  - Resultat: 13 suites OK, 90 tests OK.

## Remarques

- L'application refuse maintenant de demarrer si `JWT_SECRET` est absent, trop court ou egal a une valeur par defaut connue.
- Pour le developpement local, generer une valeur avec `openssl rand -hex 32` et la placer dans `.env`.

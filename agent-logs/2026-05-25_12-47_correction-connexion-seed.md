# Tâche : correction-connexion-seed

Date de réalisation : 2026-05-25 12:47

## Objectif
Corriger le problème de connexion à la base de données lors de l'exécution du script `seed.ts`.

## Modifications effectuées
- Chargement du fichier `.env` avant l'import de la connexion Drizzle.
- Remplacement automatique de l'hôte Docker `postgres:5432` par `localhost:5433` quand le seed est lancé hors conteneur.
- Ajout d'une erreur explicite si `DATABASE_URL` est absente.

## Fichiers créés
- agent-logs/2026-05-25_12-47_correction-connexion-seed.md

## Fichiers modifiés
- backend/src/seed.ts

## Tests effectués
- Tests à lancer après modification.

## Remarques
- Dans Docker, l'URL `postgres:5432` reste utilisée.
- Depuis la machine hôte, le port publié par `docker-compose.yml` est `localhost:5433`.

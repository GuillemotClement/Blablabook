# Tâche : populaires-annee-openlibrary

Date de réalisation : 2026-05-25 11:17

## Objectif
Simplifier le script Open Library pour récupérer uniquement 50 livres parmi les plus populaires sur l'année en cours.

## Modifications effectuées
- Suppression de la configuration multi-périodes.
- Utilisation fixe de l'endpoint annuel Open Library `/trending/yearly.json`.
- Mise à jour de la description générée pour refléter le classement annuel.

## Fichiers créés
- agent-logs/2026-05-25_11-17_populaires-annee-openlibrary.md

## Fichiers modifiés
- backend/src/fetch-open-library-top-books.ts

## Tests effectués
- Aucun test lancé

## Remarques
- Le script conserve le paramètre optionnel `--limit`, avec une valeur par défaut à 50.
- La sortie JSON reste générée dans `backend/src/seeds/open-library-top-books.json` par défaut.

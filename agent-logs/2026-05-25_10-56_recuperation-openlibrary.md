# Tâche : recuperation-openlibrary

Date de réalisation : 2026-05-25 10:56

## Objectif
Mettre en place un script permettant de récupérer les 50 livres les plus demandés depuis l'API Open Library afin de préparer un futur seed de données initiales.

## Modifications effectuées
- Ajout d'un script backend de récupération des livres tendance Open Library.
- Ajout d'une commande npm dédiée pour exécuter le script.
- Préparation d'une sortie JSON compatible avec les champs livre existants du backend.

## Fichiers créés
- backend/src/fetch-open-library-top-books.ts
- agent-logs/2026-05-25_10-56_recuperation-openlibrary.md

## Fichiers modifiés
- backend/package.json

## Tests effectués
- `npm run build`
- Résultat obtenu : commande non lancée, autorisation refusée.

## Remarques
- Le script utilise l'endpoint JSON `/trending/{period}.json` d'Open Library.
- Le `User-Agent` peut être personnalisé avec la variable d'environnement `OPEN_LIBRARY_USER_AGENT`.
- Les livres sans ISBN reçoivent un identifiant stable basé sur leur clé Open Library pour rester insérables dans la colonne `isbn`.

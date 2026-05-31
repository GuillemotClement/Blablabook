# Tache : simplification-diagramme-login

Date de realisation : 2026-05-29 15:53

## Objectif
Simplifier le diagramme d'authentification pour ne conserver que la partie login avec la creation des tokens.

## Modifications effectuees
- Remplacement du diagramme detaille login/guard/rotation/deconnexion par une version centree sur `POST /auth/login`.
- Conservation des etapes essentielles : route publique, validation utilisateur, verification du mot de passe, generation du JWT, generation du refresh token, hash en base, pose des cookies et stockage Zustand.

## Fichiers crees
- agent-logs/2026-05-29_15-53_simplification-diagramme-login.md

## Fichiers modifies
- documentation/diagramme_auth_guard_tokens.puml

## Tests effectues
- Aucun test lance.

## Remarques
- La partie guard/refresh automatique a ete retiree du diagramme pour garder un schema plus simple a integrer dans le dossier de projet.

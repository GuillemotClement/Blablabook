# Tâche : tests-auth-guard

Date de réalisation : 2026-05-30 15:25

## Objectif
Ajouter des tests unitaires pour `auth.guard` afin d'améliorer la couverture des statements sur les cas JWT valide, JWT expiré avec refresh valide, et JWT expiré avec refresh invalide.

## Modifications effectuées
- Ajout de tests pour les principaux chemins de `AuthGuard.canActivate`.
- Ajout d'un helper de contexte HTTP mocké pour centraliser la création de request/response.
- Ajout d'assertions sur la mise à jour de la request, la rotation des tokens, l'écriture des cookies et le nettoyage des cookies en échec.

## Fichiers créés
- `agent-logs/2026-05-30_15-25_tests-auth-guard.md`

## Fichiers modifiés
- `backend/src/auth/auth.guard.spec.ts`

## Tests effectués
- `npm test -- auth.guard.spec.ts --runInBand`
- Résultat obtenu : échec sous PowerShell/CMD car le répertoire courant était un chemin UNC WSL non supporté, et `jest` n'a pas été résolu.
- `wsl -d FedoraLinux-44 -- bash -lc "cd /home/gizmo/projects/Blablabook/backend && npm test -- auth.guard.spec.ts --runInBand"`
- Résultat obtenu : succès, 1 suite passée, 10 tests passés.

## Remarques
- Les tests ajoutés ciblent uniquement le guard et ses dépendances mockées.

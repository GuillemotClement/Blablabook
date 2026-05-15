# Instructions Codex

## Journalisation obligatoire

À chaque tâche ou modification réalisée, créer un nouveau fichier Markdown dans le dossier :

`agent-logs/`

Le fichier doit être nommé avec ce format :

`YYYY-MM-DD_HH-mm_nom-de-la-tache.md`

Exemple :

`2026-05-15_14-30_ajout-authentification.md`

## Contenu obligatoire du fichier de log

Chaque fichier doit contenir :

```md
# Tâche : <nom de la tâche>

Date de réalisation : <YYYY-MM-DD HH:mm>

## Objectif
Décrire brièvement la demande.

## Modifications effectuées
- Liste des fichiers modifiés
- Résumé des changements

## Fichiers créés
- ...

## Fichiers modifiés
- ...

## Tests effectués
- Commandes lancées
- Résultat obtenu

## Remarques
- Points d’attention
- Prochaines étapes éventuelles
````

## Règles
- Ne jamais modifier le projet sans créer un fichier de log.
- Créer un fichier de log distinct pour chaque évolution.
- Le nom de la tâche doit être court, en minuscules, sans accents, avec des tirets.
- Toujours utiliser la date et l’heure réelles de réalisation.
- Si aucun test n’a été lancé, écrire clairement : “Aucun test lancé”.
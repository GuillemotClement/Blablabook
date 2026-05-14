# Correction des tests front

## 2026-05-14 - Tests de recherche

Commande lancee : `npm test -- --run` dans `frontend`.

Tests echoues :
- `src/components/AddBookModal.test.tsx > triggers search refetch when clicking search`
- `src/components/AddBookModal.test.tsx > shows empty state after search with no results`
- `src/pages/LibraryPage.test.tsx > filters by search input`

Probleme constate :
Les tests cherchaient l'ancien placeholder `Rechercher un livre...`, alors que l'interface affiche maintenant `Nom du livre, auteur...` dans la modale et `Rechercher dans ma bibliotheque...` dans la page bibliotheque.

Corrections effectuees :
- Ajout d'un `aria-label` au champ de recherche de `AddBookModal` pour rendre le champ identifiable de maniere accessible.
- Mise a jour des tests de `AddBookModal` pour cibler le champ par role et nom accessible.
- Mise a jour du test de `LibraryPage` pour cibler le champ par role et nom accessible, comme le composant `SearchBar` le permet deja.
- Ajout d'une attente `waitFor` dans le test de filtrage de `LibraryPage`, car `SearchBar` applique un debounce avant de transmettre la recherche.

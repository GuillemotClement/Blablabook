# Tâche : correction-idor-bibliotheque

Date de réalisation : 2026-05-15 18:16

## Objectif

Corriger l'IDOR des routes bibliotheque en utilisant l'identifiant utilisateur extrait du JWT au lieu du `userId` fourni par le client.

## Modifications effectuées

- Ajout d'un decorateur `@CurrentUserId()` pour recuperer `request.user.sub`.
- Modification des routes bibliotheque backend:
  - `GET /books/library`
  - `POST /books/library`
  - `DELETE /books/library/book/:bookId`
  - `PATCH /books/library/book/:bookId/status`
- Suppression de `:userId` dans les routes bibliotheque exposees.
- Mise a jour des appels frontend pour ne plus envoyer le `userId` dans l'URL.
- Mise a jour des tests frontend et backend.
- Mise a jour du fichier HTTP manuel backend.
- Mise a jour de la documentation de test manuel.

## Fichiers créés

- `backend/src/auth/current-user-id.decorator.ts`
- `agent-logs/2026-05-15_18-16_correction-idor-bibliotheque.md`

## Fichiers modifiés

- `backend/src/books/books.controller.ts`
- `backend/src/books/books.controller.spec.ts`
- `backend/http_test/book.http`
- `frontend/src/api/books.ts`
- `frontend/src/api/books.test.ts`
- `frontend/src/hooks/useUserBooks.ts`
- `frontend/src/hooks/useUserBooks.test.tsx`
- `frontend/src/hooks/useAddBook.ts`
- `frontend/src/hooks/useAddBook.test.tsx`
- `frontend/src/components/AddBookModal.tsx`
- `frontend/src/pages/Book/BookDetails.tsx`
- `documentation/test-protection-routes-backend.md`

## Tests effectués

- `npm run build` dans `backend`
  - Resultat: build OK, 0 erreur TypeScript.
- `npm test -- books.controller.spec.ts` dans `backend`
  - Resultat: 1 suite OK, 14 tests OK.
- `npm test` dans `backend`
  - Resultat: 13 suites OK, 91 tests OK.
- `npm test -- src/api/books.test.ts src/hooks/useUserBooks.test.tsx src/hooks/useAddBook.test.tsx` dans `frontend`
  - Resultat: 3 suites OK, 16 tests OK.
- `npm test` dans `frontend`
  - Resultat: 9 suites OK, 58 tests OK.
- `npm run build` dans `frontend`
  - Resultat: echec sur `frontend/src/components/Footer.tsx` car `Mail` est importe mais non utilise.

## Remarques

- L'echec du build frontend est lie a une modification preexistante dans `Footer.tsx`, pas a la correction des routes bibliotheque.
- Le frontend conserve `userId` dans certains hooks uniquement pour activer les requetes et nommer les caches TanStack Query; cet id n'est plus envoye au backend comme source d'autorisation.

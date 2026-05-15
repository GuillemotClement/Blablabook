# Rapport de securite - Blablabook

Date du scan: 2026-05-15
Branche: `fix/faille_secure`
Portee: analyse statique du backend NestJS, du frontend React/Vite, de la configuration Docker et des dependances npm de production.

## Resume executif

Le projet expose plusieurs routes backend qui manipulent des donnees utilisateur a partir d'un identifiant fourni dans l'URL, sans garde d'authentification ni verification que l'identifiant correspond a l'utilisateur connecte. Les failles les plus importantes sont donc des IDOR / controles d'acces manquants: lecture, modification et suppression de comptes, ainsi que lecture et modification de bibliotheques d'autres utilisateurs.

L'audit `npm audit --omit=dev --audit-level=moderate` a ete execute pour `backend` et `frontend`: aucune vulnerabilite de dependance de production n'a ete signalee.

## Modele de menace

Surfaces principales:

- API backend NestJS exposee sur HTTP, avec cookies `jwt_cookie` et `refresh_cookie`.
- Frontend React qui consomme l'API avec `withCredentials: true`.
- Base PostgreSQL contenant comptes, mots de passe hashes, bibliotheques, livres, categories et refresh tokens.
- Configuration Docker / environnement contenant URL de base de donnees, secret JWT et CORS.

Acteurs pris en compte:

- Visiteur non authentifie.
- Utilisateur authentifie standard.
- Site tiers capable de declencher des requetes navigateur, mais limite par `sameSite: strict` sur les cookies.
- Operateur/deploiement qui pourrait lancer l'app avec des variables manquantes ou faibles.

Invariants de securite attendus:

- Un utilisateur ne doit pas lire, modifier ou supprimer le compte d'un autre utilisateur.
- Un utilisateur ne doit pas lire ou modifier la bibliotheque d'un autre utilisateur.
- Les tokens JWT doivent etre signes avec un secret fort et obligatoire.
- Les endpoints de documentation ou de debug ne doivent pas exposer inutilement la surface d'attaque en production.

## Faille 1 - Routes utilisateur sans authentification ni autorisation

Severite: Critique
CWE: CWE-862 Missing Authorization, CWE-639 Authorization Bypass Through User-Controlled Key
Statut: Confirmee par trace statique

### Emplacements affectes

- `backend/src/user/user.controller.ts:19` - `GET /user/:id`
- `backend/src/user/user.controller.ts:27` - `PATCH /user/:id`
- `backend/src/user/user.controller.ts:42` - `PATCH /user/:id/soft-delete`
- `backend/src/user/user.service.ts:86` - mise a jour directe du compte cible
- `backend/src/user/user.service.ts:117` - suppression logique directe du compte cible

### Chemin d'attaque

Un attaquant envoie directement une requete HTTP vers `/user/2`, `/user/2` en `PATCH`, ou `/user/2/soft-delete`. Le controleur ne declare aucun `@UseGuards(AuthGuard)` et ne compare jamais `request.user.sub` avec le `:id` de l'URL. Le service applique ensuite l'operation sur l'identifiant fourni.

Impact concret:

- Lecture de l'email, username et image d'un autre compte.
- Modification du profil d'un autre compte.
- Changement possible du mot de passe d'un autre compte via `PATCH /user/:id`, ce qui peut mener a une prise de controle.
- Suppression logique du compte d'un autre utilisateur via `PATCH /user/:id/soft-delete`.

### Preuve

Le controleur importe seulement `Controller`, `Get`, `Patch`, `Body`, `Param` et `ParseIntPipe`; il n'importe pas `UseGuards` ni `AuthGuard`. Les methodes recoivent uniquement `@Param('id') id` et transmettent cet id au service.

Le service execute:

- `db.update(user).set(updateData).where(and(eq(user.id, id), isNull(user.deletedAt)))`
- `db.update(user).set({ deletedAt: new Date() }).where(eq(user.id, id))`

Aucun controle d'identite ou de role n'est present sur ce chemin.

### Correction recommandee

- Ajouter `@UseGuards(AuthGuard)` sur le controleur utilisateur ou sur chaque route sensible.
- Ne plus accepter l'identite cible comme source de confiance pour les actions self-service; utiliser `request.user.sub`.
- Autoriser `:id` seulement si `request.user.sub === id`, sauf role admin explicite.
- Ajouter des tests e2e qui verifient qu'un utilisateur A ne peut pas lire, modifier ou supprimer l'utilisateur B.

## Faille 2 - Bibliotheques utilisateur accessibles et modifiables par IDOR

Severite: Haute
CWE: CWE-862 Missing Authorization, CWE-639 Authorization Bypass Through User-Controlled Key
Statut: Confirmee par trace statique

### Emplacements affectes

- `backend/src/books/books.controller.ts:50` - `GET /books/library/:userId`
- `backend/src/books/books.controller.ts:64` - `POST /books/library/:userId`
- `backend/src/books/books.controller.ts:78` - `DELETE /books/library/:userId/book/:bookId`
- `backend/src/books/books.controller.ts:93` - `PATCH /books/library/:userId/book/:bookId/status`
- `backend/src/books/books.service.ts:75` - lecture de la bibliotheque par `userId`
- `backend/src/books/books.service.ts:120` - ajout de livre pour le `userId` fourni
- `backend/src/books/books.service.ts:217` - suppression d'un livre pour le `userId` fourni
- `backend/src/books/books.service.ts:249` - modification du statut d'un livre pour le `userId` fourni

### Chemin d'attaque

Un attaquant choisit un `userId` dans l'URL et appelle les routes de bibliotheque. Le controleur ne protege pas ces endpoints avec `AuthGuard`, et le service filtre uniquement sur `list.userId = userId`. Il n'existe pas de comparaison avec l'identite authentifiee.

Impact concret:

- Lecture de la bibliotheque et des dates de lecture d'un autre utilisateur.
- Ajout de livres dans la bibliotheque d'un autre utilisateur.
- Suppression de livres dans la bibliotheque d'un autre utilisateur.
- Modification des statuts de lecture d'un autre utilisateur.

### Preuve

Le frontend lui-meme construit les appels avec un `userId` client (`frontend/src/hooks/useUserBooks.ts:21`, `:29`, `:47`), ce qui confirme que l'API considere l'id fourni comme parametre fonctionnel. Cote backend, `BooksController` transmet directement ce parametre a `BooksService`.

Le service utilise ensuite ce parametre comme racine d'autorisation:

- `.where(eq(list.userId, userId))` pour lire ou retrouver la liste.
- insertion de liste avec `userId` fourni si elle n'existe pas.
- update/delete sur `listBook` apres resolution de la liste du `userId` fourni.

### Correction recommandee

- Proteger toutes les routes `/books/library/*` avec `@UseGuards(AuthGuard)`.
- Remplacer `:userId` par l'identifiant extrait du JWT pour les operations utilisateur standard.
- Garder une route admin separee si un administrateur doit consulter une autre bibliotheque.
- Ajouter des tests e2e pour les cas utilisateur A contre utilisateur B sur lecture, ajout, suppression et changement de statut.

## Faille 3 - Secret JWT faible et fallback hardcode

Severite: Haute si deployee sans `JWT_SECRET` fort, sinon Moyenne
CWE: CWE-798 Use of Hard-coded Credentials, CWE-347 Improper Verification of Cryptographic Signature
Statut: Confirmee par trace statique

### Emplacements affectes

- `backend/src/auth/auth.module.ts:17` - fallback `process.env.JWT_SECRET || 'mimixlatrix'`
- `.env.example:14` - exemple `JWT_SECRET` faible

### Chemin d'attaque

Si l'application est lancee sans `JWT_SECRET`, elle signe les JWT avec une valeur hardcodee connue du code source. Si un deploiement copie l'exemple tel quel, le secret est egalement faible. Dans ces cas, un attaquant qui connait le secret peut forger un JWT valide contenant le `sub` et le `userRole` de son choix.

Impact concret:

- Usurpation d'identite.
- Escalade logique vers un role plus privilegie si des routes admin sont ajoutees ou deja consomment `userRole`.
- Contournement de l'authentification sur toutes les routes qui feront confiance au JWT.

### Preuve

`JwtModule.register` accepte un fallback statique si la variable d'environnement manque. La verification du guard utilise `process.env.JWT_SECRET`; le module de signature, lui, peut signer avec le fallback. Le risque principal est un deploiement mal configure ou base sur `.env.example`.

### Correction recommandee

- Supprimer le fallback hardcode et faire echouer le demarrage si `JWT_SECRET` est absent.
- Exiger un secret aleatoire long, par exemple au moins 32 octets generes aleatoirement.
- Remplacer les valeurs faibles de `.env.example` par des placeholders non utilisables, par exemple `CHANGE_ME_GENERATE_32_BYTES`.
- Ajouter une validation de configuration au bootstrap.

## Faille 4 - Swagger expose en permanence

Severite: Faible a Moyenne selon exposition production
CWE: CWE-200 Exposure of Sensitive Information to an Unauthorized Actor
Statut: Plausible, depend de l'exposition du backend

### Emplacements affectes

- `backend/src/main.ts:26` a `backend/src/main.ts:34`

### Chemin d'attaque

L'application monte Swagger sur `/api` sans condition d'environnement. Si le backend est expose publiquement en production, un attaquant obtient une carte des endpoints, schemas et operations disponibles. Cette exposition facilite particulierement l'exploitation des IDOR ci-dessus.

### Correction recommandee

- Activer Swagger seulement en developpement ou derriere une authentification.
- En production, desactiver `/api` ou le proteger par une authentification admin.

## Observations validees comme non vulnerabilites directes

- Les cookies d'authentification sont `httpOnly`, `sameSite: strict` et `secure` quand `NODE_ENV === 'prod'`, ce qui reduit fortement le risque CSRF classique.
- Les requetes SQL observees passent par Drizzle avec constructeurs types (`eq`, `and`, `ilike`) plutot que par concatenation SQL.
- `.env` est ignore par Git; seul `.env.example` est versionne.
- `npm audit --omit=dev --audit-level=moderate` ne signale aucune vulnerabilite de dependance de production pour `backend` et `frontend`.

## Priorites de remediation

1. Corriger les routes utilisateur: guard obligatoire, identite depuis le JWT, test anti-IDOR.
2. Corriger les routes bibliotheque: guard obligatoire, suppression du `userId` client pour les operations self-service, test anti-IDOR.
3. Rendre `JWT_SECRET` obligatoire et fort, sans fallback.
4. Desactiver ou proteger Swagger en production.

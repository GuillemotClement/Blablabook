# Brouillons d'issues GitHub - failles de securite

Ces brouillons correspondent aux failles documentees dans `SECURITY_FINDINGS.md`.

> Note: la creation via le connecteur GitHub a echoue avec `Resource not accessible by integration`, et `gh` n'est pas installe dans l'environnement local. Les contenus ci-dessous sont prets a etre crees comme issues GitHub.

## Issue globale

Titre:

```text
[Security] Remediation globale des failles identifiees
```

Corps:

```markdown
## Resume

Cette issue suit la remediation globale des failles de securite identifiees dans le rapport `SECURITY_FINDINGS.md`.

## Sous-issues

- [ ] Routes utilisateur sans authentification ni autorisation
- [ ] IDOR sur les routes de bibliotheque utilisateur
- [ ] Secret JWT faible et fallback hardcode
- [ ] Swagger expose en permanence

## Priorites

1. Corriger les routes utilisateur: guard obligatoire, identite depuis le JWT, test anti-IDOR.
2. Corriger les routes bibliotheque: guard obligatoire, suppression du `userId` client pour les operations self-service, test anti-IDOR.
3. Rendre `JWT_SECRET` obligatoire et fort, sans fallback.
4. Desactiver ou proteger Swagger en production.

## Definition of done

- Les routes sensibles sont protegees par `AuthGuard`.
- Les actions self-service utilisent l'identite issue du JWT, pas un id client non verifie.
- Les tests e2e couvrent les tentatives utilisateur A contre utilisateur B.
- L'application refuse de demarrer sans `JWT_SECRET` fort.
- Swagger n'est pas expose publiquement en production.
```

## Sous-issue 1

Titre:

```text
[Security] Routes utilisateur sans authentification ni autorisation
```

Corps:

```markdown
## Resume

Les routes utilisateur manipulent un compte a partir de `:id` dans l'URL sans `AuthGuard` ni verification que l'utilisateur authentifie correspond a cet id.

## Severite

Critique

## CWE

- CWE-862 Missing Authorization
- CWE-639 Authorization Bypass Through User-Controlled Key

## Emplacements affectes

- `backend/src/user/user.controller.ts:19` - `GET /user/:id`
- `backend/src/user/user.controller.ts:27` - `PATCH /user/:id`
- `backend/src/user/user.controller.ts:42` - `PATCH /user/:id/soft-delete`
- `backend/src/user/user.service.ts:86` - update direct du compte cible
- `backend/src/user/user.service.ts:117` - soft-delete direct du compte cible

## Impact

Un attaquant peut lire, modifier ou supprimer logiquement le compte d'un autre utilisateur en changeant simplement l'id dans l'URL. Le `PATCH /user/:id` permet aussi de changer le mot de passe du compte cible, ce qui peut mener a une prise de controle.

## Preuve / trace

Le controleur n'importe pas `UseGuards` ni `AuthGuard`. Les handlers recoivent `@Param('id') id` et appellent directement le service. Le service execute ensuite des operations SQL ciblees par `eq(user.id, id)` sans controle d'identite ou de role.

## Correction recommandee

- Ajouter `@UseGuards(AuthGuard)` sur le controleur ou sur chaque route sensible.
- Utiliser `request.user.sub` comme identite source pour les actions self-service.
- Autoriser `:id` seulement si `request.user.sub === id`, sauf role admin explicite.
- Ajouter des tests e2e anti-IDOR: utilisateur A ne peut pas lire, modifier ou supprimer utilisateur B.
```

## Sous-issue 2

Titre:

```text
[Security] IDOR sur les routes de bibliotheque utilisateur
```

Corps:

```markdown
## Resume

Les routes `/books/library/:userId` utilisent un `userId` fourni par le client sans authentification ni verification de propriete.

## Severite

Haute

## CWE

- CWE-862 Missing Authorization
- CWE-639 Authorization Bypass Through User-Controlled Key

## Emplacements affectes

- `backend/src/books/books.controller.ts:50` - `GET /books/library/:userId`
- `backend/src/books/books.controller.ts:64` - `POST /books/library/:userId`
- `backend/src/books/books.controller.ts:78` - `DELETE /books/library/:userId/book/:bookId`
- `backend/src/books/books.controller.ts:93` - `PATCH /books/library/:userId/book/:bookId/status`
- `backend/src/books/books.service.ts:75` - lecture par `userId`
- `backend/src/books/books.service.ts:120` - ajout pour le `userId` fourni
- `backend/src/books/books.service.ts:217` - suppression pour le `userId` fourni
- `backend/src/books/books.service.ts:249` - modification du statut pour le `userId` fourni

## Impact

Un attaquant peut lire la bibliotheque d'un autre utilisateur, y ajouter ou supprimer des livres, et modifier les statuts/dates de lecture en changeant le `userId` dans l'URL.

## Preuve / trace

`BooksController` transmet directement `@Param('userId') userId` a `BooksService`. Le service filtre ensuite sur `.where(eq(list.userId, userId))` et applique les insert/update/delete sur la liste resolue, sans verifier l'identite authentifiee.

## Correction recommandee

- Ajouter `@UseGuards(AuthGuard)` sur toutes les routes `/books/library/*`.
- Remplacer le `userId` client par `request.user.sub` pour les operations self-service.
- Prevoir une route admin separee si un admin doit consulter une autre bibliotheque.
- Ajouter des tests e2e pour utilisateur A contre utilisateur B sur lecture, ajout, suppression et changement de statut.
```

## Sous-issue 3

Titre:

```text
[Security] Secret JWT faible et fallback hardcode
```

Corps:

```markdown
## Resume

Le module JWT utilise un fallback hardcode si `JWT_SECRET` est absent, et `.env.example` fournit une valeur faible.

## Severite

Haute si l'application est deployee sans secret fort, sinon Moyenne.

## CWE

- CWE-798 Use of Hard-coded Credentials
- CWE-347 Improper Verification of Cryptographic Signature

## Emplacements affectes

- `backend/src/auth/auth.module.ts:17` - `process.env.JWT_SECRET || 'mimixlatrix'`
- `.env.example:14` - `JWT_SECRET=mimix`

## Impact

Si un deploiement oublie `JWT_SECRET` ou copie l'exemple tel quel, un attaquant peut forger des JWT valides contenant le `sub` et le `userRole` de son choix, ce qui permet une usurpation d'identite et peut devenir une escalade de privilege.

## Preuve / trace

`JwtModule.register` accepte un fallback statique connu du code source. Les exemples d'environnement utilisent aussi une valeur courte et previsible.

## Correction recommandee

- Supprimer le fallback hardcode.
- Faire echouer le demarrage si `JWT_SECRET` est absent.
- Exiger un secret aleatoire long, au moins 32 octets.
- Remplacer les valeurs faibles dans `.env.example` par un placeholder non utilisable, par exemple `CHANGE_ME_GENERATE_32_BYTES`.
- Ajouter une validation de configuration au bootstrap.
```

## Sous-issue 4

Titre:

```text
[Security] Swagger expose en permanence
```

Corps:

```markdown
## Resume

Swagger est monte sur `/api` sans condition d'environnement ni authentification.

## Severite

Faible a Moyenne selon exposition production.

## CWE

- CWE-200 Exposure of Sensitive Information to an Unauthorized Actor

## Emplacements affectes

- `backend/src/main.ts:26` a `backend/src/main.ts:34`

## Impact

Si le backend est expose publiquement en production, un attaquant obtient une carte des endpoints, schemas et operations disponibles. Cela facilite notamment l'exploitation des failles IDOR identifiees sur les routes utilisateur et bibliotheque.

## Preuve / trace

`SwaggerModule.setup('api', app, documentFactory)` est execute inconditionnellement au bootstrap.

## Correction recommandee

- Activer Swagger seulement en developpement.
- Ou proteger `/api` par une authentification admin en production.
- Verifier la configuration de deploiement pour s'assurer que la documentation n'est pas exposee publiquement.
```

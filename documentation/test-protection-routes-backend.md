# Tester manuellement la protection des routes backend

## Objectif

Verifier que les routes backend sont protegees par defaut, sauf les routes publiques attendues:

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`

Toutes les autres routes doivent refuser une requete sans cookies d'authentification valides.

## Prerequis

Verifier que `JWT_SECRET` est configure avec une valeur forte dans `.env`.

Exemple de generation locale:

```bash
openssl rand -hex 32
```

La valeur obtenue doit etre placee dans `.env`:

```env
JWT_SECRET=<valeur-generee>
```

Demarrer l'application:

```bash
docker-compose up -d
```

Verifier que le backend est disponible:

```bash
curl -i http://localhost:3000/health
```

Resultat attendu:

```http
HTTP/1.1 200 OK
```

## 1. Verifier les routes publiques

### Healthcheck

```bash
curl -i http://localhost:3000/health
```

Attendu: `200 OK`.

### Inscription

Adapter l'email et le username si l'utilisateur existe deja:

```bash
curl -i -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manual-test@example.com",
    "username": "manual-test",
    "password": "Password123!",
    "confirmPassword": "Password123!"
  }'
```

Attendu: `201 Created`, ou `422 Unprocessable Entity` si l'utilisateur existe deja. La route ne doit pas retourner `401 Unauthorized`.

### Connexion

```bash
curl -i -c /tmp/blablabook-cookies.txt -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "manual-test",
    "password": "Password123!"
  }'
```

Attendu:

- `200 OK`
- presence des cookies `jwt_cookie` et `refresh_cookie`
- le fichier `/tmp/blablabook-cookies.txt` contient les cookies pour les tests authentifies

## 2. Verifier qu'une route non publique refuse une requete anonyme

Exemple avec la route racine:

```bash
curl -i http://localhost:3000/
```

Attendu: `401 Unauthorized`.

Exemple avec une route utilisateur:

```bash
curl -i http://localhost:3000/user/1
```

Attendu: `401 Unauthorized`.

Exemple avec une route bibliotheque:

```bash
curl -i http://localhost:3000/books/library
```

Attendu: `401 Unauthorized`.

## 3. Verifier qu'une route protegee accepte une requete authentifiee

Utiliser les cookies obtenus avec la commande de connexion:

```bash
curl -i -b /tmp/blablabook-cookies.txt http://localhost:3000/user/1
```

Attendu: la requete ne doit plus echouer avec `401 Unauthorized`.

Selon l'etat de la base, elle peut retourner:

- `200 OK` si l'utilisateur existe
- `404 Not Found` si l'utilisateur n'existe pas

L'important pour ce test est de verifier que le guard global ne bloque plus la requete authentifiee.

## 4. Verifier le logout

Le logout doit rester protege car il detruit la session courante.

Sans cookies:

```bash
curl -i -X POST http://localhost:3000/auth/logout
```

Attendu: `401 Unauthorized`.

Avec cookies:

```bash
curl -i -b /tmp/blablabook-cookies.txt -X POST http://localhost:3000/auth/logout
```

Attendu: `200 OK` et suppression des cookies cote reponse.

## 5. Verifier les healthchecks Docker

Les healthchecks doivent utiliser `/health`:

```bash
docker-compose ps
```

Attendu: le service `backend` doit etre `healthy`.

Il est aussi possible d'inspecter le healthcheck:

```bash
docker inspect backend --format='{{json .State.Health}}'
```

Attendu: les logs de healthcheck appellent `http://localhost:3000/health`.

## Checklist de validation

- [ ] `GET /health` retourne `200 OK` sans cookies.
- [ ] `POST /auth/register` ne demande pas d'authentification.
- [ ] `POST /auth/login` retourne les cookies d'authentification.
- [ ] `POST /auth/logout` retourne `401` sans cookies.
- [ ] Une route non publique retourne `401` sans cookies.
- [ ] Une route protegee avec cookies valides ne retourne pas `401`.
- [ ] Le backend Docker reste `healthy`.

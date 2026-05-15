# Correction du seed backend

## 2026-05-15 - Seed compatible production

Commande concernee : `npm run seed` dans `backend`.

Problemes constates :
- Le script de seed utilisait `ts-node`, indisponible dans l'environnement de production.
- Le seed echouait avec `Cannot read properties of undefined (reading 'id')`.

Cause :
Le script associait une partie des livres a la categorie `bestsellers`, mais cette categorie n'etait pas inseree avant la creation des liaisons `book_category`.

Corrections effectuees :
- `npm run seed` execute maintenant le fichier compile `dist/seed.js`.
- Ajout de `npm run seed:dev` pour conserver l'execution TypeScript en local.
- Ajout de la categorie `bestsellers` dans les categories inserees par le seed.
- Creation des liaisons a partir des livres presents en base via leur ISBN, afin que le script soit relancable meme si les livres existent deja.
- Ajout d'erreurs explicites si une categorie ou un livre attendu est introuvable apres insertion.
- Mise a jour du README avec le flux `npm run build` puis `npm run seed`.

# T-DEV-700 Project BACK

## Commande

### ▶️ Lancer le backend

docker compose up

### Ouvrir Prisma Studio (base de données via Docker)

docker compose exec backend sh -lc "npx prisma studio --schema=prisma/schema prisma --port 5555 --hostname 0.0.0.0"

### Ouvrir Prisma Studio (base de données en local)

npx prisma studio

### Redémarrer le backend

docker compose restart backend

## Accès au services

Base de donné: http://localhost:5555

## Structure du projet

.
├── back/ (Express + PostgreSQL + Prisma)
│ ├── module
| │ ├── Auth
| │ ├── User
| │ ├── ...
│ ├── Prisma
| │ ├── schema
│ ├── db.js
│ ├── .env
│ ├── Dockerfile
│ ├── package.json
│ └── server.js

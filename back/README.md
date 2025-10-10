# T-DEV-700 Project BACK

## Commande

### ▶️ Lancer le backend

docker compose up

### Ouvrir Prisma Studio (base de données via Docker)

docker compose exec backend sh -lc 'npx prisma studio --schema=prisma/schema.prisma --port 5555 --hostname 0.0.0.0'

### Ouvrir Prisma Studio (base de données en local)

npx prisma studio

### Redémarrer le backend

docker compose restart backend

## Accès au services

Base de données (Prisma Studio) : http://localhost:5555

## Structure du projet

.
├── back/ # Dossier principal du backend (Express + PostgreSQL + Prisma)
│ ├── modules/ # Contient les différents modules métier
│ │ ├── Auth/ # Gestion de l'authentification
│ │ ├── User/ # Gestion des utilisateurs
│ │ ├── ... # Autres modules
│ ├── prisma/ # Fichiers liés à Prisma (ORM)
│ │ └── schema.prisma # Schéma de la base de données
│ ├── db.js # Connexion à la base de données
│ ├── .env # Variables d'environnement
│ ├── Dockerfile # Image Docker du backend
│ ├── package.json # Dépendances et scripts NPM
│ └── server.js # Point d'entrée principal du serveur Express

## Configuration

### Fichier .env

DATABASE_URL="postgresql://user:password@db:5432/mydatabase?schema=public"
PORT=3000
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_secret

### Outils utilisés

Node.js + Express → Framework backend
PostgreSQL → Base de données relationnelle
Prisma ORM → Gestion de la base de données
Docker / Docker Compose → Conteneurisation
JWT → Authentification sécurisée

## Commandes Prisma utiles

### Générer le client Prisma

npx prisma generate

### Appliquer les migrations

npx prisma migrate dev

### Ouvrir Prisma Studio

npx prisma studio

# T-DEV-700 Project

## Démarrer

### Lancer tous les services :

docker compose up --build

### lancer les services séparément :

docker compose up --build backend
docker compose up --build web

### Accès aux services :

Front: http://localhost:5173
API: http://localhost:3000/ping
DATABASE : PostgreSQL

## Structure du projet

.
├── back/ # Code du backend (Express + PostgreSQL)
│ ├── Dockerfile
│ ├── package.json
│ └── server.js
│
├── front/ # Code du front (React + Vite)
│ ├── Dockerfile
│ ├── package.json
│ └── src/
│
├── docker-compose.yml
└── README.md

## Tests API

### Ping API :

curl http://localhost:3000/ping

# → {"pong": true}

### Test connexion DB :

curl http://localhost:3000/db

# → {"db_time": "2025-10-07T12:00:00.000Z"}

## Technologies

- Backend : Node.js / Express / PostgreSQL
- Frontend : React / Vite
- Containerisation : Docker / Docker Compose

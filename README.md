# T-DEV-700 Project

## Démarrer

### Lancer tous les services :

docker compose up --build

### lancer les services séparément :

docker compose up --build backend
docker compose up --build web

### Accès aux services :

- **Frontend:** http://localhost:5173
- **API:** http://localhost:3000/ping
- **Prisma Studio:** http://localhost:5555
- **pgAdmin:** http://localhost:5050
- **SonarQube:** http://localhost:9000
- **Allure Report:** http://localhost:5051
- **DATABASE:** PostgreSQL (port 5432)

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

## Tests

### Pré-requis (une seule fois)

- Docker Desktop lancé
- Créer `back/.env.docker` à partir de `back/env.docker.example`
- S'assurer que le dossier `back/coverage` existe

### Lancer les tests :

```bash
# IMPORTANT: Disposer du fichier d'env pour Docker
# Windows PowerShell:
Copy-Item back\env.docker.example back\.env.docker -Force
# Linux/Mac:
cp back/env.docker.example back/.env.docker

# IMPORTANT: Créer le dossier coverage sur l'hôte avant de lancer les tests
# Windows PowerShell:
New-Item -ItemType Directory -Force -Path back\coverage
# Linux/Mac:
mkdir -p back/coverage

# Puis lancer les tests
docker compose run --rm backend-tests
```

Cette commande lance tous les tests avec Vitest et génère les rapports Allure et de couverture.

**Note importante**: Le dossier `back/coverage` doit exister sur votre machine AVANT de lancer les tests pour que les fichiers de couverture persistent pour SonarQube. Sinon, le dossier sera créé dans le conteneur mais sera supprimé à la fin avec `--rm`.

### Visualiser les rapports de tests (Allure) :

```bash
# 1. Lancer les tests (les anciens résultats Allure seront nettoyés automatiquement)
docker compose run --rm backend-tests

# 2. Générer et servir le rapport Allure avec les nouveaux résultats
docker compose --profile tools up allure
```

Accédez ensuite au rapport sur : **http://localhost:5051**

**Note importante :** Les résultats Allure sont automatiquement nettoyés avant chaque exécution de tests pour garantir que le rapport affiche les résultats les plus récents. Si vous voyez des différences, assurez-vous d'avoir relancé les tests juste avant d'ouvrir Allure.

### Tests API manuels

#### Ping API :

```bash
curl http://localhost:3000/ping
# → {"pong": true}
```

#### Test connexion DB :

```bash
curl http://localhost:3000/db
# → {"db_time": "2025-10-07T12:00:00.000Z"}
```

## SonarQube

### Démarrer SonarQube :

```bash
docker compose up -d sonarqube
```

Attendez 1-2 minutes que SonarQube démarre complètement.

### Accéder à l'interface SonarQube :

**URL:** http://localhost:9000

**Identifiants par défaut :**

- Username: `admin`
- Password: `admin`

  **Vous devrez changer le mot de passe au premier login !**

### Générer un token SonarQube :

1. Connectez-vous sur http://localhost:9000
2. Cliquez sur votre avatar → **My Account** → **Security**
3. Créez un token (ex: `scanner-token`)
4. **Copiez le token immédiatement** (vous ne pourrez plus le voir après)
5. Créez un fichier `.env` à la racine avec :
   ```
   SONAR_TOKEN=votre_token_copié_ici
   ```

### Lancer une analyse SonarQube :

```bash
docker compose run --rm sonar-scanner
```

Les résultats seront disponibles sur http://localhost:9000

> Pour plus de détails, consultez le guide complet : `SONARQUBE_GUIDE.md`

## Technologies

- Backend : Node.js / Express / PostgreSQL / Prisma
- Frontend : React / Vite / ant
- Containerisation : Docker / Docker Compose
- Devops: Sonarqube / Swagger
- Tests : Vitest / Allure

# Installer docker

Lien de tééchargement : https://www.docker.com/products/docker-desktop/

## 2/ Check docker

docker --version
docker compose version

## 3/ Cloner projet

git clone git@github.com:EpitechMscProPromo2027/T-DEV-700-project-PAR_8.git

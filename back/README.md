# T-DEV-700 Project BACK

## Commande

### Lancer le backend

docker compose up

### Ouvrir Prisma Studio (base de données via Docker)

docker compose exec backend sh -lc 'npx prisma studio --schema=prisma/schema.prisma --port 5555 --hostname 0.0.0.0'

### Ouvrir Prisma Studio (base de données en local)

npx prisma studio

### Redémarrer le backend

docker compose restart backend

## Accès aux services

- **API Backend** : http://localhost:3000
- **Documentation Swagger** : http://localhost:3000/api-docs
- **Base de données (Prisma Studio)** : http://localhost:5555

## Structure du projet

```
back/ # Dossier principal du backend (Express + PostgreSQL + Prisma)
├── modules/ # Contient les différents modules métier
│   ├── auth/ # Gestion de l'authentification (JWT, login, register)
│   ├── user/ # Gestion des utilisateurs (CRUD, rôles, contrats)
│   ├── team/ # Gestion des équipes (création, attribution, permissions)
│   ├── clocking/ # Système de pointage (entrée/sortie, pauses, statistiques)
│   └── leave/ # Gestion des congés (demandes, approbation, workflow)
├── core/ # Fonctionnalités transversales
│   ├── AppError.js # Gestion des erreurs personnalisées
│   ├── async.js # Wrapper pour les fonctions asynchrones
│   ├── errorHandler.js # Middleware de gestion d'erreurs
│   ├── httpErrors.js # Codes d'erreur HTTP standardisés
│   ├── pagination.js # Utilitaires de pagination
│   ├── requestId.js # Middleware d'identification des requêtes
│   └── roles.js # Définition des rôles utilisateur
├── prisma/ # Fichiers liés à Prisma (ORM)
│   └── schema.prisma # Schéma de la base de données
├── tests/ # Tests unitaires et d'intégration
├── db.js # Connexion à la base de données
├── .env # Variables d'environnement
├── Dockerfile # Image Docker du backend
├── package.json # Dépendances et scripts NPM
├── server.js # Point d'entrée principal du serveur Express
└── swagger.yaml # Documentation API OpenAPI/Swagger
```

## Modules de l'API

### Auth (Authentification)

- **Inscription** : Création de nouveaux utilisateurs
- **Connexion** : Authentification avec email/mot de passe
- **JWT** : Gestion des tokens d'accès et de rafraîchissement
- **Profil** : Récupération des informations de l'utilisateur connecté

### Users (Utilisateurs)

- **CRUD complet** : Création, lecture, mise à jour, suppression
- **Gestion des rôles** : USER, MANAGER, RESPONSABLE, ADMIN
- **Types de contrat** : CDI, CDD, STAGE, APPRENTISSAGE, FREELANCE, AUTRE
- **Recherche** : Par nom, téléphone, rôle, type de contrat
- **Statistiques** : Comptage par rôle et type de contrat

### Teams (Équipes)

- **Création** : Réservée aux Responsables et Managers
- **Gestion** : Attribution de propriétaires, permissions
- **Listage** : Toutes les équipes ou par propriétaire
- **Modification** : Seuls les propriétaires/managers peuvent modifier

### Clocking (Pointages)

- **Pointage** : Entrée/sortie avec gestion des pauses
- **Statistiques** : Heures travaillées, moyennes par jour
- **Historique** : Pointages par utilisateur et par date
- **Permissions** : Utilisateurs voient leurs propres données, Responsables voient tout

### Leaves (Congés)

- **Demandes** : Création de demandes d'absence
- **Types** : PAYE, NON_PAYE, MALADIE, RTT, AUTRE
- **Workflow** : PENDING → APPROVED/REJECTED
- **Gestion** : Par utilisateur, équipe, ou globale (Responsables/Managers)

## Configuration

### Fichier .env

```env
DATABASE_URL="postgresql://user:password@db:5432/mydatabase?schema=public"
PORT=3000
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
```

### Outils utilisés

- **Node.js + Express** → Framework backend
- **PostgreSQL** → Base de données relationnelle
- **Prisma ORM** → Gestion de la base de données
- **Docker / Docker Compose** → Conteneurisation
- **JWT** → Authentification sécurisée
- **Swagger/OpenAPI** → Documentation API
- **Vitest** → Framework de tests

## Documentation API

### Swagger/OpenAPI

La documentation complète de l'API est disponible dans le fichier `swagger.yaml`. Cette documentation inclut :

- **Toutes les routes** disponibles
- **Schémas de données** pour les requêtes et réponses
- **Codes d'erreur** et leurs significations
- **Authentification** et permissions requises
- **Exemples** de requêtes et réponses

### Endpoints principaux

```
GET  /ping                    # Vérification du serveur
GET  /db                      # Vérification de la base de données

POST /auth/register           # Inscription
POST /auth/login             # Connexion
POST /auth/refresh           # Rafraîchissement du token
GET  /auth/me                # Profil utilisateur

GET  /users                  # Liste des utilisateurs
GET  /users/{id}             # Utilisateur par ID
PUT  /users/{id}             # Mise à jour utilisateur
DELETE /users/{id}           # Suppression utilisateur

POST /teams                  # Créer une équipe
GET  /teams                  # Liste des équipes
GET  /teams/{id}             # Équipe par ID
PATCH /teams/{id}            # Mise à jour équipe
DELETE /teams/{id}           # Suppression équipe

POST /clocking               # Créer un pointage
GET  /clocking               # Liste des pointages
GET  /clocking/user/{userId} # Pointages par utilisateur
PATCH /clocking/{id}         # Mise à jour pointage

POST /leaves                 # Créer une demande de congé
GET  /leaves                 # Liste des congés
GET  /leaves/{id}            # Congé par ID
PATCH /leaves/{id}/status    # Changer le statut
```

## Commandes Prisma utiles

### Générer le client Prisma

npx prisma generate

### Appliquer les migrations

npx prisma migrate dev

### Ouvrir Prisma Studio

npx prisma studio

## Scripts de données mockées

### Générer des données mockées

```bash
node scripts/generateMockData.js [userCount] [teamCount] [leavesPerUser]
```

**Paramètres optionnels :**

- `userCount` : Nombre d'utilisateurs à créer (défaut : 50)
- `teamCount` : Nombre d'équipes à créer (défaut : 10)
- `leavesPerUser` : Nombre de congés par utilisateur (défaut : 3)

**Exemples :**

```bash
# Génération avec les valeurs par défaut (50 users, 10 teams, 3 leaves/user)
node scripts/generateMockData.js

# Génération personnalisée
node scripts/generateMockData.js 100 20 5
```

**Note :** Les données mockées utilisent le préfixe `mock_` dans les emails (ex: `mock_user0@example.com`). Le mot de passe par défaut est `password123`.

### Supprimer les données mockées

```bash
node scripts/deleteMockData.js --force
```

**Attention :** Cette commande supprime toutes les données avec le préfixe `mock_` (utilisateurs, équipes, congés, pointages, avertissements, notifications). Le flag `--force` ou `-f` est obligatoire pour confirmer la suppression.

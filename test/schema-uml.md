# Schéma UML du Projet

Ce document contient les schémas UML du projet de gestion de temps et de ressources humaines.

## Visualisation

### PlantUML (Recommandé)
Le fichier `schema-uml.puml` contient plusieurs diagrammes PlantUML que vous pouvez visualiser avec :
- [PlantUML Online](http://www.plantuml.com/plantuml/uml/)
- Extension VS Code : "PlantUML"
- Extension IntelliJ/WebStorm : "PlantUML integration"

### Mermaid (Alternative)
Les diagrammes ci-dessous utilisent la syntaxe Mermaid, compatible avec GitHub et la plupart des éditeurs Markdown.

---

## 1. Architecture Générale

```mermaid
graph TB
    subgraph Frontend["Frontend"]
        React[React Application]
        Pages[Pages]
        Components[Components]
        Services[Services]
        APIClient[API Client]
    end
    
    subgraph Backend["Backend"]
        Server[Express Server]
        Auth[Auth Module]
        User[User Module]
        Leave[Leave Module]
        Team[Team Module]
        Clocking[Clocking Module]
        Warning[Warning Module]
        Notification[Notification Module]
        KPI[KPI Module]
    end
    
    subgraph Database["Database"]
        DB[(PostgreSQL)]
        Prisma[Prisma ORM]
    end
    
    React --> APIClient
    APIClient --> Server
    Pages --> Components
    Pages --> Services
    Services --> APIClient
    
    Server --> Auth
    Server --> User
    Server --> Leave
    Server --> Team
    Server --> Clocking
    Server --> Warning
    Server --> Notification
    Server --> KPI
    
    Auth --> Prisma
    User --> Prisma
    Leave --> Prisma
    Team --> Prisma
    Clocking --> Prisma
    Warning --> Prisma
    Notification --> Prisma
    KPI --> Prisma
    
    Prisma --> DB
```

---

## 2. Modèles de Données (Diagramme de Classes)

```mermaid
erDiagram
    User ||--o{ Belongs : "appartient à"
    Team ||--o{ Belongs : "contient"
    User ||--o{ Team : "possède"
    User ||--o{ Leave : "a"
    User ||--o{ Clocking : "enregistre"
    User ||--o{ Warning : "reçoit"
    User ||--o{ Warning : "crée"
    User ||--o{ Receive : "reçoit"
    Notification ||--o{ Receive : "envoyée à"
    
    User {
        int id PK
        string firstName
        string lastName
        string email UK
        string phoneNumber
        string password
        enum role
        enum contractType
        string avatarUrl
        int totalWarningPoints
        decimal totalPayeLeave
        int totalRemote
        int weeklyLeaveLimit
        datetime lastWeekReset
        decimal monthlyLeaveGain
        datetime lastMonthlyReset
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }
    
    Team {
        int id PK
        string teamName
        string description
        int ownerId FK
        datetime createdAt
        datetime updatedAt
    }
    
    Belongs {
        int teamId PK,FK
        int userId PK,FK
        datetime joinedAt
        boolean isLead
        datetime createdAt
        datetime updatedAt
    }
    
    Leave {
        int id PK
        date startDate
        date endDate
        string justification
        enum status
        int daysLeave
        enum type
        int userId FK
        datetime createdAt
        datetime updatedAt
    }
    
    Clocking {
        int id PK
        time firstArrival
        time lastDeparture
        int workTime
        int breakTime
        date clockingDate
        decimal totalHours
        enum weekDay
        int userId FK
        datetime createdAt
        datetime updatedAt
    }
    
    Warning {
        int id PK
        enum status
        string description
        date date
        int createdById FK
        int userId FK
        datetime createdAt
        datetime updatedAt
    }
    
    Notification {
        int id PK
        string message
        string title
        enum status
        date date
        boolean isRead
        datetime createdAt
        datetime updatedAt
    }
    
    Receive {
        int userId PK,FK
        int notificationId PK,FK
        datetime createdAt
        datetime updatedAt
    }
```

---

## 3. Modules Backend

```mermaid
graph LR
    subgraph Server["Express Server"]
        Express[Express App]
    end
    
    subgraph Auth["Auth Module"]
        AuthRoutes[routes.js]
        AuthCtrl[controller.js]
        AuthSvc[service.js]
        AuthMw[middleware.js]
        AuthJWT[jwt.js]
        AuthVal[validators.js]
    end
    
    subgraph User["User Module"]
        UserRoutes[routes.js]
        UserCtrl[controller.js]
        UserSvc[service.js]
        UserMw[middleware.js]
    end
    
    subgraph Leave["Leave Module"]
        LeaveRoutes[routes.js]
        LeaveCtrl[controller.js]
        LeaveSvc[service.js]
        LeaveVal[validators.js]
        LeaveUtils[utils.js]
    end
    
    subgraph Team["Team Module"]
        TeamRoutes[routes.js]
        TeamCtrl[controller.js]
        TeamSvc[service.js]
        TeamMw[middleware.js]
        TeamVal[validators.js]
    end
    
    subgraph Clocking["Clocking Module"]
        ClockingRoutes[routes.js]
        ClockingCtrl[controller.js]
        ClockingSvc[service.js]
        ClockingMw[middleware.js]
        ClockingVal[validators.js]
    end
    
    subgraph Warning["Warning Module"]
        WarningRoutes[routes.js]
        WarningCtrl[controller.js]
        WarningSvc[service.js]
        WarningVal[validators.js]
    end
    
    subgraph Notification["Notification Module"]
        NotificationRoutes[routes.js]
        NotificationCtrl[controller.js]
        NotificationSvc[service.js]
        NotificationVal[validators.js]
        NotificationUtils[utils.js]
    end
    
    subgraph KPI["KPI Module"]
        KPIRoutes[routes.js]
        KPICtrl[controller.js]
        KPISvc[service.js]
    end
    
    subgraph Prisma["Prisma"]
        PrismaClient[Prisma Client]
    end
    
    Express --> AuthRoutes
    Express --> UserRoutes
    Express --> LeaveRoutes
    Express --> TeamRoutes
    Express --> ClockingRoutes
    Express --> WarningRoutes
    Express --> NotificationRoutes
    Express --> KPIRoutes
    
    AuthRoutes --> AuthCtrl
    AuthCtrl --> AuthSvc
    AuthCtrl --> AuthMw
    AuthSvc --> AuthJWT
    AuthCtrl --> AuthVal
    
    UserRoutes --> UserCtrl
    UserCtrl --> UserSvc
    UserCtrl --> UserMw
    
    LeaveRoutes --> LeaveCtrl
    LeaveCtrl --> LeaveSvc
    LeaveCtrl --> LeaveVal
    LeaveSvc --> LeaveUtils
    
    TeamRoutes --> TeamCtrl
    TeamCtrl --> TeamSvc
    TeamCtrl --> TeamMw
    TeamCtrl --> TeamVal
    
    ClockingRoutes --> ClockingCtrl
    ClockingCtrl --> ClockingSvc
    ClockingCtrl --> ClockingMw
    ClockingCtrl --> ClockingVal
    
    WarningRoutes --> WarningCtrl
    WarningCtrl --> WarningSvc
    WarningCtrl --> WarningVal
    
    NotificationRoutes --> NotificationCtrl
    NotificationCtrl --> NotificationSvc
    NotificationCtrl --> NotificationVal
    NotificationSvc --> NotificationUtils
    
    KPIRoutes --> KPICtrl
    KPICtrl --> KPISvc
    
    AuthSvc --> PrismaClient
    UserSvc --> PrismaClient
    LeaveSvc --> PrismaClient
    TeamSvc --> PrismaClient
    ClockingSvc --> PrismaClient
    WarningSvc --> PrismaClient
    NotificationSvc --> PrismaClient
    KPISvc --> PrismaClient
```

---

## 4. Architecture Frontend

```mermaid
graph TB
    subgraph Pages["Pages"]
        Login[Login]
        Register[Register]
        Dashboard[Dashboard]
        Profile[Profile]
        Teams[Teams]
        TeamDetails[TeamDetails]
        Effectif[Effectif]
        UserDetail[UserDetail]
        Time[Time]
    end
    
    subgraph Components["Components"]
        Layout[Layout]
        LoginForm[LoginForm]
        RegisterForm[RegisterForm]
        CreateLeaveForm[CreateLeaveForm]
        CreateTeamForm[CreateTeamForm]
        TeamCard[TeamCard]
        WorkButton[WorkButton]
        CustomCalendar[CustomCalendar]
    end
    
    subgraph Services["Services (Hooks)"]
        useAuth[useAuth]
        useUser[useUser]
        useLeave[useLeave]
        useTeam[useTeam]
        useClocking[useClocking]
        useWarning[useWarning]
        useKpi[useKpi]
    end
    
    subgraph API["API Client"]
        AuthAPI[auth.js]
        UserAPI[user.js]
        LeaveAPI[leave.js]
        TeamAPI[team.js]
        ClockingAPI[clocking.js]
        WarningAPI[warning.js]
        KpiAPI[kpi.js]
    end
    
    subgraph State["State Management"]
        Store[Zustand Store]
    end
    
    Backend[Backend API]
    
    Login --> LoginForm
    Register --> RegisterForm
    Dashboard --> Layout
    Teams --> TeamCard
    Teams --> CreateTeamForm
    
    LoginForm --> useAuth
    RegisterForm --> useAuth
    Dashboard --> useKpi
    Profile --> useUser
    Teams --> useTeam
    TeamDetails --> useTeam
    Effectif --> useUser
    UserDetail --> useUser
    Time --> useClocking
    
    useAuth --> AuthAPI
    useUser --> UserAPI
    useLeave --> LeaveAPI
    useTeam --> TeamAPI
    useClocking --> ClockingAPI
    useWarning --> WarningAPI
    useKpi --> KpiAPI
    
    AuthAPI --> Backend
    UserAPI --> Backend
    LeaveAPI --> Backend
    TeamAPI --> Backend
    ClockingAPI --> Backend
    WarningAPI --> Backend
    KpiAPI --> Backend
    
    useAuth --> Store
    useUser --> Store
    useTeam --> Store
```

---

## 5. Déploiement

```mermaid
graph TB
    subgraph Docker["Docker Compose"]
        subgraph FrontendContainer["Frontend Container"]
            Frontend[React App]
            Vite[Vite Dev Server]
        end
        
        subgraph BackendContainer["Backend Container"]
            Backend[Express Server]
            Node[Node.js Runtime]
        end
        
        subgraph DatabaseContainer["Database Container"]
            DB[(PostgreSQL)]
        end
        
        subgraph ToolsContainer["Tools Container"]
            PrismaStudio[Prisma Studio]
            SonarQube[SonarQube]
            Swagger[Swagger UI]
            Allure[Allure Report]
        end
    end
    
    User[Client Browser]
    
    User -->|http://localhost:5173| Frontend
    Frontend -->|http://localhost:3000| Backend
    Backend -->|PostgreSQL :5432| DB
    User -->|http://localhost:5555| PrismaStudio
    User -->|http://localhost:3000/api-docs| Swagger
    User -->|http://localhost:9000| SonarQube
    User -->|http://localhost:5051| Allure
```

---

## Technologies Utilisées

### Backend
- **Node.js** : Runtime JavaScript
- **Express** : Framework web
- **PostgreSQL** : Base de données relationnelle
- **Prisma** : ORM pour PostgreSQL
- **JWT** : Authentification par tokens
- **Zod** : Validation de schémas
- **Swagger** : Documentation API

### Frontend
- **React** : Bibliothèque UI
- **Vite** : Build tool et dev server
- **Ant Design** : Composants UI
- **React Router** : Routage
- **Zustand** : Gestion d'état
- **React Query** : Gestion des données serveur
- **Recharts** : Graphiques

### Infrastructure
- **Docker** : Containerisation
- **Docker Compose** : Orchestration
- **SonarQube** : Analyse de code
- **Vitest** : Framework de tests
- **Allure** : Rapports de tests

---

## Enums

### Role
- `Employer` : Employé
- `Manager` : Manager
- `Responsable` : Responsable

### ContractType
- `H15` : 15 heures/semaine
- `H35` : 35 heures/semaine
- `H40` : 40 heures/semaine

### LeaveStatus
- `Pending` : En attente
- `Approved` : Approuvé
- `Refused` : Refusé

### LeaveType
- `Absence` : Absence
- `PaidLeave` : Congé payé
- `Training` : Formation
- `Remote` : Télétravail

### WarningStatus
- `Alert` : Alerte
- `Late` : Retard
- `UnjustifiedAbsence` : Absence injustifiée

### NotificationStatus
- `Present` : Présent
- `Late` : Retard
- `Warning` : Avertissement

### WeekDay
- `Monday` à `Sunday` : Jours de la semaine



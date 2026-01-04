# Dictionnaire des Données

## Table des matières

1. [Table User](#table-user)
2. [Table Team](#table-team)
3. [Table Belongs](#table-belongs)
4. [Table Leave](#table-leave)
5. [Table Clocking](#table-clocking)
6. [Table Warning](#table-warning)
7. [Table Notification](#table-notification)
8. [Table Receive](#table-receive)
9. [Énumérations](#énumérations)

---

## Table User

**Description** : Table contenant les informations des utilisateurs du système.

| Nom de la colonne    | Type                | Contraintes        | Valeur par défaut | Description                                            |
| -------------------- | ------------------- | ------------------ | ----------------- | ------------------------------------------------------ |
| id_user              | SERIAL              | PK, NOT NULL, AUTO | Auto-incrément    | Identifiant unique de l'utilisateur                    |
| first_name           | VARCHAR(255)        | NOT NULL           | -                 | Prénom de l'utilisateur                                |
| last_name            | VARCHAR(255)        | NOT NULL           | -                 | Nom de famille de l'utilisateur                        |
| email                | VARCHAR(255)        | UNIQUE, NOT NULL   | -                 | Adresse email unique de l'utilisateur                  |
| phone_number         | VARCHAR(20)         | NOT NULL           | -                 | Numéro de téléphone                                    |
| password             | TEXT                | NOT NULL           | -                 | Mot de passe hashé                                     |
| role                 | Role (ENUM)         | NOT NULL           | -                 | Rôle de l'utilisateur (Employer, Manager, Responsable) |
| contract_type        | ContractType (ENUM) | NOT NULL           | -                 | Type de contrat (H15, H35, H40)                        |
| avatar_url           | VARCHAR(255)        | NULL               | -                 | URL de l'avatar de l'utilisateur                       |
| total_warning_points | INTEGER             | NOT NULL           | 0                 | Total des points d'avertissement                       |
| total_paye_leave     | DECIMAL(8,1)        | NOT NULL           | 10.0              | Total des congés payés disponibles                     |
| total_remote         | INTEGER             | NOT NULL           | 2                 | Nombre de jours de télétravail disponibles             |
| weekly_leave_limit   | INTEGER             | NOT NULL           | 2                 | Limite de congés par semaine                           |
| last_week_reset      | TIMESTAMP           | NULL               | -                 | Date de la dernière réinitialisation hebdomadaire      |
| monthly_leave_gain   | DECIMAL(3,1)        | NOT NULL           | 2.2               | Gain mensuel de congés                                 |
| last_monthly_reset   | TIMESTAMP           | NULL               | -                 | Date de la dernière réinitialisation mensuelle         |
| created_at           | TIMESTAMP           | NOT NULL           | now()             | Date de création de l'enregistrement                   |
| updated_at           | TIMESTAMP           | NOT NULL           | now()             | Date de dernière modification                          |
| deleted_at           | TIMESTAMP           | NULL               | -                 | Date de suppression (soft delete)                      |

**Index** :

- idx_user_deleted_at (deleted_at)
- idx_user_email (email)
- idx_user_role (role)

**Relations** :

- Une Team peut avoir un owner (id_owner dans Team)
- Plusieurs Belongs peuvent référencer un User
- Plusieurs Leave peuvent référencer un User
- Plusieurs Clocking peuvent référencer un User
- Plusieurs Warning peuvent référencer un User (id_user et created_by_id)
- Plusieurs Receive peuvent référencer un User

---

## Table Team

**Description** : Table contenant les informations des équipes.

| Nom de la colonne | Type         | Contraintes        | Valeur par défaut | Description                                                      |
| ----------------- | ------------ | ------------------ | ----------------- | ---------------------------------------------------------------- |
| id_team           | SERIAL       | PK, NOT NULL, AUTO | Auto-incrément    | Identifiant unique de l'équipe                                   |
| team_name         | VARCHAR(255) | NOT NULL           | -                 | Nom de l'équipe                                                  |
| description       | TEXT         | NOT NULL           | -                 | Description de l'équipe                                          |
| id_owner          | INTEGER      | FK, NOT NULL       | -                 | Identifiant du propriétaire de l'équipe (référence User.id_user) |
| created_at        | TIMESTAMP    | NOT NULL           | now()             | Date de création de l'enregistrement                             |
| updated_at        | TIMESTAMP    | NOT NULL           | now()             | Date de dernière modification                                    |

**Index** :

- idx_team_owner (id_owner)

**Contraintes de clé étrangère** :

- FOREIGN KEY (id_owner) REFERENCES User(id_user) ON DELETE CASCADE

**Relations** :

- Appartient à un User (owner) via id_owner
- Plusieurs Belongs peuvent référencer une Team

---

## Table Belongs

**Description** : Table de jointure représentant l'appartenance d'un utilisateur à une équipe.

| Nom de la colonne | Type      | Contraintes      | Valeur par défaut | Description                                           |
| ----------------- | --------- | ---------------- | ----------------- | ----------------------------------------------------- |
| id_team           | INTEGER   | PK, FK, NOT NULL | -                 | Identifiant de l'équipe (référence Team.id_team)      |
| id_user           | INTEGER   | PK, FK, NOT NULL | -                 | Identifiant de l'utilisateur (référence User.id_user) |
| joined_at         | TIMESTAMP | NOT NULL         | now()             | Date d'adhésion à l'équipe                            |
| is_lead           | BOOLEAN   | NOT NULL         | false             | Indique si l'utilisateur est leader de l'équipe       |
| created_at        | TIMESTAMP | NOT NULL         | now()             | Date de création de l'enregistrement                  |
| updated_at        | TIMESTAMP | NOT NULL         | now()             | Date de dernière modification                         |

**Clé primaire composite** :

- PRIMARY KEY (id_team, id_user)

**Index** :

- idx_belongs_team_lead (id_team, is_lead)
- idx_belongs_user (id_user)

**Contraintes de clé étrangère** :

- FOREIGN KEY (id_team) REFERENCES Team(id_team) ON DELETE CASCADE
- FOREIGN KEY (id_user) REFERENCES User(id_user) ON DELETE CASCADE

**Relations** :

- Appartient à une Team via id_team
- Appartient à un User via id_user

---

## Table Leave

**Description** : Table contenant les demandes de congés des utilisateurs.

| Nom de la colonne | Type               | Contraintes        | Valeur par défaut | Description                                           |
| ----------------- | ------------------ | ------------------ | ----------------- | ----------------------------------------------------- |
| id_leave          | SERIAL             | PK, NOT NULL, AUTO | Auto-incrément    | Identifiant unique du congé                           |
| start_date        | DATE               | NOT NULL           | -                 | Date de début du congé                                |
| end_date          | DATE               | NOT NULL           | -                 | Date de fin du congé                                  |
| justification     | TEXT               | NOT NULL           | -                 | Justification de la demande de congé                  |
| status            | LeaveStatus (ENUM) | NOT NULL           | 'Pending'         | Statut de la demande (Pending, Approved, Refused)     |
| days_leave        | INTEGER            | NOT NULL           | -                 | Nombre de jours de congé                              |
| type              | LeaveType (ENUM)   | NOT NULL           | -                 | Type de congé (Absence, PaidLeave, Training, Remote)  |
| id_user           | INTEGER            | FK, NOT NULL       | -                 | Identifiant de l'utilisateur (référence User.id_user) |
| created_at        | TIMESTAMP          | NOT NULL           | now()             | Date de création de l'enregistrement                  |
| updated_at        | TIMESTAMP          | NOT NULL           | now()             | Date de dernière modification                         |

**Index** :

- idx_leave_user_dates (id_user, start_date, end_date)

**Contraintes de clé étrangère** :

- FOREIGN KEY (id_user) REFERENCES User(id_user) ON DELETE CASCADE

**Relations** :

- Appartient à un User via id_user

---

## Table Clocking

**Description** : Table contenant les enregistrements de pointage des utilisateurs.

| Nom de la colonne | Type           | Contraintes        | Valeur par défaut | Description                                           |
| ----------------- | -------------- | ------------------ | ----------------- | ----------------------------------------------------- |
| id_clocking       | SERIAL         | PK, NOT NULL, AUTO | Auto-incrément    | Identifiant unique du pointage                        |
| first_arrival     | TIME(6)        | NULL               | -                 | Heure de première arrivée                             |
| last_departure    | TIME(6)        | NULL               | -                 | Heure de dernier départ                               |
| work_time         | INTEGER        | NOT NULL           | 0                 | Temps de travail en minutes                           |
| break_time        | INTEGER        | NOT NULL           | 0                 | Temps de pause en minutes                             |
| clocking_date     | DATE           | NOT NULL           | -                 | Date du pointage                                      |
| total_hours       | DECIMAL(8,2)   | NOT NULL           | 0.00              | Total d'heures travaillées                            |
| week_day          | WeekDay (ENUM) | NOT NULL           | -                 | Jour de la semaine (Monday à Sunday)                  |
| id_user           | INTEGER        | FK, NOT NULL       | -                 | Identifiant de l'utilisateur (référence User.id_user) |
| created_at        | TIMESTAMP      | NOT NULL           | now()             | Date de création de l'enregistrement                  |
| updated_at        | TIMESTAMP      | NOT NULL           | now()             | Date de dernière modification                         |

**Index** :

- idx_clocking_user_date (id_user, clocking_date)
- idx_clocking_user (id_user)

**Contraintes de clé étrangère** :

- FOREIGN KEY (id_user) REFERENCES User(id_user) ON DELETE CASCADE

**Relations** :

- Appartient à un User via id_user

---

## Table Warning

**Description** : Table contenant les avertissements donnés aux utilisateurs.

| Nom de la colonne | Type                 | Contraintes        | Valeur par défaut | Description                                                                      |
| ----------------- | -------------------- | ------------------ | ----------------- | -------------------------------------------------------------------------------- |
| id_warning        | SERIAL               | PK, NOT NULL, AUTO | Auto-incrément    | Identifiant unique de l'avertissement                                            |
| status            | WarningStatus (ENUM) | NOT NULL           | -                 | Statut de l'avertissement (Alert, Late, UnjustifiedAbsence)                      |
| description       | TEXT                 | NOT NULL           | -                 | Description de l'avertissement                                                   |
| date              | DATE                 | NOT NULL           | -                 | Date de l'avertissement                                                          |
| id_user           | INTEGER              | FK, NOT NULL       | -                 | Identifiant de l'utilisateur qui reçoit l'avertissement (référence User.id_user) |
| created_by_id     | INTEGER              | FK, NULL           | -                 | Identifiant de l'utilisateur qui crée l'avertissement (référence User.id_user)   |
| created_at        | TIMESTAMP            | NOT NULL           | now()             | Date de création de l'enregistrement                                             |
| updated_at        | TIMESTAMP            | NOT NULL           | now()             | Date de dernière modification                                                    |

**Index** :

- idx_warning_user (id_user)
- idx_warning_user_date (id_user, date)

**Contraintes de clé étrangère** :

- FOREIGN KEY (id_user) REFERENCES User(id_user) ON DELETE CASCADE
- FOREIGN KEY (created_by_id) REFERENCES User(id_user)

**Relations** :

- Appartient à un User (qui reçoit) via id_user
- Peut être créé par un User (optionnel) via created_by_id

---

## Table Notification

**Description** : Table contenant les notifications du système.

| Nom de la colonne | Type                      | Contraintes        | Valeur par défaut | Description                                        |
| ----------------- | ------------------------- | ------------------ | ----------------- | -------------------------------------------------- |
| id_notification   | SERIAL                    | PK, NOT NULL, AUTO | Auto-incrément    | Identifiant unique de la notification              |
| message           | TEXT                      | NOT NULL           | -                 | Message de la notification                         |
| title             | VARCHAR(255)              | NOT NULL           | -                 | Titre de la notification                           |
| status            | NotificationStatus (ENUM) | NOT NULL           | -                 | Statut de la notification (Present, Late, Warning) |
| date              | DATE                      | NOT NULL           | -                 | Date de la notification                            |
| is_read           | BOOLEAN                   | NOT NULL           | false             | Indique si la notification a été lue               |
| created_at        | TIMESTAMP                 | NOT NULL           | now()             | Date de création de l'enregistrement               |
| updated_at        | TIMESTAMP                 | NOT NULL           | now()             | Date de dernière modification                      |

**Relations** :

- Plusieurs Receive peuvent référencer une Notification

---

## Table Receive

**Description** : Table de jointure représentant la réception d'une notification par un utilisateur.

| Nom de la colonne | Type      | Contraintes      | Valeur par défaut | Description                                                             |
| ----------------- | --------- | ---------------- | ----------------- | ----------------------------------------------------------------------- |
| id_user           | INTEGER   | PK, FK, NOT NULL | -                 | Identifiant de l'utilisateur (référence User.id_user)                   |
| id_notification   | INTEGER   | PK, FK, NOT NULL | -                 | Identifiant de la notification (référence Notification.id_notification) |
| created_at        | TIMESTAMP | NOT NULL         | now()             | Date de création de l'enregistrement                                    |
| updated_at        | TIMESTAMP | NOT NULL         | now()             | Date de dernière modification                                           |

**Clé primaire composite** :

- PRIMARY KEY (id_user, id_notification)

**Index** :

- idx_receive_user (id_user)
- idx_receive_notification (id_notification)

**Contraintes de clé étrangère** :

- FOREIGN KEY (id_user) REFERENCES User(id_user) ON DELETE CASCADE
- FOREIGN KEY (id_notification) REFERENCES Notification(id_notification) ON DELETE CASCADE

**Relations** :

- Appartient à un User via id_user
- Appartient à une Notification via id_notification

---

## Énumérations

### Role

**Description** : Rôle de l'utilisateur dans le système.

| Valeur      | Description      |
| ----------- | ---------------- |
| Employer    | Employé standard |
| Manager     | Manager          |
| Responsable | Responsable      |

### ContractType

**Description** : Type de contrat de travail.

| Valeur | Description           |
| ------ | --------------------- |
| H15    | 15 heures par semaine |
| H35    | 35 heures par semaine |
| H40    | 40 heures par semaine |

### LeaveStatus

**Description** : Statut d'une demande de congé.

| Valeur   | Description              |
| -------- | ------------------------ |
| Pending  | En attente de validation |
| Approved | Approuvé                 |
| Refused  | Refusé                   |

### LeaveType

**Description** : Type de congé.

| Valeur    | Description |
| --------- | ----------- |
| Absence   | Absence     |
| PaidLeave | Congé payé  |
| Training  | Formation   |
| Remote    | Télétravail |

### WarningStatus

**Description** : Statut d'un avertissement.

| Valeur             | Description         |
| ------------------ | ------------------- |
| Alert              | Alerte              |
| Late               | Retard              |
| UnjustifiedAbsence | Absence injustifiée |

### NotificationStatus

**Description** : Statut d'une notification.

| Valeur  | Description   |
| ------- | ------------- |
| Present | Présent       |
| Late    | Retard        |
| Warning | Avertissement |

### WeekDay

**Description** : Jour de la semaine.

| Valeur    | Description |
| --------- | ----------- |
| Monday    | Lundi       |
| Tuesday   | Mardi       |
| Wednesday | Mercredi    |
| Thursday  | Jeudi       |
| Friday    | Vendredi    |
| Saturday  | Samedi      |
| Sunday    | Dimanche    |

---

## Légende

- **PK** : Clé primaire (Primary Key)
- **FK** : Clé étrangère (Foreign Key)
- **AUTO** : Auto-incrément
- **NOT NULL** : Champ obligatoire
- **NULL** : Champ optionnel
- **UNIQUE** : Contrainte d'unicité
- **DEFAULT** : Valeur par défaut
- **ON DELETE CASCADE** : Suppression en cascade

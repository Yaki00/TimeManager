# 📊 Guide SonarQube - Time Manager

## 🎯 Qu'est-ce que SonarQube ?

SonarQube est un outil d'**analyse de qualité de code**. Il analyse automatiquement votre code et vous donne :

- 🐛 **Bugs détectés**
- 🔒 **Vulnérabilités de sécurité**
- 💩 **Code smells** (mauvaises pratiques)
- 📈 **Couverture de tests**
- 📊 **Métriques de qualité** (complexité, duplication, etc.)

**❌ NE PAS lire les logs ligne par ligne !**  
**✅ Utilisez l'interface web visuelle !**

---

## 🚀 Démarrage rapide

### 1. Démarrer SonarQube

```bash
docker compose up -d sonarqube
```

Attendez 1-2 minutes que SonarQube démarre complètement.

### 2. Accéder à l'interface web

Ouvrez votre navigateur :

```
http://localhost:9000
```

**Identifiants par défaut :**

- Username: `admin`
- Password: `admin`

⚠️ **Vous devrez changer le mot de passe au premier login !**

---

## 🔑 Générer un Token d'authentification

Pour que le scanner puisse envoyer les résultats, vous devez créer un token :

### Étape 1 : Se connecter

Connectez-vous sur http://localhost:9000 avec admin/admin

### Étape 2 : Changer le mot de passe

Suivez les instructions pour définir un nouveau mot de passe

### Étape 3 : Créer un token

1. Cliquez sur votre avatar en haut à droite
2. Allez dans **My Account**
3. Cliquez sur l'onglet **Security**
4. Dans la section "Generate Tokens" :
   - **Name:** `scanner-token`
   - **Type:** `Global Analysis Token` (ou `User Token`)
   - **Expires in:** 90 days (ou plus)
5. Cliquez sur **Generate**
6. **⚠️ COPIEZ LE TOKEN IMMÉDIATEMENT** (vous ne pourrez plus le voir après !)

### Étape 4 : Créer un fichier .env

Créez un fichier `.env` à la racine du projet :

```bash
SONAR_TOKEN=votre_token_copié_ici
```

**Exemple :**

```
SONAR_TOKEN=squ_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

## 🔍 Lancer une analyse

Une fois le token configuré, lancez l'analyse :

```bash
docker compose run --rm sonar-scanner
```

Cette commande va :

1. ✅ Analyser tout votre code (frontend + backend)
2. ✅ Détecter les problèmes
3. ✅ Envoyer les résultats à SonarQube
4. ✅ Se terminer automatiquement

**⏱️ Temps d'analyse :** environ 1-2 minutes

---

## 📊 Voir les résultats

### Dans l'interface web

1. Allez sur **http://localhost:9000**
2. Vous verrez votre projet **"Backend Docker - Time Manager"**
3. Cliquez dessus pour voir :

   - **Overview** : Vue d'ensemble de la qualité
   - **Issues** : Liste de tous les problèmes détectés
   - **Measures** : Métriques détaillées
   - **Code** : Parcourir le code avec les annotations

### Ce que vous verrez

#### 🎯 Qualité Gate

- **Passed** ✅ ou **Failed** ❌
- Indique si votre code respecte les standards minimaux

#### 🐛 Types de problèmes

| Type                 | Description                      | Gravité      |
| -------------------- | -------------------------------- | ------------ |
| **Bug**              | Erreur qui causera un problème   | 🔴 Critique  |
| **Vulnerability**    | Faille de sécurité               | 🔴 Critique  |
| **Code Smell**       | Mauvaise pratique                | 🟡 Mineure   |
| **Security Hotspot** | Code à vérifier pour la sécurité | 🟠 À réviser |

#### 📈 Métriques importantes

- **Coverage** : % de code couvert par les tests
- **Duplications** : % de code dupliqué
- **Complexity** : Complexité cyclomatique
- **Lines of Code** : Nombre de lignes

---

## 🎨 Comprendre l'interface

### Page d'accueil (Projects)

```
┌─────────────────────────────────────────────────┐
│  Projects                                       │
├─────────────────────────────────────────────────┤
│  Backend Docker - Time Manager                  │
│  ├─ Reliability: A      ├─ Lines: 2,345        │
│  ├─ Security: A         ├─ Coverage: 65.3%     │
│  ├─ Maintainability: B  └─ Duplications: 2.1%  │
└─────────────────────────────────────────────────┘
```

### Page du projet

```
┌─────────────────────────────────────────────────┐
│  Overview │ Issues │ Measures │ Code │ Activity│
├─────────────────────────────────────────────────┤
│                                                 │
│  Quality Gate: Passed ✅                       │
│                                                 │
│  🐛 Bugs: 3                                    │
│  🔒 Vulnerabilities: 0                         │
│  💩 Code Smells: 47                            │
│  📊 Coverage: 65.3%                            │
│  📋 Duplications: 2.1%                         │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Onglet Issues (le plus important !)

Liste tous les problèmes avec :

- 🔍 **Filtres** (par type, gravité, fichier)
- 📝 **Explication détaillée** de chaque problème
- 💡 **Suggestions de correction**
- 📍 **Localisation exacte** dans le code

---

## 🔄 Workflow recommandé

### Analyse régulière

```bash
# 1. Faire des modifications dans votre code
git commit -m "feat: nouvelle fonctionnalité"

# 2. Lancer les tests
docker compose run --rm backend-tests

# 3. Lancer l'analyse SonarQube
docker compose run --rm sonar-scanner

# 4. Voir les résultats sur http://localhost:9000
```

### Avant un merge/pull request

```bash
# Analyser avant de merger
docker compose run --rm sonar-scanner

# Vérifier la Quality Gate sur http://localhost:9000
# ✅ Si Passed → OK pour merger
# ❌ Si Failed → Corriger les problèmes critiques
```

---

## 🔧 Configuration avancée

### Fichier `sonar-project.properties`

Ce fichier contient toute la configuration :

```properties
sonar.projectKey=backenddocker
sonar.projectName=Backend Docker - Time Manager
sonar.sources=back,front/src
sonar.exclusions=**/node_modules/**,**/tests/**
sonar.tests=back/tests
```

### Modifier les exclusions

Ajoutez des dossiers/fichiers à ignorer dans `sonar-project.properties` :

```properties
sonar.exclusions=\
  **/node_modules/**,\
  **/dist/**,\
  **/build/**,\
  **/*.spec.js,\
  **/vendor/**
```

---

## 📚 Ressources

- **Interface web locale :** http://localhost:9000
- **Documentation SonarQube :** https://docs.sonarqube.org/latest/
- **Règles JavaScript :** https://rules.sonarsource.com/javascript

---

## 🆘 Dépannage

### SonarQube ne démarre pas

```bash
# Vérifier les logs
docker compose logs sonarqube --tail 50

# Redémarrer
docker compose restart sonarqube
```

### L'analyse échoue

```bash
# Vérifier que SonarQube est opérationnel
curl http://localhost:9000/api/system/health

# Vérifier que le token est correct dans .env
cat .env

# Relancer
docker compose run --rm sonar-scanner
```

### Erreur "Unauthorized" ou "403"

→ Le token est invalide ou manquant. Regénérez un token et mettez à jour `.env`

### Interface web lente

→ Normal au premier démarrage. Attendez 2-3 minutes.

---

## 💡 Conseils

1. **Lancez une analyse après chaque grosse modification**
2. **Corrigez les bugs et vulnérabilités en priorité**
3. **Ignorez les code smells mineurs au début**
4. **Visez une couverture de tests > 80%**
5. **Faites évoluer votre Quality Gate progressivement**

---

## 🎯 Objectifs qualité recommandés

| Métrique            | Objectif débutant | Objectif avancé |
| ------------------- | ----------------- | --------------- |
| **Bugs**            | < 10              | 0               |
| **Vulnerabilities** | 0                 | 0               |
| **Coverage**        | > 50%             | > 80%           |
| **Duplications**    | < 5%              | < 3%            |
| **Code Smells**     | < 100             | < 50            |

---

**🚀 Bonne analyse !**

# 🐘 Migration vers PostgreSQL - Guide Complet

## 📋 Prérequis

### 1. Installation de PostgreSQL

#### Windows
```bash
# Télécharger depuis https://www.postgresql.org/download/windows/
# Ou utiliser Chocolatey
choco install postgresql
```

#### macOS
```bash
# Avec Homebrew
brew install postgresql
brew services start postgresql
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Configuration PostgreSQL

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base de données
CREATE DATABASE cdp_missions;

# Créer un utilisateur (optionnel)
CREATE USER cdp_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE cdp_missions TO cdp_user;

# Quitter
\q
```

## 🚀 Installation et Configuration

### 1. Installation des dépendances

```bash
# Dans le dossier server
cd pro-mc/server
npm install

# Dans le dossier principal
cd ..
npm install
```

### 2. Configuration des variables d'environnement

Créer un fichier `.env` dans `pro-mc/server/` :

```env
# Configuration PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cdp_missions
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe

# Configuration du serveur
PORT=3000
NODE_ENV=development

# Configuration CORS
CORS_ORIGIN=http://localhost:5173
```

### 3. Migration de la base de données

```bash
# Créer les tables
cd pro-mc/server
npm run db:migrate

# Insérer les données de test
npm run db:seed
```

### 4. Démarrage du serveur

```bash
# Démarrer le serveur PostgreSQL
cd pro-mc/server
npm run dev
```

### 5. Démarrage du frontend

```bash
# Dans un autre terminal
cd pro-mc
npm run dev
```

## 📊 Structure de la Base de Données

### Tables créées :

1. **users** - Gestion des utilisateurs
2. **missions** - Missions de contrôle
3. **documents** - Documents associés aux missions
4. **findings** - Constatations des missions
5. **sanctions** - Sanctions appliquées
6. **remarks** - Remarques sur les missions

### Index créés pour les performances :
- `idx_missions_status`
- `idx_missions_start_date`
- `idx_missions_end_date`
- `idx_missions_controller`
- `idx_documents_mission_id`
- `idx_findings_mission_id`
- `idx_sanctions_mission_id`
- `idx_remarks_mission_id`

## 🔧 Scripts Disponibles

### Serveur (`pro-mc/server/`)

```bash
# Démarrage en développement
npm run dev

# Build pour production
npm run build

# Démarrage en production
npm start

# Migration de la base de données
npm run db:migrate

# Insertion de données de test
npm run db:seed

# Réinitialisation complète
npm run db:reset
```

### Frontend (`pro-mc/`)

```bash
# Démarrage en développement
npm run dev

# Build pour production
npm run build

# Prévisualisation
npm run preview
```

## 🔐 Authentification

### Utilisateur par défaut :
- **Email** : `abdoulaye.niang@cdp.sn`
- **Mot de passe** : `Passer`
- **Rôle** : `admin`

### Rôles disponibles :
- `admin` - Accès complet
- `supervisor` - Gestion des missions
- `controller` - Création et édition de missions
- `viewer` - Consultation uniquement
- `user` - Accès limité

## 📡 API Endpoints

### Missions
- `GET /api/missions` - Liste des missions
- `GET /api/missions/:id` - Détails d'une mission
- `POST /api/missions` - Créer une mission
- `PUT /api/missions/:id` - Modifier une mission
- `DELETE /api/missions/:id` - Supprimer une mission
- `POST /api/missions/update-statuses` - Mise à jour automatique des statuts

### Utilisateurs
- `GET /api/users` - Liste des utilisateurs
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/:id` - Modifier un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur

### Authentification
- `POST /api/auth/login` - Connexion utilisateur

### Système
- `GET /api/health` - Santé du serveur

## 🔄 Migration des Données Existantes

Si vous avez des données dans localStorage, vous pouvez les migrer :

```bash
# Script de migration (à adapter selon vos besoins)
cd pro-mc/server
npx tsx scripts/migrateFromLocalStorage.ts
```

## 🛠️ Dépannage

### Erreur de connexion PostgreSQL
```bash
# Vérifier que PostgreSQL est démarré
sudo systemctl status postgresql

# Vérifier la connexion
psql -h localhost -U postgres -d cdp_missions
```

### Erreur de port déjà utilisé
```bash
# Changer le port dans .env
PORT=3001
```

### Erreur CORS
```bash
# Vérifier l'URL dans .env
CORS_ORIGIN=http://localhost:5173
```

## 📈 Avantages de PostgreSQL

1. **Performance** : Requêtes optimisées avec index
2. **Fiabilité** : ACID compliance
3. **Scalabilité** : Gestion de gros volumes de données
4. **Sécurité** : Authentification et autorisation robustes
5. **Backup** : Sauvegarde et restauration intégrées
6. **Concurrence** : Gestion multi-utilisateurs

## 🔒 Sécurité

- Mots de passe hashés avec bcrypt
- Rate limiting sur les API
- Validation des données côté serveur
- Gestion des sessions sécurisée
- CORS configuré

## 📝 Notes de Migration

- Les données localStorage ne sont plus utilisées
- L'authentification est maintenant gérée par PostgreSQL
- Les missions sont persistantes en base de données
- Les performances sont améliorées avec les index
- La sécurité est renforcée

## 🎯 Prochaines Étapes

1. Tester toutes les fonctionnalités
2. Configurer les sauvegardes automatiques
3. Optimiser les requêtes si nécessaire
4. Ajouter des logs détaillés
5. Configurer un environnement de production

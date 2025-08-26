# Configuration PostgreSQL pour CDP Missions

## Vue d'ensemble

Cette application utilise PostgreSQL comme base de données principale. Toutes les références à Supabase ont été supprimées et remplacées par PostgreSQL.

## Prérequis

1. **PostgreSQL** installé sur votre machine
2. **Node.js** version 16 ou supérieure
3. **npm** ou **yarn** pour gérer les dépendances

## Installation de PostgreSQL

### Windows
1. Téléchargez PostgreSQL depuis [postgresql.org](https://www.postgresql.org/download/windows/)
2. Installez avec les paramètres par défaut
3. Notez le mot de passe de l'utilisateur `postgres`

### macOS
```bash
# Avec Homebrew
brew install postgresql
brew services start postgresql

# Ou avec Postgres.app
# Téléchargez depuis https://postgresapp.com/
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Configuration de la base de données

### 1. Créer la base de données

Connectez-vous à PostgreSQL :
```bash
# Windows (si ajouté au PATH)
psql -U postgres

# macOS/Linux
sudo -u postgres psql
```

Créez la base de données :
```sql
CREATE DATABASE cdp_missions;
\q
```

### 2. Configuration des variables d'environnement

Créez un fichier `.env` dans le répertoire `pro-mc` :

```env
# Configuration PostgreSQL
VITE_DB_HOST=localhost
VITE_DB_PORT=5432
VITE_DB_NAME=cdp_missions
VITE_DB_USER=postgres
VITE_DB_PASSWORD=votre_mot_de_passe

# Configuration de l'application
VITE_APP_NAME=CDP Missions
VITE_APP_VERSION=1.0.0
```

**Remplacez `votre_mot_de_passe` par le mot de passe de votre utilisateur PostgreSQL.**

### 3. Initialiser la base de données

Exécutez le script d'initialisation :
```bash
npm run init-postgres
```

Ce script va :
- Créer toutes les tables nécessaires
- Insérer l'administrateur par défaut
- Ajouter des données de test
- Vérifier que tout fonctionne correctement

### 4. Tester la connexion

Vérifiez que la connexion fonctionne :
```bash
npm run test-db
```

## Structure de la base de données

### Tables principales :

1. **users** - Gestion des utilisateurs
   - `id` (VARCHAR) - Identifiant unique
   - `email` (VARCHAR) - Adresse email
   - `name` (VARCHAR) - Nom complet
   - `role` (VARCHAR) - Rôle utilisateur
   - `is_active` (BOOLEAN) - Statut actif/inactif
   - `department` (VARCHAR) - Département
   - `phone` (VARCHAR) - Téléphone
   - `password_hash` (VARCHAR) - Hash du mot de passe
   - `created_at` (TIMESTAMP) - Date de création
   - `updated_at` (TIMESTAMP) - Date de modification
   - `last_login` (TIMESTAMP) - Dernière connexion

2. **missions** - Gestion des missions
   - `id` (VARCHAR) - Identifiant unique
   - `title` (VARCHAR) - Titre de la mission
   - `description` (TEXT) - Description
   - `status` (VARCHAR) - Statut (pending, in_progress, completed)
   - `priority` (VARCHAR) - Priorité (low, medium, high)
   - `assigned_to` (VARCHAR) - Utilisateur assigné
   - `created_by` (VARCHAR) - Créateur de la mission
   - `start_date` (DATE) - Date de début
   - `end_date` (DATE) - Date de fin
   - `location` (VARCHAR) - Localisation
   - `budget` (DECIMAL) - Budget
   - `ignore_auto_status_change` (BOOLEAN) - Ignorer les changements automatiques

3. **documents** - Documents liés aux missions
4. **findings** - Constatations des missions
5. **sanctions** - Sanctions appliquées
6. **remarks** - Remarques sur les missions

## Utilisateur par défaut

L'administrateur par défaut est créé automatiquement :
- **Email** : `abdoulaye.niang@cdp.sn`
- **Mot de passe** : `Passer`
- **Rôle** : `admin`

## Scripts disponibles

- `npm run init-postgres` - Initialiser la base de données
- `npm run test-db` - Tester la connexion
- `npm run dev` - Démarrer l'application en mode développement
- `npm run build` - Construire l'application pour la production

## Dépannage

### Erreur de connexion
```
ECONNREFUSED
```
**Solution** : Vérifiez que PostgreSQL est démarré

### Erreur d'authentification
```
28P01: password authentication failed
```
**Solution** : Vérifiez le mot de passe dans le fichier `.env`

### Base de données inexistante
```
3D000: database "cdp_missions" does not exist
```
**Solution** : Créez la base de données avec `CREATE DATABASE cdp_missions;`

### Erreur de permissions
```
42501: permission denied
```
**Solution** : Vérifiez que l'utilisateur a les droits sur la base de données

## Migration depuis Supabase

Si vous migrez depuis Supabase :

1. Exportez vos données depuis Supabase
2. Adaptez le format des données au schéma PostgreSQL
3. Utilisez le script d'initialisation pour créer les tables
4. Importez vos données dans PostgreSQL

## Sécurité

- Les mots de passe sont hachés avant stockage
- Les connexions utilisent des paramètres préparés
- Les permissions sont gérées au niveau de l'application
- Les sessions utilisent localStorage avec expiration

## Sauvegarde

Pour sauvegarder votre base de données :
```bash
pg_dump -U postgres cdp_missions > backup.sql
```

Pour restaurer :
```bash
psql -U postgres cdp_missions < backup.sql
```

## Support

En cas de problème :
1. Vérifiez les logs de PostgreSQL
2. Testez la connexion avec `npm run test-db`
3. Consultez la documentation PostgreSQL
4. Vérifiez la configuration dans le fichier `.env`

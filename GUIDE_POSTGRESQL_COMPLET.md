# Guide Complet PostgreSQL - CDP Missions

## 🎯 Objectif

**Toutes les données de l'application sont maintenant stockées de manière permanente dans une base de données PostgreSQL**, garantissant :
- ✅ **Persistance complète** des données
- ✅ **Synchronisation** entre tous les navigateurs
- ✅ **Sécurité** et intégrité des données
- ✅ **Performance** optimale
- ✅ **Sauvegarde** et récupération

## 🗄️ Architecture PostgreSQL

### **Tables créées :**
1. **`users`** - Gestion des utilisateurs et rôles
2. **`missions`** - Missions et projets
3. **`documents`** - Documents attachés aux missions
4. **`findings`** - Constatations et observations
5. **`sanctions`** - Sanctions et pénalités
6. **`remarks`** - Remarques et commentaires

### **Relations :**
- Missions → Users (créateur, assigné)
- Documents → Missions (cascade delete)
- Findings → Missions (cascade delete)
- Sanctions → Missions (cascade delete)
- Remarks → Missions (cascade delete)

## 🚀 Installation et Configuration

### **Étape 1 : Installer PostgreSQL**

#### **Windows :**
1. Télécharger PostgreSQL depuis : https://www.postgresql.org/download/windows/
2. Installer avec les paramètres par défaut
3. Noter le mot de passe de l'utilisateur `postgres`

#### **macOS :**
```bash
# Avec Homebrew
brew install postgresql
brew services start postgresql

# Ou avec Postgres.app
# Télécharger depuis : https://postgresapp.com/
```

#### **Linux (Ubuntu/Debian) :**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### **Étape 2 : Créer la base de données**

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base de données
CREATE DATABASE cdp_missions;

# Vérifier la création
\l

# Quitter
\q
```

### **Étape 3 : Configurer les variables d'environnement**

```bash
# Copier le fichier d'exemple
cp server/env.example server/.env

# Éditer le fichier .env
nano server/.env
```

**Contenu du fichier `.env` :**
```env
# Configuration de la base de données PostgreSQL
DB_USER=postgres
DB_HOST=localhost
DB_NAME=cdp_missions
DB_PASSWORD=votre_mot_de_passe_postgres
DB_PORT=5432

# Configuration du serveur
PORT=3000
NODE_ENV=development

# Clé secrète pour JWT (à changer en production)
JWT_SECRET=cdp-missions-secret-key-2024
```

### **Étape 4 : Installer les dépendances**

```bash
# Installer les dépendances du serveur
cd server
npm install

# Retourner au répertoire principal
cd ..
```

### **Étape 5 : Initialiser la base de données**

```bash
# Créer les tables
npm run db:migrate

# Insérer les données initiales
npm run db:seed
```

### **Étape 6 : Démarrer l'application**

```bash
# Option 1 : Démarrage complet (build + serveur)
npm start

# Option 2 : Démarrage séparé
npm run build
npm run server
```

## 📊 Scripts de gestion de la base de données

### **Migration (créer les tables) :**
```bash
npm run db:migrate
```

### **Seeding (données initiales) :**
```bash
npm run db:seed
```

### **Reset (réinitialiser) :**
```bash
npm run db:reset
```

## 🔍 Vérification de l'installation

### **Test de connexion :**
```bash
# Tester la connexion à la base de données
curl http://localhost:3000/api/health
```

**Réponse attendue :**
```json
{
  "status": "OK",
  "message": "Serveur CDP Missions opérationnel",
  "database": "PostgreSQL connecté"
}
```

### **Vérifier les tables :**
```bash
# Se connecter à PostgreSQL
psql -U postgres -d cdp_missions

# Lister les tables
\dt

# Vérifier les utilisateurs
SELECT * FROM users;

# Vérifier les missions
SELECT * FROM missions;

# Quitter
\q
```

## 🛠️ Gestion des données

### **Sauvegarde :**
```bash
# Sauvegarder la base de données
pg_dump -U postgres cdp_missions > backup_$(date +%Y%m%d_%H%M%S).sql
```

### **Restauration :**
```bash
# Restaurer la base de données
psql -U postgres cdp_missions < backup_20240101_120000.sql
```

### **Nettoyage :**
```bash
# Supprimer toutes les données (sauf admin)
npm run db:reset
```

## 🔒 Sécurité

### **Mesures implémentées :**
- ✅ **Hachage des mots de passe** avec bcrypt
- ✅ **Validation des données** côté serveur
- ✅ **Rate limiting** (100 requêtes/15min par IP)
- ✅ **Headers de sécurité** avec Helmet
- ✅ **Protection CORS** configurée
- ✅ **Requêtes préparées** (protection SQL injection)

### **Recommandations :**
1. **Changer le mot de passe admin** par défaut
2. **Configurer un mot de passe fort** pour PostgreSQL
3. **Limiter l'accès** à la base de données
4. **Sauvegarder régulièrement** les données
5. **Surveiller les logs** du serveur

## 📈 Performance

### **Index créés automatiquement :**
- `idx_users_email` - Recherche rapide par email
- `idx_missions_status` - Filtrage par statut
- `idx_missions_created_by` - Missions par créateur
- `idx_documents_mission_id` - Documents par mission
- `idx_findings_mission_id` - Constatations par mission
- `idx_sanctions_mission_id` - Sanctions par mission
- `idx_remarks_mission_id` - Remarques par mission

### **Optimisations :**
- **Pool de connexions** configuré
- **Requêtes optimisées** avec JOIN
- **Triggers automatiques** pour `updated_at`
- **Cascade delete** pour les relations

## 🚨 Dépannage

### **Erreur de connexion PostgreSQL :**
```bash
# Vérifier que PostgreSQL est démarré
sudo systemctl status postgresql

# Redémarrer PostgreSQL
sudo systemctl restart postgresql

# Vérifier les logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### **Erreur d'authentification :**
```bash
# Vérifier le fichier pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf

# Redémarrer PostgreSQL après modification
sudo systemctl restart postgresql
```

### **Erreur de base de données inexistante :**
```bash
# Créer la base de données
sudo -u postgres createdb cdp_missions

# Ou se connecter et créer
sudo -u postgres psql
CREATE DATABASE cdp_missions;
\q
```

### **Erreur de permissions :**
```bash
# Donner les permissions à l'utilisateur
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE cdp_missions TO postgres;
\q
```

## 📊 Monitoring

### **Statistiques de la base de données :**
```sql
-- Nombre d'utilisateurs
SELECT COUNT(*) FROM users;

-- Nombre de missions par statut
SELECT status, COUNT(*) FROM missions GROUP BY status;

-- Missions récentes
SELECT title, created_at FROM missions ORDER BY created_at DESC LIMIT 10;

-- Utilisateurs actifs
SELECT name, last_login FROM users WHERE is_active = true;
```

### **Logs du serveur :**
```bash
# Voir les logs en temps réel
tail -f server/logs/app.log

# Voir les erreurs
grep ERROR server/logs/app.log
```

## 🔄 Migration depuis localStorage

### **Si vous avez des données dans localStorage :**
1. **Exporter** les données depuis localStorage
2. **Convertir** au format PostgreSQL
3. **Importer** avec les scripts de migration

### **Script d'import personnalisé :**
```javascript
// Exemple d'import de données localStorage vers PostgreSQL
const localStorageData = JSON.parse(localStorage.getItem('cdp_users'));
// ... conversion et import
```

## 🎉 Avantages de PostgreSQL

### **Par rapport à localStorage :**
- ✅ **Données permanentes** (pas de perte)
- ✅ **Synchronisation** entre navigateurs
- ✅ **Sécurité** renforcée
- ✅ **Performance** optimale
- ✅ **Sauvegarde** automatique

### **Par rapport à SQLite :**
- ✅ **Concurrence** multi-utilisateurs
- ✅ **Performance** supérieure
- ✅ **Fonctionnalités** avancées
- ✅ **Scalabilité** horizontale

---

## ✅ Résumé

**Votre application CDP Missions utilise maintenant PostgreSQL comme base de données principale !**

**Avantages obtenus :**
- 🗄️ **Persistance complète** des données
- 🔄 **Synchronisation** entre tous les navigateurs
- 🔒 **Sécurité** renforcée
- ⚡ **Performance** optimale
- 📊 **Monitoring** et maintenance facilités

**L'application est maintenant prête pour un usage professionnel avec une base de données robuste !** 🎯

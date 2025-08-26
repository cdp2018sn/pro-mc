# 🚀 Installation Rapide PostgreSQL - CDP Missions

## 📋 Prérequis

- **Windows 10/11** avec PowerShell
- **Node.js** (version 16 ou supérieure)
- **npm** (inclus avec Node.js)

## ⚡ Installation en 5 minutes

### **Étape 1 : Installer PostgreSQL**

1. **Télécharger PostgreSQL** :
   - Allez sur : https://www.postgresql.org/download/windows/
   - Cliquez sur "Download the installer"
   - Choisissez la version **15** ou **16**

2. **Installer PostgreSQL** :
   - Lancez l'installateur téléchargé
   - Cliquez sur "Next" pour tous les paramètres par défaut
   - **IMPORTANT** : Notez le mot de passe de l'utilisateur `postgres`
   - Terminez l'installation

### **Étape 2 : Configuration automatique**

1. **Ouvrir PowerShell** dans le dossier de l'application :
   ```powershell
   cd "C:\plateforme MC\project-mc\pro-mc"
   ```

2. **Lancer le script d'installation** :
   ```powershell
   .\setup-postgresql.bat
   ```

3. **Suivre les instructions** à l'écran

### **Étape 3 : Démarrer l'application**

```powershell
npm start
```

L'application sera disponible sur : **http://localhost:3000**

## 🔧 Configuration manuelle (si nécessaire)

### **Créer la base de données manuellement** :

```powershell
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE cdp_missions;

# Vérifier la création
\l

# Quitter
\q
```

### **Configurer le fichier .env** :

```powershell
# Copier le fichier d'exemple
copy server\env.example server\.env

# Éditer le fichier .env avec vos paramètres
notepad server\.env
```

**Contenu du fichier `.env`** :
```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=cdp_missions
DB_PASSWORD=votre_mot_de_passe_postgres
DB_PORT=5432
PORT=3000
NODE_ENV=development
JWT_SECRET=cdp-missions-secret-key-2024
```

### **Initialiser la base de données** :

```powershell
cd server

# Créer les tables
npm run db:migrate

# Insérer les données initiales
npm run db:seed

cd ..
```

## ✅ Vérification de l'installation

### **Test de connexion** :
```powershell
# Tester l'API
curl http://localhost:3000/api/health
```

**Réponse attendue** :
```json
{
  "status": "OK",
  "message": "Serveur CDP Missions opérationnel",
  "database": "PostgreSQL connecté"
}
```

### **Vérifier les tables** :
```powershell
# Se connecter à la base de données
psql -U postgres -d cdp_missions

# Lister les tables
\dt

# Vérifier les utilisateurs
SELECT * FROM users;

# Quitter
\q
```

## 🚨 Dépannage

### **Erreur "psql n'est pas reconnu"** :
- PostgreSQL n'est pas installé ou pas dans le PATH
- Réinstallez PostgreSQL et redémarrez PowerShell

### **Erreur de connexion** :
- Vérifiez que PostgreSQL est démarré
- Vérifiez le mot de passe dans le fichier `.env`
- Redémarrez le service PostgreSQL

### **Erreur "database does not exist"** :
- Créez la base de données : `CREATE DATABASE cdp_missions;`

### **Erreur de permissions** :
- Vérifiez que l'utilisateur `postgres` a les droits d'accès

## 📊 Données par défaut

L'application crée automatiquement :

- **Administrateur** : `abdoulaye.niang@cdp.sn` / `Passer`
- **3 missions de test** avec constatations et remarques
- **Structure complète** avec 6 tables

## 🎯 Utilisation

1. **Ouvrir** http://localhost:3000
2. **Se connecter** avec l'admin par défaut
3. **Créer** des utilisateurs et missions
4. **Toutes les données** sont sauvegardées en permanence

---

## ✅ Résumé

**En 5 minutes, vous avez :**
- ✅ PostgreSQL installé et configuré
- ✅ Base de données créée avec toutes les tables
- ✅ Données initiales insérées
- ✅ Application prête à utiliser

**Votre application CDP Missions utilise maintenant une vraie base de données PostgreSQL !** 🎉

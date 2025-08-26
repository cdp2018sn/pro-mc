# 🎯 CDP Missions - Application de Gestion des Missions

Application web moderne pour la gestion des missions de contrôle et d'audit avec base de données PostgreSQL.

## 🚀 Fonctionnalités

- ✅ **Gestion des utilisateurs** avec rôles et permissions
- ✅ **Gestion des missions** avec statuts et priorités
- ✅ **Constatations et remarques** liées aux missions
- ✅ **Documents et sanctions** attachés aux missions
- ✅ **Base de données PostgreSQL** pour persistance complète
- ✅ **Interface moderne** avec React et Tailwind CSS
- ✅ **API REST sécurisée** avec validation et rate limiting
- ✅ **Synchronisation** entre tous les navigateurs

## 🛠️ Technologies utilisées

### **Frontend :**
- **React 18** avec TypeScript
- **Vite** pour le build et le développement
- **Tailwind CSS** pour le styling
- **React Router** pour la navigation
- **React Hot Toast** pour les notifications

### **Backend :**
- **Node.js** avec Express.js
- **PostgreSQL** comme base de données principale
- **bcryptjs** pour le hachage des mots de passe
- **JWT** pour l'authentification
- **Helmet** pour la sécurité
- **Rate limiting** pour la protection

## 📋 Prérequis

- **Node.js** (version 16 ou supérieure)
- **npm** (inclus avec Node.js)
- **PostgreSQL** (version 15 ou 16)
- **Git** pour la gestion de version

## ⚡ Installation rapide

### **1. Cloner le repository**
```bash
git clone <votre-repo-url>
cd pro-mc
```

### **2. Installer PostgreSQL**
- Télécharger depuis : https://www.postgresql.org/download/windows/
- Installer avec les paramètres par défaut
- Noter le mot de passe de l'utilisateur `postgres`

### **3. Configuration automatique**
```bash
# Lancer le script d'installation
.\setup-postgresql.bat
```

### **4. Démarrer l'application**
```bash
npm start
```

L'application sera disponible sur : **http://localhost:3000**

## 🔧 Configuration manuelle

### **Créer la base de données**
```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE cdp_missions;

# Quitter
\q
```

### **Configurer les variables d'environnement**
```bash
# Copier le fichier d'exemple
copy server\env.example server\.env

# Éditer avec vos paramètres
notepad server\.env
```

### **Initialiser la base de données**
```bash
cd server

# Créer les tables
npm run db:migrate

# Insérer les données initiales
npm run db:seed

cd ..
```

## 📊 Structure du projet

```
pro-mc/
├── src/                    # Code source frontend
│   ├── components/         # Composants React
│   ├── services/          # Services API
│   ├── types/             # Types TypeScript
│   └── utils/             # Utilitaires
├── server/                # Serveur backend
│   ├── config/            # Configuration base de données
│   ├── scripts/           # Scripts de migration
│   └── index.js           # Serveur Express
├── dist/                  # Build de production
├── .gitignore            # Fichiers ignorés par Git
├── package.json          # Dépendances frontend
├── setup-postgresql.bat  # Script d'installation
└── README.md             # Documentation
```

## 🗄️ Base de données

### **Tables créées :**
- **`users`** - Gestion des utilisateurs et rôles
- **`missions`** - Missions et projets
- **`documents`** - Documents attachés aux missions
- **`findings`** - Constatations et observations
- **`sanctions`** - Sanctions et pénalités
- **`remarks`** - Remarques et commentaires

### **Scripts de gestion :**
```bash
# Migration (créer les tables)
npm run db:migrate

# Seeding (données initiales)
npm run db:seed

# Reset (réinitialiser)
npm run db:reset
```

## 🚀 Scripts disponibles

### **Développement :**
```bash
npm run dev          # Frontend uniquement
npm run server:dev   # Serveur avec auto-reload
```

### **Production :**
```bash
npm start            # Build + serveur
npm run server       # Serveur uniquement
npm run build        # Build frontend
```

## 🔒 Sécurité

### **Mesures implémentées :**
- ✅ **Hachage des mots de passe** avec bcrypt
- ✅ **Validation des données** côté serveur
- ✅ **Rate limiting** (100 requêtes/15min par IP)
- ✅ **Headers de sécurité** avec Helmet
- ✅ **Protection CORS** configurée
- ✅ **Requêtes préparées** (protection SQL injection)

## 📊 Données par défaut

L'application crée automatiquement :
- **Administrateur** : `abdoulaye.niang@cdp.sn` / `Passer`
- **3 missions de test** avec constatations et remarques
- **Structure complète** avec 6 tables

## 🔄 Gestion Git

### **Premier commit :**
```bash
git add .
git commit -m "Initial commit: CDP Missions avec PostgreSQL"
```

### **Ajouter un remote :**
```bash
git remote add origin <votre-repo-url>
git push -u origin main
```

### **Workflow quotidien :**
```bash
# Voir les changements
git status

# Ajouter les fichiers modifiés
git add .

# Créer un commit
git commit -m "Description des changements"

# Pousser vers le repository
git push
```

## 🚨 Dépannage

### **Erreur de port déjà utilisé :**
```bash
# Tuer le processus sur le port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### **Erreur de connexion PostgreSQL :**
- Vérifier que PostgreSQL est démarré
- Vérifier le mot de passe dans le fichier `.env`
- Redémarrer le service PostgreSQL

### **Erreur de dépendances :**
```bash
# Réinstaller les dépendances
rm -rf node_modules
npm install
```

## 📈 Performance

### **Optimisations :**
- **Index optimisés** sur les colonnes fréquemment utilisées
- **Pool de connexions** PostgreSQL configuré
- **Requêtes optimisées** avec JOIN
- **Triggers automatiques** pour `updated_at`
- **Cascade delete** pour les relations

## 🎯 Utilisation

1. **Ouvrir** http://localhost:3000
2. **Se connecter** avec l'admin par défaut
3. **Créer** des utilisateurs et missions
4. **Toutes les données** sont sauvegardées en permanence

## 📝 Changelog

### **Version 1.0.0**
- ✅ Application complète avec PostgreSQL
- ✅ Gestion des utilisateurs et missions
- ✅ Interface moderne avec React
- ✅ API REST sécurisée
- ✅ Documentation complète

## 🤝 Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commit vos changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## ✅ Résumé

**CDP Missions** est une application web moderne et robuste pour la gestion des missions de contrôle et d'audit, utilisant PostgreSQL comme base de données principale pour garantir la persistance et la synchronisation des données.

**Fonctionnalités clés :**
- 🗄️ **Base de données PostgreSQL** robuste
- 🔄 **Synchronisation** entre navigateurs
- 🔒 **Sécurité** renforcée
- ⚡ **Performance** optimale
- 📊 **Interface** moderne et intuitive

**Prêt pour un usage professionnel !** 🎉

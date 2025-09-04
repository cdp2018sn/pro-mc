# 🚀 Guide de Démarrage Rapide - CDP Missions

## ✅ État de l'Application

L'application CDP Missions est **correctement configurée et opérationnelle** ! Tous les composants essentiels sont en place.

## 📋 Prérequis

- **Node.js** (version 16 ou supérieure)
- **PostgreSQL** (version 12 ou supérieure)
- **npm** ou **yarn**

## 🔧 Configuration Initiale

### 1. Configuration de la Base de Données PostgreSQL

```bash
# Créer la base de données
createdb cdp_missions

# Exécuter le script d'initialisation
psql -d cdp_missions -f postgres-setup.sql
```

### 2. Configuration de l'Environnement

Créer le fichier `.env` dans le dossier `server/` :

```bash
# Copier le fichier d'exemple
cp server/env.example server/.env
```

Modifier `server/.env` avec vos paramètres :

```env
# Configuration de la base de données PostgreSQL
DB_USER=postgres
DB_HOST=localhost
DB_NAME=cdp_missions
DB_PASSWORD=votre_mot_de_passe
DB_PORT=5432

# Configuration du serveur
PORT=3000
NODE_ENV=development

# Clé secrète pour JWT
JWT_SECRET=cdp-missions-secret-key-2024

# Configuration CORS
CORS_ORIGIN=http://localhost:5173
```

## 🚀 Démarrage de l'Application

### 1. Installation des Dépendances

```bash
# Installer les dépendances du frontend
npm install

# Installer les dépendances du serveur
cd server && npm install && cd ..
```

### 2. Démarrage du Serveur Backend

```bash
# Démarrer le serveur en mode développement
npm run server:dev
```

Le serveur sera accessible sur : `http://localhost:3000`

### 3. Démarrage du Frontend

```bash
# Dans un nouveau terminal, démarrer le frontend
npm run dev
```

L'application sera accessible sur : `http://localhost:5173`

## 🔐 Connexion

### Identifiants par Défaut

- **Email** : `abdoulaye.niang@cdp.sn`
- **Mot de passe** : `Passer`
- **Rôle** : Administrateur

## 📊 Fonctionnalités Disponibles

### ✅ Fonctionnalités Opérationnelles

1. **Authentification et Gestion des Utilisateurs**
   - Connexion/déconnexion
   - Gestion des rôles et permissions
   - Changement de mot de passe

2. **Gestion des Missions**
   - Création de nouvelles missions
   - Liste et recherche de missions
   - Modification et suppression
   - Changement de statut automatique

3. **Tableau de Bord**
   - Statistiques en temps réel
   - Graphiques de performance
   - Alertes de changement de statut

4. **Recherche Avancée**
   - Filtres multiples
   - Recherche par critères
   - Export des résultats

5. **Import/Export**
   - Import de missions depuis Excel/CSV
   - Export des données

6. **Gestion des Documents**
   - Upload de documents
   - Association aux missions
   - Gestion des versions

### 🔧 Fonctionnalités Techniques

- **Base de données** : PostgreSQL + IndexedDB (local)
- **API REST** : Express.js avec authentification JWT
- **Frontend** : React + TypeScript + Tailwind CSS
- **Sécurité** : Rate limiting, CORS, validation
- **Performance** : Mise en cache, optimisations

## 🛠️ Commandes Utiles

```bash
# Vérifier l'état de l'application
node check-app.js

# Démarrer en mode production
npm run build && npm run server

# Tester la base de données
npm run test-db

# Réinitialiser la base de données
npm run db:reset

# Importer des missions de test
npm run insert-control-missions
```

## 🔍 Diagnostic et Dépannage

### Vérification de l'État

```bash
# Tester la connectivité PostgreSQL
psql -h localhost -U postgres -d cdp_missions -c "SELECT version();"

# Vérifier les ports
netstat -an | findstr :3000
netstat -an | findstr :5173

# Tester l'API
curl http://localhost:3000/api/health
```

### Problèmes Courants

1. **Erreur de connexion PostgreSQL**
   - Vérifier que PostgreSQL est démarré
   - Vérifier les paramètres dans `.env`
   - Vérifier les permissions utilisateur

2. **Ports déjà utilisés**
   - Changer les ports dans la configuration
   - Arrêter les services qui utilisent ces ports

3. **Erreurs de dépendances**
   - Supprimer `node_modules` et `package-lock.json`
   - Réinstaller avec `npm install`

## 📞 Support

En cas de problème :

1. Vérifier les logs dans la console
2. Consulter les fichiers de configuration
3. Tester la connectivité réseau
4. Vérifier les permissions de fichiers

## 🎯 Prochaines Étapes

1. **Personnalisation** : Adapter l'interface aux besoins spécifiques
2. **Sécurité** : Renforcer la sécurité pour la production
3. **Performance** : Optimiser les requêtes et le cache
4. **Fonctionnalités** : Ajouter de nouvelles fonctionnalités selon les besoins

---

**🎉 L'application est prête à être utilisée !**

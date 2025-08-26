# Guide de Synchronisation - CDP Missions

## 🎯 Problème résolu

**Problème initial :** Les données créées dans un navigateur n'étaient pas visibles dans un autre navigateur car l'application utilisait uniquement localStorage.

**Solution :** Implémentation d'un serveur backend avec API REST pour centraliser les données.

## 🏗️ Architecture de la solution

### **Avant (localStorage uniquement)**
```
Navigateur A → localStorage A (données isolées)
Navigateur B → localStorage B (données isolées)
Navigateur C → localStorage C (données isolées)
```

### **Après (API + localStorage de fallback)**
```
Navigateur A → API Backend → Fichier JSON centralisé
Navigateur B → API Backend → Fichier JSON centralisé  
Navigateur C → API Backend → Fichier JSON centralisé
```

## 🚀 Comment utiliser la nouvelle solution

### **1. Démarrer le serveur backend**

```bash
# Installer les dépendances du serveur
cd server
npm install

# Démarrer le serveur
npm start
```

### **2. Démarrer l'application frontend**

```bash
# Dans un autre terminal
npm run dev
```

### **3. Ou démarrer tout ensemble**

```bash
# Construit l'app et démarre le serveur
npm start
```

## 📊 Fonctionnalités de synchronisation

### **✅ Avantages de la nouvelle solution :**

1. **Données partagées** entre tous les navigateurs
2. **Synchronisation en temps réel** des utilisateurs et missions
3. **Fallback automatique** vers localStorage si le serveur n'est pas disponible
4. **Persistance des données** dans un fichier JSON
5. **API REST complète** pour toutes les opérations CRUD

### **🔄 Fonctionnement :**

1. **Création d'utilisateur** → Sauvegardé sur le serveur → Visible partout
2. **Modification d'utilisateur** → Mise à jour sur le serveur → Synchronisé partout
3. **Suppression d'utilisateur** → Supprimé du serveur → Supprimé partout
4. **Création de mission** → Sauvegardée sur le serveur → Visible partout

## 🔧 Configuration technique

### **Serveur Backend (Express.js)**
- **Port :** 3000
- **API :** `http://localhost:3000/api`
- **Données :** Stockées dans `server/data.json`
- **CORS :** Activé pour permettre les requêtes cross-origin

### **Frontend (React + Vite)**
- **Port :** 5173 (développement)
- **API calls :** Vers `http://localhost:3000/api`
- **Fallback :** localStorage si l'API n'est pas disponible

## 📁 Structure des fichiers

```
pro-mc/
├── server/
│   ├── index.js          # Serveur Express
│   ├── package.json      # Dépendances du serveur
│   └── data.json         # Données centralisées
├── src/
│   ├── services/
│   │   └── postgresService.ts  # Service API avec fallback
│   └── ...
└── package.json          # Scripts de démarrage
```

## 🛠️ Scripts disponibles

### **Développement :**
```bash
npm run dev          # Frontend uniquement
npm run server:dev   # Serveur avec auto-reload
```

### **Production :**
```bash
npm start            # Build + serveur
npm run server       # Serveur uniquement
```

## 🔍 Test de la synchronisation

### **Test 1 : Création d'utilisateur**
1. Ouvrez l'app dans **Navigateur A**
2. Créez un nouvel utilisateur
3. Ouvrez l'app dans **Navigateur B**
4. Vérifiez que l'utilisateur apparaît

### **Test 2 : Modification d'utilisateur**
1. Modifiez un utilisateur dans **Navigateur A**
2. Rafraîchissez **Navigateur B**
3. Vérifiez que les modifications sont visibles

### **Test 3 : Suppression d'utilisateur**
1. Supprimez un utilisateur dans **Navigateur A**
2. Vérifiez qu'il disparaît dans **Navigateur B**

## 🚨 Gestion des erreurs

### **Si le serveur n'est pas disponible :**
- L'application bascule automatiquement vers localStorage
- Les données restent disponibles localement
- Un message d'erreur s'affiche dans la console

### **Si l'API retourne une erreur :**
- Fallback vers localStorage
- Tentative de récupération automatique
- Logs détaillés dans la console

## 📊 API Endpoints

### **Utilisateurs :**
- `GET /api/users` - Récupérer tous les utilisateurs
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/:id` - Modifier un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur

### **Missions :**
- `GET /api/missions` - Récupérer toutes les missions
- `POST /api/missions` - Créer une mission
- `PUT /api/missions/:id` - Modifier une mission
- `DELETE /api/missions/:id` - Supprimer une mission

### **Santé :**
- `GET /api/health` - Vérifier l'état du serveur

## 🔒 Sécurité

### **Mesures implémentées :**
- **CORS configuré** pour les requêtes cross-origin
- **Validation des données** côté serveur
- **Protection contre la suppression** de l'admin principal
- **Gestion des erreurs** robuste

### **Recommandations :**
- **Changer le mot de passe admin** par défaut
- **Sauvegarder régulièrement** le fichier `data.json`
- **Surveiller les logs** du serveur
- **Limiter l'accès** au serveur en production

## 🚀 Déploiement

### **Développement local :**
```bash
npm start
```

### **Production :**
1. **Build de l'application :** `npm run build`
2. **Démarrage du serveur :** `npm run server`
3. **Configuration du reverse proxy** (nginx, Apache)
4. **Configuration SSL** pour HTTPS

## 📝 Notes importantes

### **Données persistantes :**
- Les données sont stockées dans `server/data.json`
- **Sauvegardez ce fichier** régulièrement
- **Ne supprimez pas** ce fichier sans sauvegarde

### **Performance :**
- Le serveur utilise un fichier JSON simple
- **Pour de gros volumes**, considérez une base de données
- **Pour la production**, utilisez PostgreSQL ou MongoDB

### **Évolutivité :**
- **Ajout facile** de nouvelles routes API
- **Migration simple** vers une base de données
- **Extension possible** avec authentification JWT

---

## ✅ Résumé

**Problème résolu :** Les données sont maintenant synchronisées entre tous les navigateurs grâce à un serveur backend centralisé.

**Avantages :**
- ✅ Données partagées entre navigateurs
- ✅ Synchronisation en temps réel
- ✅ Fallback automatique vers localStorage
- ✅ API REST complète
- ✅ Facile à déployer et maintenir

**L'application est maintenant prête pour un usage multi-utilisateurs !** 🎉

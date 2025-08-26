# Configuration CDP Missions - Version localStorage

## Vue d'ensemble

Cette application utilise **localStorage** comme base de données locale pour fonctionner directement dans le navigateur. Toutes les données sont stockées localement sur votre machine.

## ✅ Avantages de cette approche

- **Aucune installation de base de données requise**
- **Fonctionne immédiatement dans le navigateur**
- **Données persistantes entre les sessions**
- **Pas de configuration complexe**
- **Portable et autonome**

## 🚀 Démarrage rapide

### 1. Installer les dépendances
```bash
npm install
```

### 2. Démarrer l'application
```bash
npm run dev
```

### 3. Ouvrir dans le navigateur
L'application sera disponible à l'adresse : `http://localhost:5173`

## 🔑 Identifiants de connexion par défaut

- **Email** : `abdoulaye.niang@cdp.sn`
- **Mot de passe** : `Passer`
- **Rôle** : `admin`

## 📊 Structure des données

L'application stocke les données dans localStorage avec les clés suivantes :

- `cdp_postgres_users` - Utilisateurs
- `cdp_postgres_missions` - Missions
- `cdp_postgres_documents` - Documents
- `cdp_postgres_findings` - Constatations
- `cdp_postgres_sanctions` - Sanctions
- `cdp_postgres_remarks` - Remarques

## 🔧 Scripts disponibles

- `npm run dev` - Démarrer l'application en mode développement
- `npm run build` - Construire l'application pour la production
- `npm run preview` - Prévisualiser la version de production
- `npm run test-db` - Tester la connexion localStorage

## 📁 Gestion des données

### Sauvegarde
Les données sont automatiquement sauvegardées dans localStorage. Pour sauvegarder manuellement :

1. Ouvrez les outils de développement (F12)
2. Allez dans l'onglet "Application" ou "Storage"
3. Localisez "Local Storage"
4. Copiez les données des clés `cdp_postgres_*`

### Restauration
Pour restaurer des données :

1. Ouvrez les outils de développement (F12)
2. Allez dans l'onglet "Application" ou "Storage"
3. Localisez "Local Storage"
4. Collez les données sauvegardées

### Réinitialisation
Pour réinitialiser toutes les données :

1. Ouvrez les outils de développement (F12)
2. Allez dans l'onglet "Application" ou "Storage"
3. Localisez "Local Storage"
4. Supprimez toutes les clés `cdp_postgres_*`
5. Rechargez la page

## 🛠️ Fonctionnalités

### Gestion des utilisateurs
- ✅ Création d'utilisateurs avec différents rôles
- ✅ Modification des informations utilisateur
- ✅ Suppression d'utilisateurs
- ✅ Gestion des permissions par rôle

### Gestion des missions
- ✅ Création de missions
- ✅ Modification des missions
- ✅ Suppression de missions
- ✅ Suivi des statuts

### Sécurité
- ✅ Authentification utilisateur
- ✅ Gestion des sessions
- ✅ Protection contre les tentatives de connexion multiples
- ✅ Permissions granulaires

## 🔒 Sécurité et limitations

### Limitations de localStorage
- **Taille limitée** : ~5-10 MB selon le navigateur
- **Données locales** : Non synchronisées entre appareils
- **Pas de chiffrement** : Les données sont stockées en clair

### Recommandations
- Utilisez cette version pour le développement et les tests
- Pour la production, considérez une base de données serveur
- Sauvegardez régulièrement vos données importantes

## 🚨 Dépannage

### L'application ne démarre pas
```bash
# Vérifiez que Node.js est installé
node --version

# Réinstallez les dépendances
npm install

# Démarrez l'application
npm run dev
```

### Les données ont disparu
- Vérifiez que localStorage n'est pas désactivé
- Vérifiez l'espace de stockage disponible
- Restaurez depuis une sauvegarde

### Erreur de connexion
- Vérifiez que le navigateur supporte localStorage
- Essayez un autre navigateur
- Videz le cache et les cookies

## 📈 Migration vers une base de données serveur

Si vous souhaitez migrer vers PostgreSQL ou une autre base de données :

1. **Exporter les données** depuis localStorage
2. **Adapter le format** des données au schéma de la base
3. **Modifier le service** pour utiliser l'API de la base de données
4. **Tester** la migration

## 🆘 Support

En cas de problème :
1. Vérifiez la console du navigateur (F12)
2. Consultez les logs d'erreur
3. Vérifiez l'espace de stockage localStorage
4. Testez avec un autre navigateur

## 📝 Notes importantes

- Cette version est optimisée pour le développement et les tests
- Les données sont persistantes mais locales à votre navigateur
- Pour un usage en équipe, considérez une base de données partagée
- Sauvegardez régulièrement vos données importantes

---

**L'application est maintenant prête à être utilisée !** 🎉

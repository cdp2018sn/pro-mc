# 🧪 Test des Permissions en Français

## 🎯 Objectif
Vérifier que les permissions des rôles s'affichent correctement en français dans la gestion des utilisateurs.

## 🚀 Instructions de test

### **1. Accéder à l'application**
- **URL** : http://localhost:5173
- **Status** : ✅ Application démarrée et accessible

### **2. Se connecter en tant qu'administrateur**
- **Email** : `abdoulaye.niang@cdp.sn`
- **Mot de passe** : `Passer`

### **3. Aller dans "Gestion utilisateurs"**
- Cliquez sur le lien "Gestion utilisateurs" dans le menu
- Vérifiez que vous avez accès (seuls les admins peuvent y accéder)

### **4. Tester la création d'utilisateur**
- Cliquez sur "Créer un utilisateur"
- Remplissez le formulaire avec :
  - **Email** : `test@example.com`
  - **Nom** : `Utilisateur Test`
  - **Mot de passe** : `test123456`
  - **Rôle** : Sélectionnez différents rôles pour tester

### **5. Vérifier l'affichage des permissions**
Pour chaque rôle sélectionné, vérifiez que les permissions s'affichent en français :

#### **✅ Permissions attendues en français :**
- `canCreateMissions` → **Créer des missions**
- `canEditMissions` → **Modifier des missions**
- `canDeleteMissions` → **Supprimer des missions**
- `canViewAllMissions` → **Voir toutes les missions**
- `canImportMissions` → **Importer des missions**
- `canManageUsers` → **Gérer les utilisateurs**
- `canViewReports` → **Voir les rapports**
- `canEditReports` → **Modifier les rapports**
- `canManageDocuments` → **Gérer les documents**
- `canChangeStatus` → **Changer le statut**
- `canViewDebug` → **Accéder au debug**

### **6. Tester l'édition d'utilisateur**
- Cliquez sur "Modifier" pour un utilisateur existant
- Changez le rôle et vérifiez que les permissions s'affichent en français
- Sauvegardez les modifications

## 🔍 Points de vérification

### **Interface utilisateur**
- [ ] Les permissions s'affichent en français
- [ ] Les couleurs vert/rouge fonctionnent correctement
- [ ] L'affichage est lisible et professionnel
- [ ] Pas d'erreurs dans la console

### **Fonctionnalité**
- [ ] Création d'utilisateur fonctionne
- [ ] Édition d'utilisateur fonctionne
- [ ] Changement de rôle met à jour les permissions
- [ ] Sauvegarde des modifications fonctionne

### **Sécurité**
- [ ] Seuls les administrateurs peuvent accéder
- [ ] Protection des routes active
- [ ] Validation des données fonctionne

## 📊 Résultats attendus

### **Rôle Admin**
- ✅ Toutes les permissions en vert
- ✅ Accès complet à toutes les fonctionnalités

### **Rôle Supervisor**
- ✅ Permissions limitées mais étendues
- ✅ Pas d'accès à la gestion des utilisateurs

### **Rôle Controller**
- ✅ Permissions de base pour les missions
- ✅ Pas d'accès aux rapports

### **Rôle Viewer**
- ✅ Permissions de lecture uniquement
- ✅ Pas de permissions de modification

### **Rôle User**
- ✅ Permissions minimales
- ✅ Accès très limité

## 🎉 Critères de succès

- [ ] Toutes les permissions affichées en français
- [ ] Interface utilisateur cohérente
- [ ] Fonctionnalité de création/édition opérationnelle
- [ ] Sécurité des routes respectée
- [ ] Aucune erreur dans la console

---

**Status** : ✅ Prêt pour les tests
**URL** : http://localhost:5173

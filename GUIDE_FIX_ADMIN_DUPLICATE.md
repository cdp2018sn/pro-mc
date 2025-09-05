# 🔧 Guide de Résolution - Erreur Admin Dupliqué

## 🚨 **ERREUR :** `duplicate key value violates unique constraint "users_pkey"`

## 🔍 **CAUSE :** L'admin existe déjà dans Supabase mais avec des données incorrectes

## ✅ **SOLUTION SIMPLE :**

### **Étape 1 : Exécuter le Script de Correction**

1. **Ouvrez Supabase Dashboard** : https://supabase.com/dashboard
2. **Sélectionnez votre projet** : `zkjhbstofbthnitunzcf`
3. **Cliquez sur "SQL Editor"**
4. **Copiez et collez** le contenu de `fix-admin-simple-final.sql`
5. **Cliquez sur "Run"**

### **Étape 2 : Vérifier la Création**

Après l'exécution, vous devriez voir :
```
id: [nouvel-uuid]
email: abdoulaye.niang@cdp.sn
name: Abdoulaye Niang
role: admin
is_active: true
```

### **Étape 3 : Tester la Connexion**

1. **Ouvrez votre application** : http://localhost:5175/
2. **Connectez-vous** avec :
   - **Email** : `abdoulaye.niang@cdp.sn`
   - **Mot de passe** : `Passer`

## 🔧 **CE QUE FAIT LE SCRIPT :**

1. **Désactive RLS** temporairement
2. **Supprime l'ancien admin** problématique
3. **Crée un nouvel admin** avec un UUID généré automatiquement
4. **Configure les bonnes permissions** admin
5. **Réactive RLS** avec des politiques simples
6. **Vérifie** que l'admin a été créé

## 🎯 **IDENTIFIANTS ADMIN :**

- **Email** : `abdoulaye.niang@cdp.sn`
- **Mot de passe** : `Passer`
- **UUID** : Généré automatiquement par Supabase

## 🆘 **SI LE PROBLÈME PERSISTE :**

### **Solution Alternative - Console du Navigateur :**

1. **Ouvrez votre application** : http://localhost:5175/
2. **Ouvrez la console** (F12)
3. **Copiez et collez** ce script :

```javascript
// Créer l'admin localement
const admin = {
  id: 'admin-' + Date.now(),
  email: 'abdoulaye.niang@cdp.sn',
  name: 'Abdoulaye Niang',
  role: 'admin',
  permissions: {
    canCreateMissions: true,
    canEditMissions: true,
    canDeleteMissions: true,
    canViewAllMissions: true,
    canImportMissions: true,
    canManageUsers: true,
    canViewReports: true,
    canEditReports: true,
    canManageDocuments: true,
    canChangeStatus: true,
    canViewDebug: true
  },
  created_at: new Date().toISOString(),
  isActive: true,
  department: 'Direction',
  phone: '',
  password: 'UGFzc2Vy'
};

localStorage.setItem('cdp_users', JSON.stringify([admin]));
const sessionData = {
  user: { ...admin, password: undefined },
  expiresAt: Date.now() + 24 * 60 * 60 * 1000
};
localStorage.setItem('session', btoa(JSON.stringify(sessionData)));
location.reload();
```

4. **Appuyez sur Entrée**

## ✅ **RÉSULTAT ATTENDU :**

- ✅ **Admin créé** dans Supabase avec un UUID valide
- ✅ **Connexion fonctionnelle** avec les identifiants admin
- ✅ **Accès complet** aux fonctionnalités administrateur
- ✅ **Politiques RLS** corrigées

**Exécutez le script SQL et l'admin sera créé correctement !** 🎉

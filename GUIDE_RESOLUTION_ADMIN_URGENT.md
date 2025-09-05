# 🚨 Guide de Résolution URGENT - Connexion Admin

## 🚨 **PROBLÈME :** L'admin ne peut pas se connecter

## 🔍 **CAUSE :** L'admin n'existe pas dans Supabase ni en local

## ⚡ **SOLUTION RAPIDE - 2 OPTIONS**

### **OPTION 1 : Créer l'admin dans Supabase (RECOMMANDÉ)**

1. **Ouvrez Supabase Dashboard** : https://supabase.com/dashboard
2. **Sélectionnez votre projet** : `zkjhbstofbthnitunzcf`
3. **Cliquez sur "SQL Editor"**
4. **Copiez et collez** le contenu de `create-admin-urgent-final.sql`
5. **Cliquez sur "Run"**
6. **Vérifiez** que l'admin apparaît dans la liste

### **OPTION 2 : Créer l'admin localement (SOLUTION TEMPORAIRE)**

1. **Ouvrez votre application** : http://localhost:5175/
2. **Ouvrez la console** (F12)
3. **Copiez et collez** le contenu de `create-admin-local.js`
4. **Appuyez sur Entrée**
5. **La page se rechargera automatiquement**

## 🎯 **IDENTIFIANTS ADMIN**

- **Email** : `abdoulaye.niang@cdp.sn`
- **Mot de passe** : `Passer`
- **UUID** : `550e8400-e29b-41d4-a716-446655440000`

## ✅ **VÉRIFICATION**

Après avoir exécuté l'une des options :

1. **Ouvrez votre application** : http://localhost:5175/
2. **Essayez de vous connecter** avec les identifiants admin
3. **Vous devriez avoir accès** à toutes les fonctionnalités

## 🔧 **SI ÇA NE MARCHE TOUJOURS PAS**

### **Vérification dans la console du navigateur :**
```javascript
// Vérifier les utilisateurs stockés
localStorage.getItem("cdp_users")

// Vérifier la session
localStorage.getItem("session")

// Vider le cache et recommencer
localStorage.clear()
location.reload()
```

### **Vérification dans Supabase :**
1. **Allez dans Table Editor**
2. **Sélectionnez la table `users`**
3. **Vérifiez** que l'admin existe avec l'email `abdoulaye.niang@cdp.sn`

## 🆘 **SOLUTION D'URGENCE**

Si rien ne fonctionne, utilisez ce script dans la console du navigateur :

```javascript
// Script d'urgence - copiez tout ceci
const admin = {
  id: '550e8400-e29b-41d4-a716-446655440000',
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

**L'admin sera créé et vous pourrez vous connecter !** 🎉

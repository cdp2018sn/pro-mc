# 🚨 Guide de Déblocage Admin URGENT

## 🚨 **PROBLÈME :** "Compte temporairement bloqué. Réessayez dans 15 minutes."

## 🔍 **CAUSE :** Le système de sécurité a bloqué le compte après plusieurs tentatives de connexion échouées

## ⚡ **SOLUTION IMMÉDIATE :**

### **Étape 1 : Débloquer le Compte**

1. **Ouvrez votre application** : http://localhost:5175/
2. **Ouvrez la console** (F12)
3. **Copiez et collez** ce script :

```javascript
// Déblocage urgent de l'admin
console.log('🔧 Déblocage urgent de l\'admin...');

// Supprimer les tentatives de connexion bloquantes
localStorage.removeItem('cdp_login_attempts');

// Créer l'admin avec les bonnes données
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

// Sauvegarder l'admin
localStorage.setItem('cdp_users', JSON.stringify([admin]));

// Créer une session valide
const sessionData = {
  user: { ...admin, password: undefined },
  expiresAt: Date.now() + 24 * 60 * 60 * 1000
};
localStorage.setItem('session', btoa(JSON.stringify(sessionData)));

console.log('✅ Admin débloqué !');
location.reload();
```

4. **Appuyez sur Entrée**
5. **La page se rechargera automatiquement**

### **Étape 2 : Vérifier la Connexion**

Après le rechargement, vous devriez être automatiquement connecté en tant qu'admin.

## 🎯 **IDENTIFIANTS ADMIN :**

- **Email** : `abdoulaye.niang@cdp.sn`
- **Mot de passe** : `Passer`

## 🔧 **CE QUE FAIT LE SCRIPT :**

1. ✅ **Supprime le blocage** en effaçant `cdp_login_attempts`
2. ✅ **Crée l'admin** avec les bonnes données
3. ✅ **Sauvegarde localement** dans localStorage
4. ✅ **Crée une session valide** pour la connexion automatique
5. ✅ **Recharge la page** pour appliquer les changements

## 🆘 **SI ÇA NE MARCHE TOUJOURS PAS :**

### **Solution Alternative - Vider Tout le Cache :**

```javascript
// Vider complètement le localStorage
localStorage.clear();

// Créer l'admin
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

## ✅ **RÉSULTAT ATTENDU :**

- ✅ **Compte débloqué** immédiatement
- ✅ **Connexion automatique** en tant qu'admin
- ✅ **Accès complet** aux fonctionnalités administrateur
- ✅ **Plus de blocage** pour les futures connexions

**Exécutez le script et vous serez connecté immédiatement !** 🎉

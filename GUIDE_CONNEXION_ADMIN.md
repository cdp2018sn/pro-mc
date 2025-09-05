# 🔐 Guide de Connexion Admin - CDP Missions

## 🚨 **PROBLÈME :** Impossible de se connecter avec `abdoulaye.niang@cdp.sn`

## 🔧 **SOLUTION ÉTAPE PAR ÉTAPE**

### **Étape 1 : Créer l'admin dans Supabase**

1. **Ouvrez Supabase Dashboard** : https://supabase.com/dashboard
2. **Sélectionnez votre projet** : `zkjhbstofbthnitunzcf`
3. **Cliquez sur "SQL Editor"**
4. **Copiez et collez** le contenu du fichier `create-admin-urgent.sql`
5. **Cliquez sur "Run"**

### **Étape 2 : Vérifier la création**

Après l'exécution du script, vous devriez voir :
```
id: 550e8400-e29b-41d4-a716-446655440000
email: abdoulaye.niang@cdp.sn
name: Abdoulaye Niang
role: admin
is_active: true
```

### **Étape 3 : Tester la connexion**

1. **Ouvrez votre application** : http://localhost:5175/
2. **Essayez de vous connecter** avec :
   - **Email** : `abdoulaye.niang@cdp.sn`
   - **Mot de passe** : `Passer`

### **Étape 4 : Si la connexion échoue encore**

#### **Option A : Vérifier le localStorage**
1. **Ouvrez la console du navigateur** (F12)
2. **Tapez** : `localStorage.getItem("cdp_users")`
3. **Vérifiez** que l'admin existe avec le bon UUID

#### **Option B : Réinitialiser le localStorage**
1. **Dans la console du navigateur** :
   ```javascript
   localStorage.removeItem("cdp_users");
   localStorage.removeItem("cdp_current_user");
   location.reload();
   ```

#### **Option C : Créer l'admin localement**
1. **Dans la console du navigateur** :
   ```javascript
   const admin = {
     id: '550e8400-e29b-41d4-a716-446655440000',
     email: 'abdoulaye.niang@cdp.sn',
     name: 'Abdoulaye Niang',
     role: 'admin',
     password: 'UGFzc2Vy', // 'Passer' encodé
     isActive: true,
     department: 'Direction',
     phone: '',
     created_at: new Date().toISOString()
   };
   localStorage.setItem('cdp_users', JSON.stringify([admin]));
   location.reload();
   ```

## 🎯 **IDENTIFIANTS ADMIN**

- **Email** : `abdoulaye.niang@cdp.sn`
- **Mot de passe** : `Passer`
- **UUID** : `550e8400-e29b-41d4-a716-446655440000`

## ✅ **VÉRIFICATION**

Après ces étapes, vous devriez pouvoir :
- ✅ Vous connecter avec les identifiants admin
- ✅ Accéder à toutes les fonctionnalités
- ✅ Voir le tableau de bord admin
- ✅ Gérer les utilisateurs et missions

## 🆘 **SI LE PROBLÈME PERSISTE**

1. **Vérifiez la console** pour les erreurs
2. **Redémarrez l'application** : `npm run dev`
3. **Videz le cache** du navigateur
4. **Exécutez le script SQL** à nouveau

**L'admin sera créé et la connexion fonctionnera !** 🎉

# 🚀 Migration vers Bolt.new

## 📋 **ÉTAPES POUR CRÉER UN REPOSITORY BOLT.NEW COMPATIBLE**

### **Étape 1 : Créer un Nouveau Repository**
1. **Allez sur GitHub** : https://github.com/new
2. **Nom** : `cdp-missions-bolt`
3. **Description** : "Version simplifiée de CDP Missions pour Bolt.new"
4. **Public** : ✅ (obligatoire pour Bolt.new)
5. **Créer le repository**

### **Étape 2 : Préparer les Fichiers**
1. **Copiez** le contenu du dossier `pro-mc/`
2. **Remplacez** `package.json` par `package-bolt.json`
3. **Supprimez** les dépendances problématiques :
   - `@supabase/supabase-js`
   - `dexie`
   - `dexie-react-hooks`
   - `sqlite`
   - `sqlite3`
   - `xlsx`
   - `mammoth`
   - `node-fetch`
   - `cross-fetch`
   - `https-proxy-agent`

### **Étape 3 : Modifier les Services**
1. **Remplacez** `src/services/supabaseService.ts` par une version mock
2. **Remplacez** `src/database/localStorageDb.ts` par localStorage simple
3. **Supprimez** les références à Supabase dans les composants

### **Étape 4 : Créer un Service Mock**
```typescript
// src/services/mockService.ts
export class MockService {
  static async getMissions() {
    return [
      {
        id: '1',
        title: 'Mission Test',
        reference: 'REF-001',
        status: 'en_cours',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        organization: 'CDP',
        created_at: new Date().toISOString()
      }
    ];
  }
  
  static async createMission(mission: any) {
    console.log('Mission créée:', mission);
    return mission;
  }
  
  static async updateMission(id: string, updates: any) {
    console.log('Mission mise à jour:', id, updates);
    return { id, ...updates };
  }
}
```

### **Étape 5 : Modifier l'AuthService**
```typescript
// src/services/authService.ts (version simplifiée)
export class AuthService {
  private users = [
    {
      id: 'admin-1',
      email: 'abdoulaye.niang@cdp.sn',
      name: 'Abdoulaye Niang',
      role: 'admin',
      password: 'Passer',
      isActive: true
    }
  ];

  async login(credentials: any) {
    const user = this.users.find(u => 
      u.email === credentials.email && 
      u.password === credentials.password
    );
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }
    throw new Error('Identifiants invalides');
  }
}
```

## 🎯 **STRUCTURE FINALE**
```
cdp-missions-bolt/
├── src/
│   ├── components/
│   ├── services/
│   │   ├── mockService.ts
│   │   └── authService.ts (simplifié)
│   └── ...
├── package.json (simplifié)
├── vite.config.ts
├── tsconfig.json
└── index.html
```

## ✅ **AVANTAGES**
- ✅ **Bolt.new compatible**
- ✅ **Pas de dépendances externes**
- ✅ **Fonctionne hors ligne**
- ✅ **Démarrage rapide**

## 🔗 **IMPORT SUR BOLT.NEW**
```
https://github.com/VOTRE_USERNAME/cdp-missions-bolt
```

## 🆘 **EN CAS DE PROBLÈME**
1. Vérifiez que le repository est public
2. Vérifiez que package.json est à la racine
3. Vérifiez que les scripts sont corrects
4. Essayez Gitpod comme alternative

# 🚀 Guide de Configuration Rapide - CDP Missions

## 📋 **Configuration en 3 étapes**

### **Étape 1: Installation**
```bash
npm install
```

### **Étape 2: Configuration automatique**
```bash
npm run setup-db
```

### **Étape 3: Démarrage**
```bash
npm run dev
```

**🎉 C'est tout ! L'application est prête.**

---

## 🔧 **Deux modes de fonctionnement**

### **Mode 1: Supabase (Recommandé)**
- ✅ **Accès global** depuis tous vos appareils
- ✅ **Sauvegarde automatique** dans le cloud
- ✅ **Synchronisation temps réel**
- ✅ **Collaboration multi-utilisateurs**

**Configuration:**
1. Créez un compte sur https://supabase.com
2. Créez un nouveau projet
3. Mettez à jour le fichier `.env` avec vos clés
4. Exécutez le script SQL: `supabase/migrations/create_complete_schema.sql`

### **Mode 2: localStorage (Local)**
- ✅ **Fonctionne immédiatement**
- ✅ **Aucune configuration requise**
- ⚠️ **Données locales uniquement**
- ⚠️ **Pas de synchronisation**

---

## 🎯 **Identifiants par défaut**

- **Email**: `abdoulaye.niang@cdp.sn`
- **Mot de passe**: `Passer`
- **Rôle**: Administrateur

---

## 🛠️ **Scripts utiles**

```bash
# Tester la base de données
npm run test-db

# Migrer localStorage → Supabase
npm run migrate-to-supabase

# Réinitialiser localStorage
npm run init-localStorage

# Démarrer en mode développement
npm run dev

# Construire pour la production
npm run build
```

---

## 🆘 **Dépannage rapide**

### **Problème: L'application ne démarre pas**
```bash
npm install
npm run setup-db
npm run dev
```

### **Problème: Impossible de se connecter**
1. Vérifiez les identifiants: `abdoulaye.niang@cdp.sn` / `Passer`
2. Ouvrez la console (F12) pour voir les erreurs
3. Exécutez: `npm run init-localStorage`

### **Problème: Données non sauvegardées**
1. Vérifiez la configuration Supabase dans `.env`
2. Exécutez le script SQL dans Supabase Dashboard
3. Redémarrez l'application

---

## 🎉 **Fonctionnalités disponibles**

- ✅ **Gestion des missions** (création, modification, suppression)
- ✅ **Gestion des utilisateurs** (rôles et permissions)
- ✅ **Documents** (upload et gestion)
- ✅ **Constatations** (manquements et observations)
- ✅ **Sanctions** (tous types avec montants)
- ✅ **Remarques** (commentaires et notes)
- ✅ **Recherche avancée** (filtres multiples)
- ✅ **Tableau de bord** (statistiques et graphiques)
- ✅ **Import/Export** (fichiers Excel)

---

## 📞 **Support**

En cas de problème:
1. **Console du navigateur** (F12) pour voir les erreurs
2. **Fichier de configuration** `database-config.json` pour voir le mode actuel
3. **Scripts de test** pour diagnostiquer les problèmes

**L'application est maintenant prête à être utilisée !** 🎯
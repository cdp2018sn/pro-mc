# 🚀 Guide de Déploiement Gratuit - CDP Missions

## 📋 **Plan de Déploiement**

### **Frontend** : Vercel (Gratuit)
### **Backend** : Supabase (Gratuit)
### **Base de données** : Supabase PostgreSQL (Gratuit)

---

## 🔧 **Étape 1 : Configuration Supabase (Backend)**

### **1.1 Créer un compte Supabase**
```bash
# Aller sur https://supabase.com
# Cliquer sur "Start your project"
# Créer un compte avec GitHub ou email
```

### **1.2 Créer un nouveau projet**
```bash
# Cliquer sur "New Project"
# Choisir une organisation
# Nom du projet : "cdp-missions"
# Mot de passe de base de données : (générer un mot de passe fort)
# Région : Europe (West) - London
# Cliquer sur "Create new project"
```

### **1.3 Récupérer les clés API**
```bash
# Dans le dashboard Supabase
# Aller dans Settings > API
# Copier :
# - Project URL
# - anon public key
# - service_role secret key
```

### **1.4 Configuration de la base de données**
```bash
# Dans le dashboard Supabase
# Aller dans SQL Editor
# Copier et exécuter le contenu de :
# pro-mc/server/scripts/supabase-setup.sql
```

---

## 🌐 **Étape 2 : Configuration Vercel (Frontend)**

### **2.1 Créer un compte Vercel**
```bash
# Aller sur https://vercel.com
# Cliquer sur "Sign Up"
# Se connecter avec GitHub
```

### **2.2 Connecter le repository GitHub**
```bash
# Dans Vercel Dashboard
# Cliquer sur "New Project"
# Importer le repository : "AbdoulayeGB/project-mc"
# Cliquer sur "Import"
```

### **2.3 Configuration du projet**
```bash
# Framework Preset : Vite
# Root Directory : pro-mc
# Build Command : npm run build
# Output Directory : dist
# Install Command : npm install
```

### **2.4 Variables d'environnement**
```bash
# Dans Vercel > Project Settings > Environment Variables
# Ajouter :

# Supabase Configuration
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon

# API Configuration
VITE_API_URL=https://votre-projet.supabase.co
```

---

## 🔧 **Étape 3 : Configuration du Frontend**

### **3.1 Mettre à jour les variables d'environnement**
Créer un fichier `.env` dans `pro-mc/` :

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon

# API Configuration
VITE_API_URL=https://votre-projet.supabase.co
```

### **3.2 Mettre à jour le service API**
Le frontend utilisera directement Supabase Client au lieu du serveur Express.

### **3.3 Configuration Vite pour le déploiement**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  server: {
    port: 5173
  }
})
```

---

## 🚀 **Étape 4 : Déploiement**

### **4.1 Déployer sur Vercel**
```bash
# Dans Vercel Dashboard
# Cliquer sur "Deploy"
# Attendre la fin du build
# Récupérer l'URL de déploiement
```

### **4.2 Configuration finale**
```bash
# Dans Supabase Dashboard
# Aller dans Authentication > Settings
# Ajouter l'URL Vercel dans "Site URL"
# Ajouter l'URL Vercel dans "Redirect URLs"
```

---

## 🔐 **Étape 5 : Sécurité et Configuration**

### **5.1 Créer l'utilisateur administrateur**
```bash
# Dans Supabase Dashboard
# Aller dans Authentication > Users
# Créer un nouvel utilisateur :
# Email : abdoulaye.niang@cdp.sn
# Mot de passe : Passer
# Rôle : admin
```

### **5.2 Vérifier les politiques RLS**
```bash
# Dans Supabase Dashboard
# Aller dans Database > Policies
# Vérifier que toutes les politiques sont actives
```

---

## 📊 **Étape 6 : Tests et Validation**

### **6.1 Test de connexion**
```bash
# Ouvrir l'URL Vercel
# Se connecter avec :
# Email : abdoulaye.niang@cdp.sn
# Mot de passe : Passer
```

### **6.2 Test des fonctionnalités**
```bash
# Créer une nouvelle mission
# Modifier une mission
# Supprimer une mission (admin seulement)
# Gérer les utilisateurs
```

---

## 💰 **Coûts et Limites Gratuites**

### **Vercel (Frontend)**
- ✅ **Gratuit** : 100 GB de bande passante/mois
- ✅ **Gratuit** : Déploiements illimités
- ✅ **Gratuit** : Domaines personnalisés
- ✅ **Gratuit** : SSL automatique

### **Supabase (Backend)**
- ✅ **Gratuit** : 500 MB de base de données
- ✅ **Gratuit** : 50,000 requêtes/mois
- ✅ **Gratuit** : 2 GB de bande passante/mois
- ✅ **Gratuit** : Authentification illimitée

---

## 🛠️ **Dépannage**

### **Problème de CORS**
```bash
# Dans Supabase Dashboard
# Settings > API
# Ajouter l'URL Vercel dans "Additional Allowed Origins"
```

### **Problème d'authentification**
```bash
# Vérifier les variables d'environnement
# Vérifier les URLs de redirection
# Vérifier les politiques RLS
```

### **Problème de build**
```bash
# Vérifier les dépendances dans package.json
# Vérifier la configuration Vite
# Vérifier les imports TypeScript
```

---

## 🎯 **URLs Finales**

### **Frontend** : `https://votre-projet.vercel.app`
### **Backend** : `https://votre-projet.supabase.co`
### **Dashboard Supabase** : `https://app.supabase.com`

---

## ✅ **Checklist de Déploiement**

- [ ] Compte Supabase créé
- [ ] Projet Supabase créé
- [ ] Script SQL exécuté
- [ ] Clés API récupérées
- [ ] Compte Vercel créé
- [ ] Repository connecté
- [ ] Variables d'environnement configurées
- [ ] Déploiement Vercel réussi
- [ ] Utilisateur admin créé
- [ ] Tests de connexion réussis
- [ ] Tests des fonctionnalités réussis

**🎉 Votre application est maintenant déployée gratuitement et prête pour les tests !**

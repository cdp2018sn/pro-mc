# 🔧 Guide de Dépannage - Déploiement Vercel

## 🚨 **Problèmes Courants et Solutions**

### **1. Application ne s'affiche pas (Page blanche)**

#### **Solution 1 : Vérifier la configuration Vercel**
```bash
# Dans Vercel Dashboard > Project Settings
# Vérifier :
# - Framework Preset : Vite
# - Root Directory : pro-mc
# - Build Command : npm run build
# - Output Directory : dist
# - Install Command : npm install
```

#### **Solution 2 : Vérifier les variables d'environnement**
```bash
# Dans Vercel > Project Settings > Environment Variables
# Ajouter :
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon
VITE_API_URL=https://votre-projet.supabase.co
```

#### **Solution 3 : Vérifier les logs de build**
```bash
# Dans Vercel Dashboard > Deployments
# Cliquer sur le dernier déploiement
# Vérifier les logs de build pour les erreurs
```

### **2. Erreur 404 - Page non trouvée**

#### **Solution : Configuration des routes**
```bash
# Dans Vercel Dashboard > Project Settings > Functions
# Ajouter un fichier vercel.json à la racine du projet :

{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### **3. Erreur de build**

#### **Solution 1 : Vérifier les dépendances**
```bash
# Localement, exécuter :
npm install
npm run build
```

#### **Solution 2 : Vérifier la version de Node.js**
```bash
# Dans Vercel > Project Settings > General
# Vérifier que Node.js version est 18 ou plus
```

### **4. Problème de CORS**

#### **Solution : Configuration Supabase**
```bash
# Dans Supabase Dashboard > Settings > API
# Ajouter dans "Additional Allowed Origins" :
https://votre-projet.vercel.app
https://votre-projet.vercel.app/*
```

### **5. Variables d'environnement non chargées**

#### **Solution : Vérifier les préfixes**
```bash
# Les variables doivent commencer par VITE_ pour être accessibles côté client
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## 🔍 **Diagnostic Pas à Pas**

### **Étape 1 : Vérifier le build local**
```bash
cd pro-mc
npm install
npm run build
# Vérifier que le build réussit
```

### **Étape 2 : Vérifier les fichiers de build**
```bash
# Vérifier que le dossier dist contient :
ls dist/
# Doit contenir : index.html, assets/, etc.
```

### **Étape 3 : Tester localement**
```bash
npm run preview
# Ouvrir http://localhost:4173
# Vérifier que l'application fonctionne
```

### **Étape 4 : Vérifier la configuration Vercel**
```bash
# Dans Vercel Dashboard :
# 1. Project Settings > General
# 2. Vérifier Framework Preset : Vite
# 3. Vérifier Root Directory : pro-mc
# 4. Vérifier Build Command : npm run build
# 5. Vérifier Output Directory : dist
```

### **Étape 5 : Vérifier les variables d'environnement**
```bash
# Dans Vercel > Project Settings > Environment Variables
# Vérifier que toutes les variables sont présentes
```

## 🛠️ **Solutions Avancées**

### **Solution 1 : Redéployer depuis zéro**
```bash
# 1. Supprimer le projet Vercel
# 2. Recréer le projet
# 3. Reconfigurer les variables d'environnement
# 4. Redéployer
```

### **Solution 2 : Utiliser Vercel CLI**
```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel --prod
```

### **Solution 3 : Configuration manuelle**
```bash
# Créer un fichier vercel.json à la racine :
{
  "version": 2,
  "builds": [
    {
      "src": "pro-mc/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "pro-mc/dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## 📋 **Checklist de Dépannage**

- [ ] Build local réussi
- [ ] Variables d'environnement configurées
- [ ] Configuration Vercel correcte
- [ ] Routes configurées
- [ ] CORS configuré dans Supabase
- [ ] Logs de build sans erreur
- [ ] Application accessible en preview local

## 🆘 **En cas d'urgence**

### **Contact Support Vercel**
- Documentation : https://vercel.com/docs
- Support : https://vercel.com/support
- Discord : https://vercel.com/discord

### **Logs utiles**
```bash
# Dans Vercel Dashboard > Deployments
# Cliquer sur le déploiement > View Function Logs
# Vérifier les erreurs dans les logs
```

## 🎯 **URLs de Test**

### **Test local**
- http://localhost:5173 (dev)
- http://localhost:4173 (preview)

### **Test production**
- https://votre-projet.vercel.app
- https://votre-projet.vercel.app/api/health

**🔧 Si le problème persiste, vérifiez les logs de build dans Vercel Dashboard !**

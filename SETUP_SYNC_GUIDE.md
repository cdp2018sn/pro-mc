# 🔧 Guide de Configuration de la Synchronisation Multi-PC

## 🚨 **PROBLÈME IDENTIFIÉ**

Quand vous ouvrez l'application sur un autre PC, les données sont vides car :
- ❌ **Supabase n'est pas configuré**
- ❌ **Variables d'environnement manquantes**
- ❌ **Base de données Supabase non créée**
- ❌ **Synchronisation non fonctionnelle**

## ✅ **SOLUTION COMPLÈTE**

### **Étape 1 : Créer le fichier .env**

Créez un fichier `.env` dans le dossier `pro-mc/` avec le contenu suivant :

```env
# Configuration Supabase
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon-supabase

# Configuration API
VITE_API_URL=https://votre-projet.supabase.co

# Configuration locale
VITE_APP_NAME=CDP Missions
VITE_APP_VERSION=1.0.0
```

### **Étape 2 : Configurer Supabase**

#### **2.1 Créer un projet Supabase**
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte gratuit
3. Créez un nouveau projet
4. Notez l'URL et la clé anon

#### **2.2 Exécuter le script SQL**
Dans l'interface Supabase SQL Editor, exécutez ce script :

```sql
-- Création des tables
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  permissions JSONB,
  is_active BOOLEAN DEFAULT true,
  department TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS missions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'en_cours',
  start_date DATE,
  end_date DATE,
  location TEXT,
  assigned_to TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Politiques RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

-- Politiques pour les utilisateurs
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage users" ON users
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Politiques pour les missions
CREATE POLICY "Users can view missions" ON missions
  FOR SELECT USING (true);

CREATE POLICY "Users can create missions" ON missions
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'supervisor', 'controller'));

CREATE POLICY "Users can update missions" ON missions
  FOR UPDATE USING (auth.jwt() ->> 'role' IN ('admin', 'supervisor', 'controller'));

-- Insertion de l'admin par défaut
INSERT INTO users (id, email, name, role, permissions, is_active, department)
VALUES (
  'admin-1',
  'abdoulaye.niang@cdp.sn',
  'Abdoulaye Niang',
  'admin',
  '{"canCreateMissions": true, "canEditMissions": true, "canDeleteMissions": true, "canViewAllMissions": true, "canImportMissions": true, "canManageUsers": true, "canViewReports": true, "canEditReports": true, "canManageDocuments": true, "canChangeStatus": true, "canViewDebug": true}',
  true,
  'Direction'
) ON CONFLICT (id) DO NOTHING;

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON missions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **Étape 3 : Tester la Configuration**

#### **3.1 Vérifier la connexion**
Ouvrez la console du navigateur (F12) et vérifiez les logs :

```javascript
// Dans la console
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);
```

#### **3.2 Tester la synchronisation**
1. Ouvrez l'application
2. Allez dans **Gestion des Utilisateurs**
3. Scrollez vers le bas pour voir **"Statut de Synchronisation"**
4. Cliquez sur **"Actualiser"**

### **Étape 4 : Déployer sur Vercel**

#### **4.1 Configurer les variables d'environnement sur Vercel**
1. Allez dans votre projet Vercel
2. **Settings** → **Environment Variables**
3. Ajoutez :
   - `VITE_SUPABASE_URL` = votre URL Supabase
   - `VITE_SUPABASE_ANON_KEY` = votre clé anon Supabase
   - `VITE_API_URL` = votre URL Supabase

#### **4.2 Redéployer**
1. Poussez les changements vers GitHub
2. Vercel redéploiera automatiquement

## 🔄 **Processus de Synchronisation**

### **Sur le PC Principal :**
1. ✅ Créez des utilisateurs
2. ✅ Ils sont sauvegardés localement ET dans Supabase
3. ✅ Vérifiez la synchronisation dans l'interface

### **Sur un Autre PC :**
1. ✅ L'application se connecte à Supabase
2. ✅ Récupère les utilisateurs existants
3. ✅ Synchronise automatiquement
4. ✅ Affiche tous les utilisateurs

## 🛠️ **Script de Configuration Automatique**

Créez un fichier `setup-sync.bat` (Windows) :

```batch
@echo off
echo 🔧 Configuration de la Synchronisation CDP Missions
echo ================================================

echo.
echo 1. Création du fichier .env...
(
echo # Configuration Supabase
echo VITE_SUPABASE_URL=https://votre-projet.supabase.co
echo VITE_SUPABASE_ANON_KEY=votre-clé-anon-supabase
echo VITE_API_URL=https://votre-projet.supabase.co
echo VITE_APP_NAME=CDP Missions
echo VITE_APP_VERSION=1.0.0
) > pro-mc\.env

echo ✅ Fichier .env créé
echo.
echo 2. Installation des dépendances...
cd pro-mc
npm install

echo.
echo 3. Test de build...
npm run build

echo.
echo ✅ Configuration terminée !
echo.
echo 📋 Prochaines étapes :
echo 1. Modifiez le fichier .env avec vos vraies clés Supabase
echo 2. Testez l'application : npm run dev
echo 3. Vérifiez la synchronisation dans "Gestion des Utilisateurs"
echo.
pause
```

## 🔍 **Diagnostic des Problèmes**

### **Si les données restent vides :**

#### **1. Vérifier les variables d'environnement**
```javascript
// Dans la console du navigateur
console.log('Variables d\'environnement :', {
  url: import.meta.env.VITE_SUPABASE_URL,
  key: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...'
});
```

#### **2. Vérifier la connexion Supabase**
```javascript
// Dans la console
import { supabase } from './src/services/supabaseService';
supabase.from('users').select('*').then(console.log);
```

#### **3. Vérifier les erreurs réseau**
- Ouvrez les **Outils de développement** (F12)
- Onglet **Network**
- Vérifiez les requêtes vers Supabase

### **Messages d'erreur courants :**

#### **"Supabase URL not found"**
- ❌ Variable `VITE_SUPABASE_URL` manquante
- ✅ Ajoutez-la dans le fichier `.env`

#### **"Invalid API key"**
- ❌ Clé Supabase incorrecte
- ✅ Vérifiez la clé dans votre projet Supabase

#### **"Table does not exist"**
- ❌ Tables non créées dans Supabase
- ✅ Exécutez le script SQL dans Supabase

## 📊 **Test de Validation**

### **Scénario de test complet :**

1. **PC Principal :**
   - Créez 3 utilisateurs
   - Vérifiez qu'ils apparaissent dans Supabase
   - Notez leurs emails

2. **Autre PC :**
   - Ouvrez l'application
   - Allez dans **Gestion des Utilisateurs**
   - Vérifiez que les 3 utilisateurs apparaissent
   - Testez la connexion avec un des utilisateurs

3. **Validation :**
   - ✅ Utilisateurs synchronisés
   - ✅ Connexion fonctionnelle
   - ✅ Données persistantes

## 🎯 **Résultat Attendu**

Après configuration, sur **n'importe quel PC** :
- ✅ **Données synchronisées** depuis Supabase
- ✅ **Utilisateurs disponibles** pour connexion
- ✅ **Synchronisation automatique** au démarrage
- ✅ **Interface de monitoring** fonctionnelle

## 🆘 **Support**

Si le problème persiste :
1. Vérifiez les logs dans la console (F12)
2. Testez la connexion Supabase directement
3. Vérifiez les variables d'environnement
4. Consultez la documentation Supabase

**Le système de synchronisation garantit que vos données sont disponibles partout !**

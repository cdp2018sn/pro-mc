# 🚀 Guide GitHub - CDP Missions

## 🎯 Objectif

Ce guide vous explique comment enregistrer votre projet CDP Missions sur GitHub pour le sauvegarder et le partager.

## 📋 Prérequis

- **Compte GitHub** créé sur https://github.com
- **Git** configuré sur votre machine (déjà fait)
- **Repository local** initialisé (déjà fait)

## ⚡ Enregistrement rapide

### **Méthode 1 : Script automatique (Recommandé)**

```bash
# Lancer le script d'enregistrement GitHub
.\setup-github.bat
```

### **Méthode 2 : Manuel**

#### **Étape 1 : Créer le repository sur GitHub**

1. **Allez sur** https://github.com
2. **Connectez-vous** à votre compte
3. **Cliquez sur "New"** (bouton "+" en haut à droite)
4. **Remplissez les informations :**
   - **Repository name** : `cdp-missions`
   - **Description** : `Application de gestion des missions CDP avec PostgreSQL`
   - **Public** ou **Private** (selon votre choix)
   - **NE PAS cocher** "Add a README file"
5. **Cliquez sur "Create repository"**

#### **Étape 2 : Connecter le repository local**

```bash
# Ajouter le remote GitHub (remplacez USERNAME par votre nom d'utilisateur)
git remote add origin https://github.com/USERNAME/cdp-missions.git

# Pousser le code vers GitHub
git push -u origin main
```

## 🔧 Configuration détaillée

### **Vérifier la configuration Git**

```bash
# Voir la configuration actuelle
git config --list

# Configurer votre nom et email (si pas déjà fait)
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"
```

### **Authentification GitHub**

#### **Option 1 : Token d'accès personnel (Recommandé)**

1. **Allez sur** GitHub.com → Settings → Developer settings → Personal access tokens
2. **Cliquez sur "Generate new token"**
3. **Sélectionnez les permissions :**
   - `repo` (accès complet aux repositories)
   - `workflow` (si vous voulez utiliser GitHub Actions)
4. **Copiez le token** généré
5. **Utilisez le token** comme mot de passe lors du push

#### **Option 2 : GitHub CLI**

```bash
# Installer GitHub CLI
winget install GitHub.cli

# Se connecter
gh auth login

# Pousser le code
gh repo create cdp-missions --public --source=. --remote=origin --push
```

## 📊 Structure du repository GitHub

### **Fichiers importants**

```
cdp-missions/
├── README.md              # Documentation principale
├── .gitignore            # Fichiers ignorés par Git
├── package.json          # Dépendances frontend
├── server/               # Code backend
│   ├── package.json      # Dépendances backend
│   ├── index.js          # Serveur Express
│   └── scripts/          # Scripts de migration
├── src/                  # Code frontend React
├── setup-postgresql.bat  # Script d'installation
├── setup-github.bat      # Script GitHub
└── GUIDE_GITHUB.md       # Ce guide
```

### **Fichiers sensibles (déjà dans .gitignore)**

- `.env` (variables d'environnement)
- `node_modules/` (dépendances)
- `dist/` (build de production)
- Fichiers de base de données

## 🔄 Workflow quotidien avec GitHub

### **Sauvegarder vos changements**

```bash
# Voir les changements
git status

# Ajouter les fichiers modifiés
git add .

# Créer un commit
git commit -m "feat: nouvelle fonctionnalité"

# Pousser vers GitHub
git push
```

### **Récupérer les changements**

```bash
# Récupérer les changements depuis GitHub
git pull

# Ou plus détaillé
git fetch origin
git merge origin/main
```

### **Créer une branche pour une fonctionnalité**

```bash
# Créer et basculer sur une nouvelle branche
git checkout -b feature/nouvelle-fonctionnalite

# Développer et commiter
git add .
git commit -m "feat: développement de la fonctionnalité"

# Pousser la branche
git push -u origin feature/nouvelle-fonctionnalite
```

## 🛠️ Fonctionnalités GitHub

### **Issues (Problèmes)**

- **Créer une issue** pour signaler un bug
- **Assigner** des personnes pour résoudre
- **Ajouter des labels** pour catégoriser

### **Pull Requests (Demandes de fusion)**

- **Créer une PR** pour proposer des changements
- **Code review** par d'autres développeurs
- **Tests automatiques** avant fusion

### **Actions GitHub (CI/CD)**

```yaml
# .github/workflows/deploy.yml
name: Deploy CDP Missions
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build
      - name: Deploy
        run: echo "Déploiement automatique"
```

## 🔒 Sécurité

### **Bonnes pratiques**

- ✅ **Ne jamais commiter** les fichiers `.env`
- ✅ **Utiliser des tokens** d'accès personnel
- ✅ **Vérifier les permissions** des repositories
- ✅ **Faire des backups** réguliers

### **Variables d'environnement**

Pour les variables sensibles, utilisez GitHub Secrets :

1. **Allez sur** votre repository → Settings → Secrets
2. **Ajoutez** vos variables sensibles
3. **Utilisez-les** dans vos Actions GitHub

## 📈 Statistiques et insights

### **Voir les statistiques**

- **Graphique des commits** : Votre repository → Insights → Contributors
- **Trafic** : Votre repository → Insights → Traffic
- **Code frequency** : Votre repository → Insights → Code frequency

### **Badges pour le README**

```markdown
# CDP Missions

![GitHub last commit](https://img.shields.io/github/last-commit/USERNAME/cdp-missions)
![GitHub issues](https://img.shields.io/github/issues/USERNAME/cdp-missions)
![GitHub pull requests](https://img.shields.io/github/issues-pr/USERNAME/cdp-missions)
![GitHub license](https://img.shields.io/github/license/USERNAME/cdp-missions)
```

## 🚨 Dépannage

### **Erreur "remote origin already exists"**

```bash
# Supprimer le remote existant
git remote remove origin

# Ajouter le nouveau remote
git remote add origin https://github.com/USERNAME/cdp-missions.git
```

### **Erreur d'authentification**

```bash
# Configurer l'authentification par token
git config --global credential.helper store

# Ou utiliser GitHub CLI
gh auth login
```

### **Erreur de push**

```bash
# Forcer le push (attention !)
git push -f origin main

# Ou récupérer d'abord
git pull origin main
git push origin main
```

## 🎯 Utilisation avancée

### **GitHub Pages (Site web)**

1. **Allez sur** Settings → Pages
2. **Source** : Deploy from a branch
3. **Branch** : main
4. **Folder** : / (root)
5. **Votre site** sera disponible sur : `https://USERNAME.github.io/cdp-missions`

### **GitHub Releases**

```bash
# Créer un tag
git tag v1.0.0

# Pousser le tag
git push origin v1.0.0

# Créer une release sur GitHub
gh release create v1.0.0 --title "Version 1.0.0" --notes "Première version stable"
```

## ✅ Résumé

### **Avantages de GitHub**

- ✅ **Sauvegarde automatique** de votre code
- ✅ **Collaboration** facilitée
- ✅ **Historique complet** des changements
- ✅ **Déploiement automatisé** possible
- ✅ **Documentation** intégrée
- ✅ **Gestion des versions** professionnelle

### **Prochaines étapes**

1. **Créer le repository** sur GitHub
2. **Pousser le code** avec `git push`
3. **Configurer les Actions** pour le déploiement
4. **Inviter des collaborateurs** si nécessaire
5. **Créer des releases** pour les versions stables

**Votre projet CDP Missions sera bientôt sauvegardé et accessible sur GitHub !** 🎉

---

## 📞 Support

- **Documentation GitHub** : https://docs.github.com
- **GitHub Community** : https://github.community
- **GitHub Support** : https://support.github.com

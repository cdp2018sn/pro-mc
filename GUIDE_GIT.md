# 🔄 Guide Git - CDP Missions

## 🎯 Objectif

Ce guide explique comment utiliser Git pour gérer les versions de votre application CDP Missions avec PostgreSQL.

## 📋 Prérequis

- **Git** installé sur votre machine
- **Compte GitHub/GitLab** (optionnel, pour sauvegarder en ligne)
- **Repository** initialisé (déjà fait)

## 🚀 Première configuration

### **1. Configuration Git (si pas déjà fait)**
```bash
# Configurer votre nom d'utilisateur
git config --global user.name "Votre Nom"

# Configurer votre email
git config --global user.email "votre.email@example.com"

# Vérifier la configuration
git config --list
```

### **2. Vérifier le statut actuel**
```bash
# Voir le statut du repository
git status

# Voir l'historique des commits
git log --oneline
```

## 📊 Workflow quotidien

### **Étape 1 : Voir les changements**
```bash
# Voir quels fichiers ont été modifiés
git status

# Voir les différences dans un fichier
git diff nom_du_fichier
```

### **Étape 2 : Ajouter les fichiers**
```bash
# Ajouter un fichier spécifique
git add nom_du_fichier

# Ajouter tous les fichiers modifiés
git add .

# Ajouter tous les fichiers (y compris nouveaux)
git add -A
```

### **Étape 3 : Créer un commit**
```bash
# Commit avec message
git commit -m "Description des changements"

# Commit avec message détaillé
git commit -m "Ajout de la fonctionnalité X
- Amélioration de la sécurité
- Correction du bug Y
- Mise à jour de la documentation"
```

### **Étape 4 : Pousser vers le repository distant**
```bash
# Pousser vers la branche principale
git push origin main

# Pousser vers une branche spécifique
git push origin nom_de_la_branche
```

## 🌿 Gestion des branches

### **Créer une nouvelle branche**
```bash
# Créer et basculer sur une nouvelle branche
git checkout -b nouvelle-fonctionnalite

# Ou avec la nouvelle syntaxe
git switch -c nouvelle-fonctionnalite
```

### **Changer de branche**
```bash
# Basculer vers une branche existante
git checkout nom_de_la_branche

# Ou avec la nouvelle syntaxe
git switch nom_de_la_branche
```

### **Voir toutes les branches**
```bash
# Voir les branches locales
git branch

# Voir toutes les branches (locales et distantes)
git branch -a
```

### **Fusionner une branche**
```bash
# Basculer vers la branche principale
git checkout main

# Fusionner la branche
git merge nom_de_la_branche

# Supprimer la branche après fusion
git branch -d nom_de_la_branche
```

## 🔄 Synchronisation avec le repository distant

### **Ajouter un repository distant**
```bash
# Ajouter un repository GitHub/GitLab
git remote add origin https://github.com/votre-username/cdp-missions.git

# Vérifier les repositories distants
git remote -v
```

### **Récupérer les changements**
```bash
# Récupérer les changements sans les fusionner
git fetch origin

# Récupérer et fusionner les changements
git pull origin main
```

### **Résoudre les conflits**
```bash
# Si il y a des conflits lors du pull/merge
git status  # Voir les fichiers en conflit

# Éditer les fichiers pour résoudre les conflits
# Puis ajouter et commiter
git add .
git commit -m "Résolution des conflits"
```

## 📝 Bonnes pratiques

### **Messages de commit**
```bash
# Format recommandé
git commit -m "type: description courte

Description détaillée si nécessaire

- Point 1
- Point 2
- Point 3"

# Exemples de types
# feat: nouvelle fonctionnalité
# fix: correction de bug
# docs: documentation
# style: formatage
# refactor: refactorisation
# test: tests
# chore: maintenance
```

### **Exemples de commits**
```bash
# Ajout d'une fonctionnalité
git commit -m "feat: ajout de la gestion des utilisateurs

- Interface de création d'utilisateur
- Validation des données
- Intégration avec PostgreSQL"

# Correction d'un bug
git commit -m "fix: correction du problème de connexion

- Correction de la validation des mots de passe
- Amélioration de la gestion des erreurs"

# Mise à jour de la documentation
git commit -m "docs: mise à jour du guide PostgreSQL

- Ajout des instructions d'installation
- Correction des commandes
- Ajout de la section dépannage"
```

## 🛠️ Scripts utiles

### **Utiliser le script d'aide Git**
```bash
# Lancer le menu interactif
.\git-commands.bat
```

### **Commandes rapides**
```bash
# Voir le statut rapidement
git status --short

# Voir l'historique graphique
git log --graph --oneline --all

# Annuler le dernier commit (garder les changements)
git reset --soft HEAD~1

# Annuler le dernier commit (perdre les changements)
git reset --hard HEAD~1

# Voir les changements du dernier commit
git show
```

## 🚨 Dépannage

### **Annuler des changements non commités**
```bash
# Annuler les changements dans un fichier
git checkout -- nom_du_fichier

# Annuler tous les changements
git checkout -- .

# Supprimer les fichiers non trackés
git clean -fd
```

### **Modifier le dernier commit**
```bash
# Modifier le message du dernier commit
git commit --amend -m "Nouveau message"

# Ajouter des fichiers au dernier commit
git add fichier_oublié
git commit --amend --no-edit
```

### **Récupérer un commit supprimé**
```bash
# Voir l'historique complet
git reflog

# Récupérer un commit
git checkout -b recovery-branch <commit-hash>
```

## 📊 Visualisation

### **Voir l'historique graphique**
```bash
# Historique simple
git log --oneline

# Historique avec graphique
git log --graph --oneline --all

# Historique avec dates
git log --pretty=format:"%h - %an, %ar : %s"
```

### **Voir les statistiques**
```bash
# Statistiques des commits
git shortlog -sn

# Statistiques des fichiers modifiés
git log --stat

# Statistiques détaillées
git log --numstat
```

## 🔒 Sécurité

### **Ne jamais commiter**
- Fichiers `.env` avec mots de passe
- Fichiers de base de données
- Logs et fichiers temporaires
- Clés privées et certificats

### **Vérifier avant de commiter**
```bash
# Voir ce qui va être commité
git diff --cached

# Voir les fichiers qui vont être commités
git status
```

## 📈 Workflow avancé

### **Workflow avec branches de fonctionnalités**
```bash
# 1. Créer une branche pour une fonctionnalité
git checkout -b feature/nouvelle-fonctionnalite

# 2. Développer et commiter
git add .
git commit -m "feat: développement de la fonctionnalité"

# 3. Pousser la branche
git push origin feature/nouvelle-fonctionnalite

# 4. Créer une Pull Request (sur GitHub/GitLab)

# 5. Après validation, fusionner
git checkout main
git pull origin main
git merge feature/nouvelle-fonctionnalite
git push origin main

# 6. Supprimer la branche
git branch -d feature/nouvelle-fonctionnalite
git push origin --delete feature/nouvelle-fonctionnalite
```

## 🎯 Résumé des commandes essentielles

```bash
# Workflow quotidien
git status              # Voir l'état
git add .               # Ajouter les changements
git commit -m "message" # Créer un commit
git push                # Pousser vers le distant

# Gestion des branches
git branch              # Voir les branches
git checkout -b nom     # Créer une branche
git checkout nom        # Changer de branche
git merge nom           # Fusionner une branche

# Synchronisation
git pull                # Récupérer les changements
git fetch               # Récupérer sans fusionner
git remote -v           # Voir les repositories distants
```

---

## ✅ Avantages de Git

- ✅ **Historique complet** de tous les changements
- ✅ **Collaboration** facilitée entre développeurs
- ✅ **Sauvegarde** automatique de votre code
- ✅ **Récupération** facile en cas de problème
- ✅ **Gestion des versions** professionnelle
- ✅ **Déploiement** automatisé possible

**Git vous permet de garder un historique complet de tous les changements de votre application CDP Missions !** 🎉

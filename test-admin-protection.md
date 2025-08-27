# 🧪 Test de Protection des Routes Administrateur

## 🎯 Objectif

Vérifier que les routes `/debug` et `/users` sont correctement protégées et accessibles seulement aux administrateurs.

## 📋 Tests à effectuer

### **Test 1 : Connexion en tant qu'administrateur**

1. **Démarrer l'application** : `npm run dev`
2. **Ouvrir** http://localhost:3000
3. **Se connecter** avec :
   - **Email** : `abdoulaye.niang@cdp.sn`
   - **Mot de passe** : `Passer`
4. **Vérifier** :
   - ✅ Le lien "Debug" apparaît dans le menu
   - ✅ Le lien "Gestion utilisateurs" apparaît dans le menu
   - ✅ Accès à `/debug` fonctionne
   - ✅ Accès à `/users` fonctionne

### **Test 2 : Connexion en tant qu'utilisateur normal**

1. **Créer un utilisateur normal** via la page "Gestion utilisateurs"
2. **Se déconnecter** et se reconnecter avec le nouvel utilisateur
3. **Vérifier** :
   - ❌ Le lien "Debug" n'apparaît PAS dans le menu
   - ❌ Le lien "Gestion utilisateurs" n'apparaît PAS dans le menu
   - ❌ Accès direct à `/debug` affiche "Accès refusé"
   - ❌ Accès direct à `/users` affiche "Accès refusé"

### **Test 3 : Test d'accès direct via URL**

1. **Se connecter** en tant qu'utilisateur normal
2. **Taper directement** dans l'URL : `http://localhost:3000/debug`
3. **Vérifier** :
   - ✅ Page "Accès refusé" s'affiche
   - ✅ Message explicatif présent
   - ✅ Bouton "Retour à l'accueil" fonctionne

### **Test 4 : Test de navigation**

1. **Se connecter** en tant qu'administrateur
2. **Naviguer** vers `/debug`
3. **Se déconnecter** et se reconnecter en tant qu'utilisateur normal
4. **Vérifier** :
   - ✅ Redirection automatique vers la page d'accueil
   - ✅ Protection active immédiatement

## 🔍 Points de vérification

### **Interface utilisateur**
- [ ] Menu de navigation correct selon le rôle
- [ ] Page d'erreur "Accès refusé" professionnelle
- [ ] Bouton de retour fonctionnel
- [ ] Design cohérent avec l'application

### **Sécurité**
- [ ] Protection au niveau du menu
- [ ] Protection au niveau des routes
- [ ] Vérification du rôle utilisateur
- [ ] Pas d'accès direct via URL

### **Fonctionnalité**
- [ ] Connexion administrateur fonctionne
- [ ] Connexion utilisateur normal fonctionne
- [ ] Déconnexion fonctionne
- [ ] Navigation entre les pages fonctionne

## 🚨 Cas d'erreur à tester

### **Erreur 1 : Utilisateur non connecté**
- Accès à `/debug` sans être connecté
- **Résultat attendu** : Redirection vers la page de connexion

### **Erreur 2 : Rôle manquant**
- Utilisateur connecté sans rôle défini
- **Résultat attendu** : Page "Accès refusé"

### **Erreur 3 : Rôle incorrect**
- Utilisateur avec rôle autre que 'admin'
- **Résultat attendu** : Page "Accès refusé"

## ✅ Critères de succès

- [ ] Seuls les administrateurs voient les liens "Debug" et "Gestion utilisateurs"
- [ ] Les autres utilisateurs ne peuvent pas accéder aux pages protégées
- [ ] La page d'erreur est claire et professionnelle
- [ ] La navigation fonctionne correctement
- [ ] Aucune erreur dans la console du navigateur

## 📝 Rapport de test

**Date du test** : _______________
**Testeur** : _______________
**Version** : _______________

### **Résultats**
- [ ] Test 1 : Connexion administrateur
- [ ] Test 2 : Connexion utilisateur normal
- [ ] Test 3 : Accès direct via URL
- [ ] Test 4 : Navigation

### **Problèmes détectés**
- _________________________________
- _________________________________
- _________________________________

### **Améliorations suggérées**
- _________________________________
- _________________________________
- _________________________________

---

**Status** : ✅ Prêt pour les tests

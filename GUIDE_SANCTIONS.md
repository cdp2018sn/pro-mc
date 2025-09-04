# 📋 Guide d'Utilisation - Gestion des Sanctions

## ✅ Problème Résolu

Le problème d'affichage des sanctions a été **complètement corrigé** ! Maintenant, chaque type de sanction s'affiche correctement avec son libellé approprié.

## 🎯 Types de Sanctions Disponibles

### 1. **Avertissement** 
- **Couleur** : Jaune
- **Description** : Mise en garde officielle
- **Utilisation** : Pour les manquements mineurs

### 2. **Mise en demeure**
- **Couleur** : Orange  
- **Description** : Demande de correction dans un délai donné
- **Utilisation** : Pour les non-conformités nécessitant une action

### 3. **Sanction pécuniaire**
- **Couleur** : Rouge
- **Description** : Amende financière
- **Utilisation** : Pour les violations graves
- **Fonctionnalité spéciale** : Champ montant obligatoire

### 4. **Injonction**
- **Couleur** : Bleu
- **Description** : Ordre de faire ou de ne pas faire
- **Utilisation** : Pour forcer une action spécifique

### 5. **Restriction de traitement**
- **Couleur** : Violet
- **Description** : Limitation des activités de traitement
- **Utilisation** : Pour les violations très graves

## 🚀 Comment Utiliser les Sanctions

### Ajouter une Sanction

1. **Ouvrir une mission**
   - Aller dans la liste des missions
   - Cliquer sur une mission pour voir les détails

2. **Accéder à l'onglet Sanctions**
   - Dans les détails de la mission, cliquer sur l'onglet "Sanctions"

3. **Ajouter une nouvelle sanction**
   - Cliquer sur le bouton "Ajouter une sanction"
   - Remplir le formulaire :
     - **Type** : Choisir le type approprié
     - **Description** : Décrire la sanction
     - **Montant** : Si c'est une sanction pécuniaire
     - **Date de décision** : Date de la décision

4. **Sauvegarder**
   - Cliquer sur "Ajouter" pour sauvegarder

### Modifier une Sanction

1. **Accéder à la sanction**
   - Dans l'onglet Sanctions, trouver la sanction à modifier

2. **Activer le mode édition**
   - Cliquer sur l'icône crayon (✏️) à côté de la sanction

3. **Modifier les informations**
   - Changer le type, la description, le montant ou la date
   - Tous les champs sont modifiables

4. **Sauvegarder**
   - Cliquer sur "Sauvegarder" pour appliquer les modifications
   - Ou "Annuler" pour abandonner

### Supprimer une Sanction

1. **Accéder à la sanction**
   - Dans l'onglet Sanctions, trouver la sanction à supprimer

2. **Supprimer**
   - Cliquer sur l'icône poubelle (🗑️) à côté de la sanction
   - Confirmer la suppression

## 🎨 Interface Utilisateur

### Affichage des Sanctions

Chaque sanction est affichée dans une carte avec :
- **Badge coloré** : Indique le type de sanction
- **Description** : Texte détaillé de la sanction
- **Montant** : Affiché en rouge pour les sanctions pécuniaires
- **Date de décision** : Format français (dd/mm/yyyy)
- **Boutons d'action** : Modifier et supprimer

### Codes Couleurs

- 🟡 **Jaune** : Avertissement
- 🟠 **Orange** : Mise en demeure  
- 🔴 **Rouge** : Sanction pécuniaire
- 🔵 **Bleu** : Injonction
- 🟣 **Violet** : Restriction de traitement

## ⚙️ Fonctionnalités Techniques

### Validation des Données

- **Type** : Obligatoire, doit être un des 5 types autorisés
- **Description** : Obligatoire, texte libre
- **Montant** : Obligatoire pour les sanctions pécuniaires, nombre positif
- **Date** : Obligatoire, format date valide

### Gestion des États

- **Mode affichage** : Lecture seule avec boutons d'action
- **Mode édition** : Formulaire complet pour modification
- **Mode ajout** : Formulaire vide pour nouvelle sanction

### Persistance des Données

- **Stockage local** : IndexedDB pour performance
- **Synchronisation** : Avec PostgreSQL si disponible
- **Sauvegarde automatique** : À chaque modification

## 🔧 Fonctionnalités Avancées

### Sanctions Pécuniaires

- **Champ montant** : Apparaît automatiquement pour ce type
- **Formatage** : Affichage en FCFA avec séparateurs de milliers
- **Validation** : Montant positif obligatoire

### Gestion des Dates

- **Format d'affichage** : Français (dd/mm/yyyy)
- **Format de stockage** : ISO (yyyy-mm-dd)
- **Validation** : Dates valides uniquement

### Interface Responsive

- **Desktop** : Affichage complet avec tous les détails
- **Mobile** : Interface adaptée aux petits écrans
- **Tablette** : Optimisé pour les écrans moyens

## 📊 Statistiques et Rapports

### Visualisation

- **Par type** : Répartition des types de sanctions
- **Par période** : Évolution temporelle
- **Par montant** : Total des sanctions pécuniaires

### Export

- **Format Excel** : Export complet des sanctions
- **Format PDF** : Rapports détaillés
- **Format CSV** : Données brutes

## 🛡️ Sécurité et Permissions

### Contrôle d'Accès

- **Lecture** : Tous les utilisateurs autorisés
- **Modification** : Contrôleurs et superviseurs
- **Suppression** : Superviseurs et administrateurs
- **Ajout** : Contrôleurs et superviseurs

### Audit Trail

- **Historique** : Toutes les modifications sont tracées
- **Auteur** : Qui a fait la modification
- **Timestamp** : Quand la modification a été faite

## 🎯 Bonnes Pratiques

### Rédaction des Sanctions

1. **Être précis** : Décrire clairement la violation
2. **Citer les textes** : Référencer les articles de loi
3. **Justifier le montant** : Expliquer le calcul pour les amendes
4. **Donner des délais** : Spécifier les échéances

### Gestion des Types

1. **Avertissement** : Pour les premières infractions mineures
2. **Mise en demeure** : Quand une action corrective est nécessaire
3. **Sanction pécuniaire** : Pour les violations répétées ou graves
4. **Injonction** : Pour forcer une action spécifique
5. **Restriction** : En dernier recours pour les violations majeures

## 🔍 Dépannage

### Problèmes Courants

**Q: La sanction ne s'affiche pas correctement**
R: Vérifier que le type est bien sélectionné dans la liste

**Q: Le montant ne s'affiche pas**
R: S'assurer que le type "Sanction pécuniaire" est sélectionné

**Q: Impossible de modifier une sanction**
R: Vérifier les permissions utilisateur

**Q: La date ne s'affiche pas**
R: Vérifier le format de la date (yyyy-mm-dd)

### Support

En cas de problème :
1. Vérifier la console du navigateur
2. Contacter l'administrateur système
3. Consulter les logs d'application

---

## 🎉 Résumé

✅ **Problème résolu** : L'affichage des sanctions fonctionne maintenant correctement

✅ **Nouvelles fonctionnalités** : Modification et suppression des sanctions

✅ **Interface améliorée** : Interface utilisateur intuitive et responsive

✅ **Validation renforcée** : Contrôles de saisie et validation des données

L'application est maintenant **100% opérationnelle** pour la gestion des sanctions ! 🚀

# Guide des Rôles et Permissions - CDP Missions

## Vue d'ensemble

L'application CDP Missions utilise un système de **rôles et permissions** pour contrôler l'accès aux différentes fonctionnalités. Chaque utilisateur se voit attribuer un rôle qui détermine ses droits d'accès.

## 🎯 Rôles disponibles

### 1. **Administrateur** (`admin`)
**Accès complet à toutes les fonctionnalités**

- ✅ **Créer des missions** - Peut créer de nouvelles missions
- ✅ **Modifier des missions** - Peut modifier toutes les missions
- ✅ **Supprimer des missions** - Peut supprimer des missions
- ✅ **Voir toutes les missions** - Accès complet à toutes les missions
- ✅ **Importer des missions** - Peut importer des missions depuis des fichiers
- ✅ **Gérer les utilisateurs** - Peut créer, modifier, supprimer des utilisateurs
- ✅ **Voir les rapports** - Accès aux rapports et statistiques
- ✅ **Modifier les rapports** - Peut créer et modifier des rapports
- ✅ **Gérer les documents** - Peut gérer tous les documents
- ✅ **Changer les statuts** - Peut modifier les statuts des missions
- ✅ **Mode debug** - Accès aux fonctionnalités de débogage

**Utilisation recommandée :** Responsables IT, administrateurs système

---

### 2. **Superviseur** (`supervisor`)
**Gestion des missions et rapports, pas de gestion utilisateurs**

- ✅ **Créer des missions** - Peut créer de nouvelles missions
- ✅ **Modifier des missions** - Peut modifier les missions
- ❌ **Supprimer des missions** - Ne peut pas supprimer des missions
- ✅ **Voir toutes les missions** - Accès complet à toutes les missions
- ✅ **Importer des missions** - Peut importer des missions depuis des fichiers
- ❌ **Gérer les utilisateurs** - Ne peut pas gérer les utilisateurs
- ✅ **Voir les rapports** - Accès aux rapports et statistiques
- ✅ **Modifier les rapports** - Peut créer et modifier des rapports
- ✅ **Gérer les documents** - Peut gérer tous les documents
- ✅ **Changer les statuts** - Peut modifier les statuts des missions
- ❌ **Mode debug** - Pas d'accès aux fonctionnalités de débogage

**Utilisation recommandée :** Chefs d'équipe, superviseurs de projets

---

### 3. **Contrôleur** (`controller`)
**Création et modification de missions, accès limité**

- ✅ **Créer des missions** - Peut créer de nouvelles missions
- ✅ **Modifier des missions** - Peut modifier les missions
- ❌ **Supprimer des missions** - Ne peut pas supprimer des missions
- ❌ **Voir toutes les missions** - Accès limité aux missions
- ❌ **Importer des missions** - Ne peut pas importer des missions
- ❌ **Gérer les utilisateurs** - Ne peut pas gérer les utilisateurs
- ❌ **Voir les rapports** - Pas d'accès aux rapports
- ❌ **Modifier les rapports** - Ne peut pas modifier les rapports
- ✅ **Gérer les documents** - Peut gérer les documents liés à ses missions
- ✅ **Changer les statuts** - Peut modifier les statuts des missions
- ❌ **Mode debug** - Pas d'accès aux fonctionnalités de débogage

**Utilisation recommandée :** Contrôleurs, auditeurs, agents de terrain

---

### 4. **Lecteur** (`viewer`)
**Consultation uniquement, pas de modifications**

- ❌ **Créer des missions** - Ne peut pas créer de missions
- ❌ **Modifier des missions** - Ne peut pas modifier les missions
- ❌ **Supprimer des missions** - Ne peut pas supprimer des missions
- ✅ **Voir toutes les missions** - Peut consulter toutes les missions
- ❌ **Importer des missions** - Ne peut pas importer des missions
- ❌ **Gérer les utilisateurs** - Ne peut pas gérer les utilisateurs
- ✅ **Voir les rapports** - Peut consulter les rapports
- ❌ **Modifier les rapports** - Ne peut pas modifier les rapports
- ❌ **Gérer les documents** - Ne peut pas gérer les documents
- ❌ **Changer les statuts** - Ne peut pas modifier les statuts
- ❌ **Mode debug** - Pas d'accès aux fonctionnalités de débogage

**Utilisation recommandée :** Consultants, observateurs, parties prenantes

---

### 5. **Utilisateur** (`user`)
**Accès très limité, missions assignées uniquement**

- ❌ **Créer des missions** - Ne peut pas créer de missions
- ❌ **Modifier des missions** - Ne peut pas modifier les missions
- ❌ **Supprimer des missions** - Ne peut pas supprimer des missions
- ❌ **Voir toutes les missions** - Accès limité aux missions assignées
- ❌ **Importer des missions** - Ne peut pas importer des missions
- ❌ **Gérer les utilisateurs** - Ne peut pas gérer les utilisateurs
- ❌ **Voir les rapports** - Pas d'accès aux rapports
- ❌ **Modifier les rapports** - Ne peut pas modifier les rapports
- ❌ **Gérer les documents** - Ne peut pas gérer les documents
- ❌ **Changer les statuts** - Ne peut pas modifier les statuts
- ❌ **Mode debug** - Pas d'accès aux fonctionnalités de débogage

**Utilisation recommandée :** Utilisateurs finaux, personnel de base

## 🔧 Comment attribuer un rôle

### 1. **Lors de la création d'un utilisateur**

1. Allez dans **"Gestion des utilisateurs"**
2. Cliquez sur **"Créer un utilisateur"**
3. Remplissez les informations de base
4. **Sélectionnez le rôle** dans le menu déroulant
5. **Consultez les permissions** affichées en temps réel
6. Cliquez sur **"Créer l'utilisateur"**

### 2. **Lors de la modification d'un utilisateur**

1. Allez dans **"Gestion des utilisateurs"**
2. Cliquez sur **"Modifier"** à côté de l'utilisateur
3. **Changez le rôle** dans le menu déroulant
4. **Consultez les nouvelles permissions** affichées
5. Cliquez sur **"Sauvegarder"**

## 📊 Tableau comparatif des permissions

| Permission | Admin | Supervisor | Controller | Viewer | User |
|------------|-------|------------|------------|--------|------|
| **Créer des missions** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Modifier des missions** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Supprimer des missions** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Voir toutes les missions** | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Importer des missions** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Gérer les utilisateurs** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Voir les rapports** | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Modifier les rapports** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Gérer les documents** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Changer les statuts** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Mode debug** | ✅ | ❌ | ❌ | ❌ | ❌ |

## 🛡️ Bonnes pratiques de sécurité

### **Recommandations pour l'attribution des rôles :**

1. **Principe du moindre privilège** : Donnez aux utilisateurs le minimum de permissions nécessaires
2. **Révision régulière** : Vérifiez périodiquement les rôles attribués
3. **Documentation** : Gardez une trace des rôles attribués et des justifications
4. **Formation** : Assurez-vous que les utilisateurs comprennent leurs responsabilités

### **Rôles par défaut recommandés :**

- **Nouveaux employés** : `user` ou `viewer`
- **Contrôleurs de terrain** : `controller`
- **Chefs d'équipe** : `supervisor`
- **Administrateurs IT** : `admin`

## 🔄 Modification des permissions

### **Pour modifier les permissions d'un rôle :**

1. **Éditez le fichier** `src/types/auth.ts`
2. **Modifiez l'objet** `ROLE_PERMISSIONS`
3. **Redémarrez l'application** pour appliquer les changements

### **Exemple de modification :**

```typescript
export const ROLE_PERMISSIONS: Record<UserRole, Permissions> = {
  supervisor: {
    canCreateMissions: true,
    canEditMissions: true,
    canDeleteMissions: true, // Ajout de cette permission
    // ... autres permissions
  },
  // ... autres rôles
};
```

## 🚨 Sécurité et limitations

### **Limitations importantes :**

- **Pas de permissions personnalisées** : Seuls les rôles prédéfinis sont disponibles
- **Permissions globales** : Les permissions s'appliquent à toutes les missions
- **Pas de permissions par mission** : Impossible d'attribuer des permissions spécifiques à une mission

### **Recommandations de sécurité :**

- **Changez le mot de passe admin** par défaut
- **Surveillez les connexions** des utilisateurs avec des rôles élevés
- **Sauvegardez régulièrement** les données utilisateurs
- **Formez les utilisateurs** sur les bonnes pratiques de sécurité

## 📞 Support

En cas de question sur les rôles et permissions :

1. **Consultez ce guide** pour comprendre les différences
2. **Testez les permissions** en vous connectant avec différents rôles
3. **Contactez l'administrateur** pour des modifications de rôles
4. **Vérifiez les logs** en cas de problème d'accès

---

**Note :** Ce système de rôles est conçu pour être simple et efficace. Pour des besoins plus complexes, considérez l'ajout de permissions personnalisées ou de rôles supplémentaires.

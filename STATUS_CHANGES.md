# Système de Changement Automatique de Statut des Missions

## Vue d'ensemble

Ce système permet de gérer automatiquement les changements de statut des missions basés sur leurs dates de début et de fin. Les statuts changent automatiquement selon les règles suivantes :

- **PLANIFIEE** → **EN_COURS** : Quand la date de début de la mission est atteinte
- **EN_COURS** → **TERMINEE** : Quand la date de fin de la mission est dépassée

## Fonctionnalités

### 1. Mise à jour automatique côté serveur
- Vérification automatique toutes les heures
- Route API pour déclencher manuellement la mise à jour
- Logs détaillés des changements effectués

### 2. Mise à jour automatique côté client
- Vérification en temps réel dans l'interface utilisateur
- Alertes visuelles pour les missions qui vont changer de statut
- Indicateur de notification dans la barre de navigation

### 3. Alertes intelligentes
- Missions qui vont commencer dans les 24 prochaines heures
- Missions qui vont se terminer dans les 7 prochains jours
- Interface utilisateur intuitive avec boutons d'action

## Utilisation

### Test du système

Pour tester le système avec des missions d'exemple :

```bash
npm run test-status-changes
```

Ce script va :
1. Créer 4 missions de test avec des dates différentes
2. Tester la mise à jour automatique des statuts
3. Afficher les résultats dans la console

### Missions de test créées

1. **TEST-001** : Commence dans 2 heures (PLANIFIEE → EN_COURS)
2. **TEST-002** : Se termine dans 2 jours (EN_COURS → TERMINEE)
3. **TEST-003** : Déjà terminée (EN_COURS → TERMINEE)
4. **TEST-004** : Planifiée pour plus tard (pas d'alerte)

### Interface utilisateur

#### Alertes dans le tableau de bord
- Affichage des missions qui vont changer de statut
- Bouton pour déclencher manuellement la mise à jour
- Possibilité de masquer les alertes

#### Indicateur de notification
- Icône de cloche dans la barre de navigation
- Badge rouge avec le nombre d'alertes
- Mise à jour en temps réel

## Configuration

### Fréquence de vérification

- **Serveur** : Toutes les heures (configurable dans `server/index.ts`)
- **Client** : Toutes les 5 minutes pour les alertes, toutes les minutes pour l'indicateur

### Seuils d'alerte

- **Missions qui commencent** : Dans les 24 prochaines heures
- **Missions qui se terminent** : Dans les 7 prochains jours

## API Endpoints

### POST /api/missions/update-statuses
Déclenche manuellement la mise à jour des statuts.

**Réponse :**
```json
{
  "message": "Mise à jour des statuts terminée"
}
```

## Base de données locale

### Fonctions disponibles

- `updateMissionStatuses()` : Met à jour automatiquement les statuts
- `checkUpcomingStatusChanges()` : Vérifie les changements à venir

### Exemple d'utilisation

```typescript
import { db } from './database/localStorageDb';

// Mettre à jour les statuts
const result = await db.updateMissionStatuses();
console.log(`${result.updated} missions mises à jour`);

// Vérifier les changements à venir
const changes = await db.checkUpcomingStatusChanges();
console.log(`${changes.startingSoon.length} missions vont commencer`);
console.log(`${changes.endingSoon.length} missions vont se terminer`);
```

## Logs et monitoring

### Logs serveur
- Connexion à MongoDB
- Vérification automatique des statuts
- Détails des missions mises à jour

### Logs client
- Vérification des changements à venir
- Mise à jour des alertes
- Erreurs de communication

## Dépannage

### Problèmes courants

1. **Les statuts ne changent pas automatiquement**
   - Vérifier que le serveur est en cours d'exécution
   - Vérifier les logs du serveur
   - Déclencher manuellement la mise à jour

2. **Les alertes ne s'affichent pas**
   - Vérifier que les dates des missions sont correctes
   - Rafraîchir la page
   - Vérifier la console du navigateur

3. **Erreurs de base de données**
   - Vérifier la connexion à la base de données
   - Redémarrer le serveur
   - Vérifier les permissions

### Commandes utiles

```bash
# Démarrer le serveur
npm run dev

# Tester le système
npm run test-status-changes

# Vérifier les logs
tail -f server.log
```

## Évolutions futures

- Notifications par email
- Rapports de changement de statut
- Configuration des seuils d'alerte
- Intégration avec un système de calendrier
- Notifications push

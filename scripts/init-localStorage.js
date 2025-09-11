// Script d'initialisation localStorage pour CDP Missions
console.log('🔧 Initialisation localStorage...');

// Créer l'admin par défaut
const admin = {
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "abdoulaye.niang@cdp.sn",
  "name": "Abdoulaye Niang",
  "role": "admin",
  "permissions": {
    "canCreateMissions": true,
    "canEditMissions": true,
    "canDeleteMissions": true,
    "canViewAllMissions": true,
    "canImportMissions": true,
    "canManageUsers": true,
    "canViewReports": true,
    "canEditReports": true,
    "canManageDocuments": true,
    "canChangeStatus": true,
    "canViewDebug": true
  },
  "created_at": new Date().toISOString(),
  "isActive": true,
  "department": "Direction",
  "phone": "",
  "password": "UGFzc2Vy"
};

// Sauvegarder dans localStorage
localStorage.setItem('cdp_users', JSON.stringify([admin]));
localStorage.setItem('cdp_missions', JSON.stringify([]));

console.log('✅ localStorage initialisé avec admin par défaut');
console.log('📧 Email: abdoulaye.niang@cdp.sn');
console.log('🔑 Mot de passe: Passer');
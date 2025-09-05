// Script pour créer l'admin localement dans le navigateur
// Copiez et collez ceci dans la console du navigateur (F12)

console.log('🔧 Création de l\'admin localement...');

// 1. Créer l'admin avec le bon UUID
const admin = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'abdoulaye.niang@cdp.sn',
  name: 'Abdoulaye Niang',
  role: 'admin',
  permissions: {
    canCreateMissions: true,
    canEditMissions: true,
    canDeleteMissions: true,
    canViewAllMissions: true,
    canImportMissions: true,
    canManageUsers: true,
    canViewReports: true,
    canEditReports: true,
    canManageDocuments: true,
    canChangeStatus: true,
    canViewDebug: true
  },
  created_at: new Date().toISOString(),
  isActive: true,
  department: 'Direction',
  phone: '',
  password: 'UGFzc2Vy' // 'Passer' encodé en base64
};

// 2. Sauvegarder dans localStorage
localStorage.setItem('cdp_users', JSON.stringify([admin]));

// 3. Créer une session
const sessionData = {
  user: {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    permissions: admin.permissions,
    isActive: admin.isActive,
    department: admin.department,
    phone: admin.phone
  },
  expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 heures
};
localStorage.setItem('session', btoa(JSON.stringify(sessionData)));

// 4. Vérifier
console.log('✅ Admin créé localement !');
console.log('📋 Détails:', admin);
console.log('🔄 Rechargez la page pour vous connecter');

// 5. Recharger automatiquement
setTimeout(() => {
  location.reload();
}, 2000);

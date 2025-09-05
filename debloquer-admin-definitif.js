// Script de déblocage définitif de l'admin
// Copiez et collez ceci dans la console du navigateur (F12)

console.log('🔧 Déblocage définitif de l\'admin...');

// 1. Supprimer complètement les tentatives de connexion
localStorage.removeItem('cdp_login_attempts');

// 2. Vider tout le localStorage pour repartir à zéro
localStorage.clear();

// 3. Créer l'admin avec les bonnes données
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

// 4. Sauvegarder l'admin
localStorage.setItem('cdp_users', JSON.stringify([admin]));

// 5. Créer une session valide
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

// 6. Vérifier
console.log('✅ Admin débloqué définitivement !');
console.log('📋 Détails:', admin);
console.log('🔄 Rechargement de la page...');

// 7. Recharger automatiquement
setTimeout(() => {
  location.reload();
}, 2000);

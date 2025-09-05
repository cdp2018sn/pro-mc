-- Script SIMPLE pour créer l'admin avec UUID valide
-- Copiez et collez ceci dans l'éditeur SQL de Supabase

-- Créer l'admin directement (ignore les conflits)
INSERT INTO users (id, email, name, role, is_active, permissions, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'abdoulaye.niang@cdp.sn',
  'Abdoulaye Niang',
  'admin',
  true,
  '{"canCreateMissions": true, "canEditMissions": true, "canDeleteMissions": true, "canViewAllMissions": true, "canImportMissions": true, "canManageUsers": true, "canViewReports": true, "canEditReports": true, "canManageDocuments": true, "canChangeStatus": true, "canViewDebug": true}',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Vérifier que l'admin existe
SELECT id, email, name, role, created_at FROM users WHERE email = 'abdoulaye.niang@cdp.sn';

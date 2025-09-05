-- Script pour corriger l'UUID de l'admin par défaut
-- Copiez et collez ceci dans l'éditeur SQL de Supabase

-- Supprimer l'ancien admin s'il existe avec un ID non-UUID
DELETE FROM users WHERE email = 'abdoulaye.niang@cdp.sn' AND id NOT LIKE '%-%-%-%-%';

-- Insérer l'admin avec le bon UUID
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
) ON CONFLICT (email) DO UPDATE SET
  id = '550e8400-e29b-41d4-a716-446655440000',
  name = 'Abdoulaye Niang',
  role = 'admin',
  is_active = true,
  permissions = '{"canCreateMissions": true, "canEditMissions": true, "canDeleteMissions": true, "canViewAllMissions": true, "canImportMissions": true, "canManageUsers": true, "canViewReports": true, "canEditReports": true, "canManageDocuments": true, "canChangeStatus": true, "canViewDebug": true}',
  updated_at = NOW();

-- Vérifier que l'admin a été créé/mis à jour
SELECT id, email, name, role, created_at FROM users WHERE email = 'abdoulaye.niang@cdp.sn';

-- Script pour corriger l'admin existant
-- Copiez et collez ceci dans l'éditeur SQL de Supabase

-- 1. Vérifier l'admin existant
SELECT id, email, name, role, is_active, created_at FROM users WHERE email = 'abdoulaye.niang@cdp.sn';

-- 2. Mettre à jour l'admin existant avec les bonnes données
UPDATE users SET
  name = 'Abdoulaye Niang',
  role = 'admin',
  is_active = true,
  permissions = '{"canCreateMissions": true, "canEditMissions": true, "canDeleteMissions": true, "canViewAllMissions": true, "canImportMissions": true, "canManageUsers": true, "canViewReports": true, "canEditReports": true, "canManageDocuments": true, "canChangeStatus": true, "canViewDebug": true}',
  updated_at = NOW()
WHERE email = 'abdoulaye.niang@cdp.sn';

-- 3. Vérifier le résultat
SELECT id, email, name, role, is_active, permissions, updated_at FROM users WHERE email = 'abdoulaye.niang@cdp.sn';

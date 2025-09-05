-- Script SIMPLE pour corriger l'admin
-- Copiez et collez ceci dans l'éditeur SQL de Supabase

-- 1. Désactiver RLS temporairement
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer l'admin existant s'il y en a un
DELETE FROM users WHERE email = 'abdoulaye.niang@cdp.sn';

-- 3. Créer l'admin avec un nouvel UUID
INSERT INTO users (id, email, name, role, is_active, permissions, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'abdoulaye.niang@cdp.sn',
  'Abdoulaye Niang',
  'admin',
  true,
  '{"canCreateMissions": true, "canEditMissions": true, "canDeleteMissions": true, "canViewAllMissions": true, "canImportMissions": true, "canManageUsers": true, "canViewReports": true, "canEditReports": true, "canManageDocuments": true, "canChangeStatus": true, "canViewDebug": true}',
  NOW(),
  NOW()
);

-- 4. Créer des politiques simples
CREATE POLICY "allow_all_users_select" ON users FOR SELECT USING (true);
CREATE POLICY "allow_all_users_insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_users_update" ON users FOR UPDATE USING (true);
CREATE POLICY "allow_all_users_delete" ON users FOR DELETE USING (true);

-- 5. Réactiver RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 6. Vérifier
SELECT id, email, name, role, is_active, created_at FROM users WHERE email = 'abdoulaye.niang@cdp.sn';

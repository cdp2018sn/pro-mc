-- Script pour corriger les politiques RLS et permettre la création d'utilisateurs
-- Copiez et collez ceci dans l'éditeur SQL de Supabase

-- 1. Désactiver temporairement RLS sur la table users
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;

-- 3. Créer des politiques simples qui permettent tout
CREATE POLICY "allow_all_users_select" ON users
    FOR SELECT USING (true);

CREATE POLICY "allow_all_users_insert" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "allow_all_users_update" ON users
    FOR UPDATE USING (true);

CREATE POLICY "allow_all_users_delete" ON users
    FOR DELETE USING (true);

-- 4. Réactiver RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 5. Vérifier que l'admin existe
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

-- 6. Vérifier le résultat
SELECT id, email, name, role, is_active, created_at FROM users ORDER BY created_at DESC;

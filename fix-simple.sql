-- SOLUTION SIMPLE - Désactiver RLS temporairement
-- Copiez et collez ceci dans l'éditeur SQL de Supabase

-- Désactiver RLS sur toutes les tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE missions DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE findings DISABLE ROW LEVEL SECURITY;
ALTER TABLE sanctions DISABLE ROW LEVEL SECURITY;
ALTER TABLE remarks DISABLE ROW LEVEL SECURITY;

-- Corriger la structure de la table users
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Tester la création d'un utilisateur
INSERT INTO users (email, name, role, department, phone, is_active, permissions)
VALUES (
  'test-simple@cdp.sn',
  'Test Simple',
  'admin',
  'Test',
  '123456789',
  true,
  '{"canCreateMissions": true, "canEditMissions": true, "canDeleteMissions": true, "canViewAllMissions": true, "canImportMissions": true, "canManageUsers": true, "canViewReports": true, "canEditReports": true, "canManageDocuments": true, "canChangeStatus": true, "canViewDebug": true}'
);

-- Vérifier que l'utilisateur a été créé
SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC LIMIT 3;

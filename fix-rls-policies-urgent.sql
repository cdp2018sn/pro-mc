-- CORRECTION URGENTE - Politiques RLS avec récursion infinie
-- À exécuter IMMÉDIATEMENT dans l'éditeur SQL de Supabase

-- 1. DÉSACTIVER COMPLÈTEMENT RLS TEMPORAIREMENT
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE missions DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE findings DISABLE ROW LEVEL SECURITY;
ALTER TABLE sanctions DISABLE ROW LEVEL SECURITY;
ALTER TABLE remarks DISABLE ROW LEVEL SECURITY;

-- 2. SUPPRIMER TOUTES LES POLITIQUES EXISTANTES
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Only admins can manage users" ON users;
DROP POLICY IF EXISTS "View missions based on role" ON missions;
DROP POLICY IF EXISTS "Create missions with permission" ON missions;
DROP POLICY IF EXISTS "Update missions with permission" ON missions;
DROP POLICY IF EXISTS "Delete missions with permission" ON missions;
DROP POLICY IF EXISTS "View related data" ON documents;
DROP POLICY IF EXISTS "Manage related data" ON documents;
DROP POLICY IF EXISTS "View findings" ON findings;
DROP POLICY IF EXISTS "Manage findings" ON findings;
DROP POLICY IF EXISTS "View sanctions" ON sanctions;
DROP POLICY IF EXISTS "Manage sanctions" ON sanctions;
DROP POLICY IF EXISTS "View remarks" ON remarks;
DROP POLICY IF EXISTS "Manage remarks" ON remarks;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON users;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON users;
DROP POLICY IF EXISTS "Allow read access to all users" ON users;
DROP POLICY IF EXISTS "Allow insert for user creation" ON users;
DROP POLICY IF EXISTS "Allow update for user management" ON users;
DROP POLICY IF EXISTS "Allow delete for admin users" ON users;

-- 3. CORRIGER LA STRUCTURE DE LA TABLE USERS
-- Supprimer la contrainte problématique
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Modifier la colonne id pour accepter des UUID générés automatiquement
ALTER TABLE users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 4. RÉACTIVER RLS AVEC DES POLITIQUES SIMPLES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE remarks ENABLE ROW LEVEL SECURITY;

-- 5. CRÉER DES POLITIQUES SIMPLES SANS RÉCURSION
-- Pour la table users
CREATE POLICY "users_select_policy" ON users FOR SELECT USING (true);
CREATE POLICY "users_insert_policy" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_update_policy" ON users FOR UPDATE USING (true);
CREATE POLICY "users_delete_policy" ON users FOR DELETE USING (true);

-- Pour la table missions
CREATE POLICY "missions_select_policy" ON missions FOR SELECT USING (true);
CREATE POLICY "missions_insert_policy" ON missions FOR INSERT WITH CHECK (true);
CREATE POLICY "missions_update_policy" ON missions FOR UPDATE USING (true);
CREATE POLICY "missions_delete_policy" ON missions FOR DELETE USING (true);

-- Pour la table documents
CREATE POLICY "documents_select_policy" ON documents FOR SELECT USING (true);
CREATE POLICY "documents_insert_policy" ON documents FOR INSERT WITH CHECK (true);
CREATE POLICY "documents_update_policy" ON documents FOR UPDATE USING (true);
CREATE POLICY "documents_delete_policy" ON documents FOR DELETE USING (true);

-- Pour la table findings
CREATE POLICY "findings_select_policy" ON findings FOR SELECT USING (true);
CREATE POLICY "findings_insert_policy" ON findings FOR INSERT WITH CHECK (true);
CREATE POLICY "findings_update_policy" ON findings FOR UPDATE USING (true);
CREATE POLICY "findings_delete_policy" ON findings FOR DELETE USING (true);

-- Pour la table sanctions
CREATE POLICY "sanctions_select_policy" ON sanctions FOR SELECT USING (true);
CREATE POLICY "sanctions_insert_policy" ON sanctions FOR INSERT WITH CHECK (true);
CREATE POLICY "sanctions_update_policy" ON sanctions FOR UPDATE USING (true);
CREATE POLICY "sanctions_delete_policy" ON sanctions FOR DELETE USING (true);

-- Pour la table remarks
CREATE POLICY "remarks_select_policy" ON remarks FOR SELECT USING (true);
CREATE POLICY "remarks_insert_policy" ON remarks FOR INSERT WITH CHECK (true);
CREATE POLICY "remarks_update_policy" ON remarks FOR UPDATE USING (true);
CREATE POLICY "remarks_delete_policy" ON remarks FOR DELETE USING (true);

-- 6. VÉRIFIER LA CONFIGURATION
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'missions', 'documents', 'findings', 'sanctions', 'remarks');

-- 7. TESTER LA CRÉATION D'UN UTILISATEUR
INSERT INTO users (email, name, role, department, phone, is_active, permissions)
VALUES (
  'test-admin@cdp.sn',
  'Administrateur Test',
  'admin',
  'Direction',
  '123456789',
  true,
  '{"canCreateMissions": true, "canEditMissions": true, "canDeleteMissions": true, "canViewAllMissions": true, "canImportMissions": true, "canManageUsers": true, "canViewReports": true, "canEditReports": true, "canManageDocuments": true, "canChangeStatus": true, "canViewDebug": true}'
);

-- 8. VÉRIFIER QUE L'UTILISATEUR A ÉTÉ CRÉÉ
SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC LIMIT 5;

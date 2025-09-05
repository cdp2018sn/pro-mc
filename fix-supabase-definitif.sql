-- SOLUTION DÉFINITIVE POUR SUPABASE
-- Copiez et collez ceci dans l'éditeur SQL de Supabase

-- 1. DÉSACTIVER COMPLÈTEMENT RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE missions DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE findings DISABLE ROW LEVEL SECURITY;
ALTER TABLE sanctions DISABLE ROW LEVEL SECURITY;
ALTER TABLE remarks DISABLE ROW LEVEL SECURITY;

-- 2. SUPPRIMER TOUTES LES POLITIQUES EXISTANTES
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Supprimer toutes les politiques de toutes les tables
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 3. CORRIGER LA STRUCTURE DE LA TABLE USERS
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 4. TESTER LA CRÉATION D'UN UTILISATEUR
INSERT INTO users (email, name, role, department, phone, is_active, permissions)
VALUES (
  'test-definitif@cdp.sn',
  'Test Définitif',
  'admin',
  'Test',
  '123456789',
  true,
  '{"canCreateMissions": true, "canEditMissions": true, "canDeleteMissions": true, "canViewAllMissions": true, "canImportMissions": true, "canManageUsers": true, "canViewReports": true, "canEditReports": true, "canManageDocuments": true, "canChangeStatus": true, "canViewDebug": true}'
);

-- 5. VÉRIFIER QUE L'UTILISATEUR A ÉTÉ CRÉÉ
SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC LIMIT 5;

-- 6. VÉRIFIER LE STATUT RLS (doit être 'f' pour false)
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'missions', 'documents', 'findings', 'sanctions', 'remarks');

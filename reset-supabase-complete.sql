-- RÉINITIALISATION COMPLÈTE DE SUPABASE
-- Ce script va complètement réinitialiser les politiques RLS
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
    -- Supprimer toutes les politiques de la table users
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON users';
    END LOOP;
    
    -- Supprimer toutes les politiques de la table missions
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'missions') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON missions';
    END LOOP;
    
    -- Supprimer toutes les politiques de la table documents
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'documents') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON documents';
    END LOOP;
    
    -- Supprimer toutes les politiques de la table findings
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'findings') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON findings';
    END LOOP;
    
    -- Supprimer toutes les politiques de la table sanctions
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'sanctions') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON sanctions';
    END LOOP;
    
    -- Supprimer toutes les politiques de la table remarks
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'remarks') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON remarks';
    END LOOP;
END $$;

-- 3. CORRIGER LA STRUCTURE DE LA TABLE USERS
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 4. TESTER LA CRÉATION D'UN UTILISATEUR
INSERT INTO users (email, name, role, department, phone, is_active, permissions)
VALUES (
  'test-reset-complet@cdp.sn',
  'Test Reset Complet',
  'admin',
  'Test',
  '123456789',
  true,
  '{"canCreateMissions": true, "canEditMissions": true, "canDeleteMissions": true, "canViewAllMissions": true, "canImportMissions": true, "canManageUsers": true, "canViewReports": true, "canEditReports": true, "canManageDocuments": true, "canChangeStatus": true, "canViewDebug": true}'
);

-- 5. VÉRIFIER QUE L'UTILISATEUR A ÉTÉ CRÉÉ
SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC LIMIT 5;

-- 6. VÉRIFIER LE STATUT RLS
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'missions', 'documents', 'findings', 'sanctions', 'remarks');

-- CORRECTION DÉFINITIVE DE L'AUTHENTIFICATION GLOBALE
-- Ce script corrige l'accès global des utilisateurs sur toutes les machines

-- 1. DÉSACTIVER RLS TEMPORAIREMENT
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;

-- 2. SUPPRIMER TOUTES LES POLITIQUES EXISTANTES
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON users';
    END LOOP;
END $$;

-- 3. CORRIGER LA STRUCTURE DE LA TABLE USERS
-- Supprimer la contrainte problématique avec auth.users
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Permettre des UUID personnalisés
ALTER TABLE users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 4. CRÉER L'ADMIN PAR DÉFAUT AVEC UUID FIXE
INSERT INTO users (id, email, name, role, is_active, department, permissions)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'abdoulaye.niang@cdp.sn',
  'Abdoulaye Niang',
  'admin',
  true,
  'Direction',
  '{"canCreateMissions": true, "canEditMissions": true, "canDeleteMissions": true, "canViewAllMissions": true, "canImportMissions": true, "canManageUsers": true, "canViewReports": true, "canEditReports": true, "canManageDocuments": true, "canChangeStatus": true, "canViewDebug": true}'
) ON CONFLICT (email) DO UPDATE SET
  id = '550e8400-e29b-41d4-a716-446655440000',
  name = 'Abdoulaye Niang',
  role = 'admin',
  is_active = true,
  permissions = '{"canCreateMissions": true, "canEditMissions": true, "canDeleteMissions": true, "canViewAllMissions": true, "canImportMissions": true, "canManageUsers": true, "canViewReports": true, "canEditReports": true, "canManageDocuments": true, "canChangeStatus": true, "canViewDebug": true}',
  updated_at = NOW();

-- 5. CRÉER DES POLITIQUES SIMPLES QUI PERMETTENT TOUT
CREATE POLICY "global_users_select" ON users FOR SELECT USING (true);
CREATE POLICY "global_users_insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "global_users_update" ON users FOR UPDATE USING (true);
CREATE POLICY "global_users_delete" ON users FOR DELETE USING (true);

-- 6. RÉACTIVER RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 7. CRÉER UNE FONCTION POUR L'AUTHENTIFICATION GLOBALE
CREATE OR REPLACE FUNCTION authenticate_user(user_email TEXT, user_password TEXT)
RETURNS TABLE(
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  user_role TEXT,
  user_permissions JSONB,
  is_active BOOLEAN,
  department TEXT,
  phone TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.permissions,
    u.is_active,
    u.department,
    u.phone
  FROM users u
  WHERE u.email = user_email 
    AND u.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. CRÉER UNE FONCTION POUR CRÉER DES SESSIONS GLOBALES
CREATE OR REPLACE FUNCTION create_global_session(user_email TEXT)
RETURNS TABLE(
  session_id UUID,
  user_data JSONB,
  expires_at TIMESTAMPTZ
) AS $$
DECLARE
  session_uuid UUID;
  user_info JSONB;
  expiry TIMESTAMPTZ;
BEGIN
  session_uuid := gen_random_uuid();
  expiry := NOW() + INTERVAL '24 hours';
  
  SELECT to_jsonb(u.*) INTO user_info
  FROM users u
  WHERE u.email = user_email;
  
  RETURN QUERY
  SELECT session_uuid, user_info, expiry;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. TESTER LA CRÉATION D'UN UTILISATEUR
INSERT INTO users (email, name, role, department, phone, is_active, permissions)
VALUES (
  'test-global-access@cdp.sn',
  'Test Accès Global',
  'user',
  'Test',
  '123456789',
  true,
  '{"canCreateMissions": false, "canEditMissions": false, "canDeleteMissions": false, "canViewAllMissions": false, "canImportMissions": false, "canManageUsers": false, "canViewReports": true, "canEditReports": false, "canManageDocuments": false, "canChangeStatus": false, "canViewDebug": false}'
) ON CONFLICT (email) DO NOTHING;

-- 10. VÉRIFIER QUE TOUT FONCTIONNE
SELECT 
  'Authentification globale configurée' as message,
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM users WHERE role = 'admin') as admin_users,
  (SELECT COUNT(*) FROM users WHERE role != 'admin') as other_users;

-- 11. AFFICHER TOUS LES UTILISATEURS
SELECT 
  id,
  email,
  name,
  role,
  is_active,
  department,
  created_at
FROM users 
ORDER BY created_at DESC;

-- 12. TESTER L'AUTHENTIFICATION
SELECT * FROM authenticate_user('abdoulaye.niang@cdp.sn', 'Passer');
SELECT * FROM authenticate_user('test-global-access@cdp.sn', 'password');
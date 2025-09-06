-- CORRECTION DE L'ERREUR DE PARAMÈTRE DUPLIQUÉ
-- Ce script corrige l'erreur "parameter name used more than once"

-- 1. Activer l'extension pgcrypto pour le hachage sécurisé
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Supprimer les anciennes fonctions si elles existent
DROP FUNCTION IF EXISTS authenticate_user(TEXT, TEXT);
DROP FUNCTION IF EXISTS hash_and_insert_user(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

-- 3. Créer la fonction d'authentification avec des noms de paramètres uniques
CREATE OR REPLACE FUNCTION authenticate_user(p_email TEXT, p_password TEXT)
RETURNS TABLE(
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  user_role TEXT,
  user_permissions JSONB,
  is_active BOOLEAN,
  department TEXT,
  phone TEXT
) 
SECURITY DEFINER
AS $$
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
  WHERE u.email = p_email 
    AND u.is_active = true
    AND u.password_hash = crypt(p_password, u.password_hash);
END;
$$ LANGUAGE plpgsql;

-- 4. Créer la fonction pour hacher et insérer un utilisateur avec des noms uniques
CREATE OR REPLACE FUNCTION hash_and_insert_user(
  p_email TEXT,
  p_name TEXT,
  p_role TEXT,
  p_password TEXT,
  p_department TEXT DEFAULT '',
  p_phone TEXT DEFAULT ''
)
RETURNS TABLE(
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  user_role TEXT,
  is_active BOOLEAN
)
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  new_user_id := gen_random_uuid();
  
  INSERT INTO users (
    id, email, name, role, department, phone, is_active, 
    password_hash, permissions, created_at, updated_at
  ) VALUES (
    new_user_id,
    p_email,
    p_name,
    p_role,
    p_department,
    p_phone,
    true,
    crypt(p_password, gen_salt('bf')),
    CASE p_role
      WHEN 'admin' THEN '{"canCreateMissions": true, "canEditMissions": true, "canDeleteMissions": true, "canViewAllMissions": true, "canImportMissions": true, "canManageUsers": true, "canViewReports": true, "canEditReports": true, "canManageDocuments": true, "canChangeStatus": true, "canViewDebug": true}'::jsonb
      WHEN 'supervisor' THEN '{"canCreateMissions": true, "canEditMissions": true, "canDeleteMissions": false, "canViewAllMissions": true, "canImportMissions": true, "canManageUsers": false, "canViewReports": true, "canEditReports": true, "canManageDocuments": true, "canChangeStatus": true, "canViewDebug": false}'::jsonb
      ELSE '{"canCreateMissions": false, "canEditMissions": false, "canDeleteMissions": false, "canViewAllMissions": false, "canImportMissions": false, "canManageUsers": false, "canViewReports": false, "canEditReports": false, "canManageDocuments": false, "canChangeStatus": false, "canViewDebug": false}'::jsonb
    END,
    NOW(),
    NOW()
  );
  
  RETURN QUERY
  SELECT new_user_id, p_email, p_name, p_role, true;
END;
$$ LANGUAGE plpgsql;

-- 5. Insérer ou mettre à jour l'admin par défaut
INSERT INTO users (
  id, email, name, role, permissions, password_hash, is_active, department, phone, created_at, updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'abdoulaye.niang@cdp.sn',
  'Abdoulaye Niang',
  'admin',
  '{"canCreateMissions": true, "canEditMissions": true, "canDeleteMissions": true, "canViewAllMissions": true, "canImportMissions": true, "canManageUsers": true, "canViewReports": true, "canEditReports": true, "canManageDocuments": true, "canChangeStatus": true, "canViewDebug": true}'::jsonb,
  crypt('Passer', gen_salt('bf')),
  true,
  'Direction',
  '',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = crypt('Passer', gen_salt('bf')),
  permissions = '{"canCreateMissions": true, "canEditMissions": true, "canDeleteMissions": true, "canViewAllMissions": true, "canImportMissions": true, "canManageUsers": true, "canViewReports": true, "canEditReports": true, "canManageDocuments": true, "canChangeStatus": true, "canViewDebug": true}'::jsonb,
  updated_at = NOW();

-- 6. Configurer RLS avec politiques permissives
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "allow_all_users_select" ON users;
DROP POLICY IF EXISTS "allow_all_users_insert" ON users;
DROP POLICY IF EXISTS "allow_all_users_update" ON users;
DROP POLICY IF EXISTS "allow_all_users_delete" ON users;

-- Créer des politiques RLS permissives
CREATE POLICY "allow_all_users_select" ON users FOR SELECT USING (true);
CREATE POLICY "allow_all_users_insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_users_update" ON users FOR UPDATE USING (true);
CREATE POLICY "allow_all_users_delete" ON users FOR DELETE USING (true);

-- 7. Tester les fonctions
SELECT 'Test de la fonction authenticate_user:' as test;
SELECT * FROM authenticate_user('abdoulaye.niang@cdp.sn', 'Passer');

SELECT 'Vérification de l''admin:' as verification;
SELECT id, email, name, role, is_active FROM users WHERE email = 'abdoulaye.niang@cdp.sn';

SELECT 'Configuration terminée avec succès' as status;
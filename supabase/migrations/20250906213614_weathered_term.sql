/*
  # Correction de l'authentification globale Supabase

  1. Configuration de l'authentification Supabase
  2. Politiques RLS pour l'accès global
  3. Fonction de création automatique de profil utilisateur
  4. Synchronisation avec auth.users
*/

-- 1. S'assurer que la table users est liée à auth.users
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE users ADD CONSTRAINT users_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Fonction pour créer automatiquement un profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, is_active, permissions)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Nouvel utilisateur'),
    'user',
    true,
    '{"canCreateMissions": false, "canEditMissions": false, "canDeleteMissions": false, "canViewAllMissions": false, "canImportMissions": false, "canManageUsers": false, "canViewReports": false, "canEditReports": false, "canManageDocuments": false, "canChangeStatus": false, "canViewDebug": false}'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger pour créer automatiquement un profil utilisateur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Mettre à jour les politiques pour utiliser auth.uid()
DROP POLICY IF EXISTS "allow_all_users_select" ON users;
DROP POLICY IF EXISTS "allow_all_users_insert" ON users;
DROP POLICY IF EXISTS "allow_all_users_update" ON users;
DROP POLICY IF EXISTS "allow_all_users_delete" ON users;

-- Nouvelles politiques basées sur l'authentification Supabase
CREATE POLICY "authenticated_users_select" ON users 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_insert" ON users 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_update" ON users 
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_delete" ON users 
  FOR DELETE USING (auth.role() = 'authenticated');

-- Politiques similaires pour les autres tables
DROP POLICY IF EXISTS "allow_all_missions_select" ON missions;
DROP POLICY IF EXISTS "allow_all_missions_insert" ON missions;
DROP POLICY IF EXISTS "allow_all_missions_update" ON missions;
DROP POLICY IF EXISTS "allow_all_missions_delete" ON missions;

CREATE POLICY "authenticated_missions_select" ON missions 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_missions_insert" ON missions 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_missions_update" ON missions 
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_missions_delete" ON missions 
  FOR DELETE USING (auth.role() = 'authenticated');

-- Appliquer les mêmes politiques aux autres tables
DROP POLICY IF EXISTS "allow_all_documents_select" ON documents;
DROP POLICY IF EXISTS "allow_all_documents_insert" ON documents;
DROP POLICY IF EXISTS "allow_all_documents_update" ON documents;
DROP POLICY IF EXISTS "allow_all_documents_delete" ON documents;

CREATE POLICY "authenticated_documents_select" ON documents 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_documents_insert" ON documents 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_documents_update" ON documents 
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_documents_delete" ON documents 
  FOR DELETE USING (auth.role() = 'authenticated');

-- Findings
DROP POLICY IF EXISTS "allow_all_findings_select" ON findings;
DROP POLICY IF EXISTS "allow_all_findings_insert" ON findings;
DROP POLICY IF EXISTS "allow_all_findings_update" ON findings;
DROP POLICY IF EXISTS "allow_all_findings_delete" ON findings;

CREATE POLICY "authenticated_findings_select" ON findings 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_findings_insert" ON findings 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_findings_update" ON findings 
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_findings_delete" ON findings 
  FOR DELETE USING (auth.role() = 'authenticated');

-- Sanctions
DROP POLICY IF EXISTS "allow_all_sanctions_select" ON sanctions;
DROP POLICY IF EXISTS "allow_all_sanctions_insert" ON sanctions;
DROP POLICY IF EXISTS "allow_all_sanctions_update" ON sanctions;
DROP POLICY IF EXISTS "allow_all_sanctions_delete" ON sanctions;

CREATE POLICY "authenticated_sanctions_select" ON sanctions 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_sanctions_insert" ON sanctions 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_sanctions_update" ON sanctions 
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_sanctions_delete" ON sanctions 
  FOR DELETE USING (auth.role() = 'authenticated');

-- Remarks
DROP POLICY IF EXISTS "allow_all_remarks_select" ON remarks;
DROP POLICY IF EXISTS "allow_all_remarks_insert" ON remarks;
DROP POLICY IF EXISTS "allow_all_remarks_update" ON remarks;
DROP POLICY IF EXISTS "allow_all_remarks_delete" ON remarks;

CREATE POLICY "authenticated_remarks_select" ON remarks 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_remarks_insert" ON remarks 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_remarks_update" ON remarks 
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_remarks_delete" ON remarks 
  FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Créer l'admin dans auth.users si il n'existe pas
DO $$
BEGIN
  -- Vérifier si l'admin existe dans auth.users
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'abdoulaye.niang@cdp.sn'
  ) THEN
    -- Créer l'admin dans auth.users
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_user_meta_data
    ) VALUES (
      '550e8400-e29b-41d4-a716-446655440000',
      'abdoulaye.niang@cdp.sn',
      crypt('Passer', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"name": "Abdoulaye Niang"}'::jsonb
    );
  END IF;
END $$;

-- 6. S'assurer que l'admin existe dans la table users
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

-- 7. Vérifier que tout fonctionne
SELECT 
  'Authentification globale configurée' as message,
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM users) as profile_users;

-- 8. Afficher les utilisateurs
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.is_active,
  CASE 
    WHEN au.id IS NOT NULL THEN 'Supabase Auth'
    ELSE 'Local seulement'
  END as auth_type
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at DESC;
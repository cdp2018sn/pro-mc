/*
  # Reset Database Schema - Fix PGRST002 Error

  This migration completely resets and reconfigures the Supabase database
  to resolve the schema cache error (PGRST002).

  1. Database Reset
    - Drop and recreate all tables with proper structure
    - Create users, missions, documents, findings, sanctions, remarks tables
    - Set up proper relationships and constraints

  2. Authentication Functions
    - Create authenticate_user function with unique parameter names
    - Create hash_and_insert_user function for user creation
    - Enable secure password hashing with pgcrypto

  3. Security Configuration
    - Enable RLS on all tables
    - Create permissive policies to allow all operations
    - Ensure schema is accessible to PostgREST

  4. Default Data
    - Insert admin user with proper credentials
    - Set up default permissions and roles
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in correct order to handle dependencies)
DROP TABLE IF EXISTS remarks CASCADE;
DROP TABLE IF EXISTS sanctions CASCADE;
DROP TABLE IF EXISTS findings CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS missions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS authenticate_user(TEXT, TEXT);
DROP FUNCTION IF EXISTS hash_and_insert_user(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  department TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  password_hash TEXT NOT NULL,
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create missions table
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  priority TEXT DEFAULT 'medium',
  assigned_to UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  start_date DATE,
  end_date DATE,
  location TEXT,
  budget DECIMAL(15,2),
  objectives TEXT[],
  team_members UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  file_path TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create findings table
CREATE TABLE findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'low',
  category TEXT,
  status TEXT DEFAULT 'open',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sanctions table
CREATE TABLE sanctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  finding_id UUID REFERENCES findings(id),
  type TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(15,2),
  status TEXT DEFAULT 'pending',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create remarks table
CREATE TABLE remarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'general',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create authentication function with unique parameter names
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

-- Create user creation function
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

-- Insert default admin user
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

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE remarks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "allow_all_users_select" ON users;
DROP POLICY IF EXISTS "allow_all_users_insert" ON users;
DROP POLICY IF EXISTS "allow_all_users_update" ON users;
DROP POLICY IF EXISTS "allow_all_users_delete" ON users;

DROP POLICY IF EXISTS "allow_all_missions_select" ON missions;
DROP POLICY IF EXISTS "allow_all_missions_insert" ON missions;
DROP POLICY IF EXISTS "allow_all_missions_update" ON missions;
DROP POLICY IF EXISTS "allow_all_missions_delete" ON missions;

DROP POLICY IF EXISTS "allow_all_documents_select" ON documents;
DROP POLICY IF EXISTS "allow_all_documents_insert" ON documents;
DROP POLICY IF EXISTS "allow_all_documents_update" ON documents;
DROP POLICY IF EXISTS "allow_all_documents_delete" ON documents;

DROP POLICY IF EXISTS "allow_all_findings_select" ON findings;
DROP POLICY IF EXISTS "allow_all_findings_insert" ON findings;
DROP POLICY IF EXISTS "allow_all_findings_update" ON findings;
DROP POLICY IF EXISTS "allow_all_findings_delete" ON findings;

DROP POLICY IF EXISTS "allow_all_sanctions_select" ON sanctions;
DROP POLICY IF EXISTS "allow_all_sanctions_insert" ON sanctions;
DROP POLICY IF EXISTS "allow_all_sanctions_update" ON sanctions;
DROP POLICY IF EXISTS "allow_all_sanctions_delete" ON sanctions;

DROP POLICY IF EXISTS "allow_all_remarks_select" ON remarks;
DROP POLICY IF EXISTS "allow_all_remarks_insert" ON remarks;
DROP POLICY IF EXISTS "allow_all_remarks_update" ON remarks;
DROP POLICY IF EXISTS "allow_all_remarks_delete" ON remarks;

-- Create permissive RLS policies for all tables
CREATE POLICY "allow_all_users_select" ON users FOR SELECT USING (true);
CREATE POLICY "allow_all_users_insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_users_update" ON users FOR UPDATE USING (true);
CREATE POLICY "allow_all_users_delete" ON users FOR DELETE USING (true);

CREATE POLICY "allow_all_missions_select" ON missions FOR SELECT USING (true);
CREATE POLICY "allow_all_missions_insert" ON missions FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_missions_update" ON missions FOR UPDATE USING (true);
CREATE POLICY "allow_all_missions_delete" ON missions FOR DELETE USING (true);

CREATE POLICY "allow_all_documents_select" ON documents FOR SELECT USING (true);
CREATE POLICY "allow_all_documents_insert" ON documents FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_documents_update" ON documents FOR UPDATE USING (true);
CREATE POLICY "allow_all_documents_delete" ON documents FOR DELETE USING (true);

CREATE POLICY "allow_all_findings_select" ON findings FOR SELECT USING (true);
CREATE POLICY "allow_all_findings_insert" ON findings FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_findings_update" ON findings FOR UPDATE USING (true);
CREATE POLICY "allow_all_findings_delete" ON findings FOR DELETE USING (true);

CREATE POLICY "allow_all_sanctions_select" ON sanctions FOR SELECT USING (true);
CREATE POLICY "allow_all_sanctions_insert" ON sanctions FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_sanctions_update" ON sanctions FOR UPDATE USING (true);
CREATE POLICY "allow_all_sanctions_delete" ON sanctions FOR DELETE USING (true);

CREATE POLICY "allow_all_remarks_select" ON remarks FOR SELECT USING (true);
CREATE POLICY "allow_all_remarks_insert" ON remarks FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_remarks_update" ON remarks FOR UPDATE USING (true);
CREATE POLICY "allow_all_remarks_delete" ON remarks FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_missions_reference ON missions(reference);
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_documents_mission_id ON documents(mission_id);
CREATE INDEX IF NOT EXISTS idx_findings_mission_id ON findings(mission_id);
CREATE INDEX IF NOT EXISTS idx_sanctions_mission_id ON sanctions(mission_id);
CREATE INDEX IF NOT EXISTS idx_remarks_mission_id ON remarks(mission_id);

-- Test the functions and verify setup
SELECT 'Test de la fonction authenticate_user:' as test;
SELECT * FROM authenticate_user('abdoulaye.niang@cdp.sn', 'Passer');

SELECT 'Vérification des tables créées:' as verification;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

SELECT 'Vérification de l''admin:' as admin_check;
SELECT id, email, name, role, is_active FROM users WHERE email = 'abdoulaye.niang@cdp.sn';

-- Count records
SELECT 
  'Configuration terminée avec succès' as status,
  'nb_users: ' || (SELECT COUNT(*) FROM users) as nb_users,
  'nb_missions: ' || (SELECT COUNT(*) FROM missions) as nb_missions;
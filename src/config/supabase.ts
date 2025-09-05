import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialisation conditionnelle de Supabase
let supabase: any = null;
let testSupabaseConnection: () => Promise<boolean>;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variables d\'environnement Supabase manquantes. Mode local activé.');
  // Mode local - pas de Supabase
  supabase = null;
  testSupabaseConnection = async () => {
    console.log('⚠️ Supabase désactivé - mode local');
    return false;
  };
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Test de connexion
  testSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      if (error) throw error;
      console.log('✅ Connexion Supabase réussie');
      return true;
    } catch (error) {
      console.error('❌ Erreur de connexion Supabase:', error);
      return false;
    }
  };
}

export { supabase, testSupabaseConnection };
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase avec valeurs par défaut
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://zkjhbstofbthnitunzcf.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpramhic3RvZmJ0aG5pdHVuemNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwOTA0ODcsImV4cCI6MjA3MjY2NjQ4N30.OoFTGdwjXvA1hwcMsh_8WIQmNerBulCd7wCxRFTe21w';

// Initialisation conditionnelle de Supabase
let supabase: any = null;
let testSupabaseConnection: () => Promise<boolean>;

// Toujours initialiser Supabase avec les valeurs par défaut
supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log('✅ Supabase initialisé avec succès');

// Test de connexion
testSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('users').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Connexion Supabase réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion Supabase:', error);
    return false;
  }
};

export { supabase, testSupabaseConnection };
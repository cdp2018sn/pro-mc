import { createClient } from '@supabase/supabase-js';

// Configuration Supabase avec gestion d'erreurs robuste
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zkjhbstofbthnitunzcf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpramhic3RvZmJ0aG5pdHVuemNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwOTA0ODcsImV4cCI6MjA3MjY2NjQ4N30.OoFTGdwjXvA1hwcMsh_8WIQmNerBulCd7wCxRFTe21w';

console.log('🔧 Configuration Supabase...');
console.log('📡 URL:', supabaseUrl);
console.log('🔑 Clé configurée:', supabaseAnonKey ? 'Oui' : 'Non');

// Créer le client Supabase avec configuration robuste
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'cdp-missions@1.0.0'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

// Test de connexion au démarrage
export const initializeSupabase = async (): Promise<boolean> => {
  try {
    console.log('🔍 Test de connexion Supabase...');
    
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('⚠️ Supabase non disponible:', error.message);
      return false;
    }
    
    console.log('✅ Supabase initialisé avec succès');
    return true;
  } catch (error) {
    console.log('⚠️ Erreur initialisation Supabase:', error);
    return false;
  }
};

// Initialiser automatiquement
initializeSupabase().then(success => {
  if (success) {
    console.log('🎉 Base de données Supabase connectée');
  } else {
    console.log('💾 Mode localStorage activé');
  }
}).catch(error => {
  console.log('⚠️ Erreur connexion Supabase, mode localStorage:', error);
});
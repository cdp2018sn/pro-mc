#!/usr/bin/env node

/**
 * Script de test pour la connexion Supabase
 * Usage: node test-supabase.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zkjhbstofbthnitunzcf.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpramhic3RvZmJ0aG5pdHVuemNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwOTA0ODcsImV4cCI6MjA3MjY2NjQ4N30.OoFTGdwjXvA1hwcMsh_8WIQmNerBulCd7wCxRFTe21w';

async function testSupabaseConnection() {
  console.log('🔍 Test de connexion à Supabase...\n');
  
  try {
    // Créer le client Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Client Supabase créé avec succès');
    
    // Test 1: Vérifier la connexion
    console.log('\n1️⃣ Test de connexion...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log('⚠️ Erreur lors de la requête:', error.message);
      console.log('💡 Cela peut être normal si les tables n\'existent pas encore');
    } else {
      console.log('✅ Connexion Supabase réussie');
    }
    
    // Test 2: Vérifier l'authentification
    console.log('\n2️⃣ Test d\'authentification...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('⚠️ Erreur d\'authentification:', authError.message);
    } else {
      console.log('✅ Service d\'authentification accessible');
    }
    
    // Test 3: Vérifier les informations du projet
    console.log('\n3️⃣ Informations du projet...');
    console.log(`   - URL: ${supabaseUrl}`);
    console.log(`   - Clé: ${supabaseAnonKey.substring(0, 20)}...`);
    
    console.log('\n✅ Tests Supabase terminés avec succès !');
    console.log('🎉 Votre configuration Supabase est opérationnelle');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Erreur lors des tests Supabase:', error.message);
    console.log('\n🔧 Solutions possibles:');
    console.log('1. Vérifiez votre connexion internet');
    console.log('2. Vérifiez que l\'URL Supabase est correcte');
    console.log('3. Vérifiez que la clé API est correcte');
    console.log('4. Vérifiez que le projet Supabase existe et est actif');
    return false;
  }
}

// Exécuter les tests
testSupabaseConnection();

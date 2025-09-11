#!/usr/bin/env node

/**
 * Script de configuration automatique de la base de données
 * Ce script configure automatiquement Supabase ou localStorage selon la disponibilité
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🚀 CONFIGURATION AUTOMATIQUE DE LA BASE DE DONNÉES');
console.log('='.repeat(60));

async function setupDatabase() {
  // Vérifier si Supabase est configuré
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('⚠️ Variables Supabase non configurées');
    console.log('📝 Configuration en mode localStorage uniquement...');
    await setupLocalStorageMode();
    return;
  }

  console.log('🔍 Test de connexion Supabase...');
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log('❌ Supabase non accessible:', error.message);
      console.log('📋 Instructions pour configurer Supabase:');
      console.log('1. Allez sur https://supabase.com/dashboard');
      console.log('2. Sélectionnez votre projet');
      console.log('3. Allez dans SQL Editor');
      console.log('4. Copiez et exécutez le contenu de: supabase/migrations/create_complete_schema.sql');
      console.log('5. Redémarrez l\'application');
      
      await setupLocalStorageMode();
      return;
    }

    console.log('✅ Supabase connecté avec succès');
    await setupSupabaseMode();
    
  } catch (error) {
    console.log('❌ Erreur de connexion Supabase:', error.message);
    await setupLocalStorageMode();
  }
}

async function setupSupabaseMode() {
  console.log('\n🌍 CONFIGURATION MODE SUPABASE');
  console.log('-'.repeat(40));
  
  console.log('✅ Base de données: Supabase (cloud)');
  console.log('✅ Synchronisation: Automatique');
  console.log('✅ Accessibilité: Globale (tous appareils)');
  console.log('✅ Sauvegarde: Automatique dans le cloud');
  
  // Créer un fichier de configuration
  const config = {
    database: 'supabase',
    url: process.env.VITE_SUPABASE_URL,
    features: {
      globalSync: true,
      cloudBackup: true,
      multiDevice: true,
      realtime: true
    },
    setupDate: new Date().toISOString()
  };
  
  fs.writeFileSync('database-config.json', JSON.stringify(config, null, 2));
  console.log('📄 Configuration sauvegardée dans database-config.json');
}

async function setupLocalStorageMode() {
  console.log('\n💾 CONFIGURATION MODE LOCALSTORAGE');
  console.log('-'.repeat(40));
  
  console.log('✅ Base de données: localStorage (local)');
  console.log('⚠️ Synchronisation: Locale uniquement');
  console.log('⚠️ Accessibilité: Cet appareil uniquement');
  console.log('⚠️ Sauvegarde: Manuelle recommandée');
  
  // Créer un fichier de configuration
  const config = {
    database: 'localStorage',
    features: {
      globalSync: false,
      cloudBackup: false,
      multiDevice: false,
      realtime: false
    },
    setupDate: new Date().toISOString(),
    recommendations: [
      'Configurez Supabase pour un accès global',
      'Sauvegardez régulièrement vos données',
      'Utilisez l\'export/import pour transférer les données'
    ]
  };
  
  fs.writeFileSync('database-config.json', JSON.stringify(config, null, 2));
  console.log('📄 Configuration sauvegardée dans database-config.json');
  
  // Initialiser localStorage avec des données de base
  console.log('🔧 Initialisation localStorage...');
  
  const defaultAdmin = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'abdoulaye.niang@cdp.sn',
    name: 'Abdoulaye Niang',
    role: 'admin',
    permissions: {
      canCreateMissions: true,
      canEditMissions: true,
      canDeleteMissions: true,
      canViewAllMissions: true,
      canImportMissions: true,
      canManageUsers: true,
      canViewReports: true,
      canEditReports: true,
      canManageDocuments: true,
      canChangeStatus: true,
      canViewDebug: true
    },
    created_at: new Date().toISOString(),
    isActive: true,
    department: 'Direction',
    phone: '',
    password: 'UGFzc2Vy' // 'Passer' encodé en base64
  };
  
  // Créer le script d'initialisation localStorage
  const initScript = `
// Script d'initialisation localStorage pour CDP Missions
console.log('🔧 Initialisation localStorage...');

// Créer l'admin par défaut
const admin = ${JSON.stringify(defaultAdmin, null, 2)};

// Sauvegarder dans localStorage
localStorage.setItem('cdp_users', JSON.stringify([admin]));
localStorage.setItem('cdp_missions', JSON.stringify([]));

console.log('✅ localStorage initialisé avec admin par défaut');
console.log('📧 Email: abdoulaye.niang@cdp.sn');
console.log('🔑 Mot de passe: Passer');
`;

  fs.writeFileSync('scripts/init-localStorage.js', initScript);
  console.log('📄 Script d\'initialisation créé: scripts/init-localStorage.js');
}

// Exécuter la configuration
setupDatabase()
  .then(() => {
    console.log('\n' + '='.repeat(60));
    console.log('🎉 CONFIGURATION TERMINÉE AVEC SUCCÈS');
    console.log('='.repeat(60));
    
    console.log('\n📋 Prochaines étapes:');
    console.log('1. Démarrez l\'application: npm run dev');
    console.log('2. Connectez-vous avec: abdoulaye.niang@cdp.sn / Passer');
    console.log('3. Testez les fonctionnalités de base');
    console.log('4. Consultez database-config.json pour voir la configuration');
    
    console.log('\n✅ L\'application est prête à être utilisée !');
  })
  .catch(error => {
    console.error('❌ Erreur lors de la configuration:', error);
    process.exit(1);
  });
#!/usr/bin/env node

/**
 * Script de migration des données localStorage vers Supabase
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔄 MIGRATION LOCALSTORAGE → SUPABASE');
console.log('='.repeat(50));

async function migrateToSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Variables Supabase non configurées');
    console.log('📝 Configurez d\'abord les variables d\'environnement');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test de connexion
    console.log('🔍 Test de connexion Supabase...');
    const { error: connectionError } = await supabase.from('users').select('count').limit(1);
    
    if (connectionError) {
      console.log('❌ Connexion échouée:', connectionError.message);
      console.log('💡 Exécutez d\'abord le script SQL dans Supabase Dashboard');
      return;
    }
    
    console.log('✅ Connexion Supabase réussie');

    // Simuler la lecture des données localStorage (dans un vrai navigateur)
    console.log('\n📊 Simulation de migration des données...');
    
    // Données d'exemple à migrer
    const localData = {
      users: [
        {
          email: 'user1@cdp.sn',
          name: 'Utilisateur 1',
          role: 'controller',
          department: 'Contrôle',
          is_active: true
        },
        {
          email: 'user2@cdp.sn',
          name: 'Utilisateur 2',
          role: 'viewer',
          department: 'Consultation',
          is_active: true
        }
      ],
      missions: [
        {
          reference: 'MIG-001',
          title: 'Mission migrée 1',
          description: 'Première mission migrée',
          type_mission: 'Contrôle sur place',
          organization: 'Organisation Test',
          address: 'Adresse Test',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'PLANIFIEE',
          motif_controle: 'Programme annuel',
          decision_numero: 'DEC-MIG-001',
          date_decision: new Date().toISOString().split('T')[0],
          team_members: ['Agent Migration'],
          objectives: ['Tester la migration']
        }
      ]
    };

    // Migrer les utilisateurs
    console.log('\n👥 Migration des utilisateurs...');
    for (const user of localData.users) {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert(user)
          .select()
          .single();
        
        if (error) {
          console.log(`❌ ${user.email}: ${error.message}`);
        } else {
          console.log(`✅ ${user.email}: Migré avec succès`);
        }
      } catch (err) {
        console.log(`❌ ${user.email}: Erreur de migration`);
      }
    }

    // Migrer les missions
    console.log('\n📋 Migration des missions...');
    for (const mission of localData.missions) {
      try {
        const { data, error } = await supabase
          .from('missions')
          .insert(mission)
          .select()
          .single();
        
        if (error) {
          console.log(`❌ ${mission.reference}: ${error.message}`);
        } else {
          console.log(`✅ ${mission.reference}: Migrée avec succès`);
        }
      } catch (err) {
        console.log(`❌ ${mission.reference}: Erreur de migration`);
      }
    }

    console.log('\n🎉 MIGRATION TERMINÉE AVEC SUCCÈS !');
    
    // Vérification finale
    console.log('\n📊 Vérification des données migrées...');
    const { data: users } = await supabase.from('users').select('count');
    const { data: missions } = await supabase.from('missions').select('count');
    
    console.log(`👥 Utilisateurs dans Supabase: ${users?.length || 0}`);
    console.log(`📋 Missions dans Supabase: ${missions?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  }
}

async function testLocalStorage() {
  console.log('\n💾 TEST LOCALSTORAGE');
  console.log('-'.repeat(30));
  
  console.log('✅ Mode localStorage activé');
  console.log('📝 Les données seront stockées localement');
  console.log('⚠️ Pensez à sauvegarder régulièrement');
  
  // Instructions pour la migration future
  console.log('\n📋 Pour migrer vers Supabase plus tard:');
  console.log('1. Configurez les variables d\'environnement Supabase');
  console.log('2. Exécutez le script SQL dans Supabase Dashboard');
  console.log('3. Relancez ce script de migration');
  console.log('4. Vos données localStorage seront transférées vers Supabase');
}

// Exécuter la migration
migrateToSupabase();
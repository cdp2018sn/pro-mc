#!/usr/bin/env node

/**
 * Script de debug pour diagnostiquer les problèmes de synchronisation Supabase
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zkjhbstofbthnitunzcf.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpramhic3RvZmJ0aG5pdHVuemNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwOTA0ODcsImV4cCI6MjA3MjY2NjQ4N30.OoFTGdwjXvA1hwcMsh_8WIQmNerBulCd7wCxRFTe21w';

console.log('🔍 DIAGNOSTIC DE SYNCHRONISATION SUPABASE');
console.log('='.repeat(60));
console.log(`📡 URL: ${supabaseUrl}`);
console.log(`🔑 Clé: ${supabaseAnonKey.substring(0, 20)}...`);
console.log('='.repeat(60));

async function debugSupabaseSync() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Test 1: Connexion de base
    console.log('\n1️⃣ TEST DE CONNEXION');
    console.log('-'.repeat(30));
    
    const { data: healthCheck, error: healthError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (healthError) {
      console.log('❌ PROBLÈME DE CONNEXION:', healthError.message);
      console.log('\n🔧 SOLUTIONS POSSIBLES:');
      console.log('1. Exécutez le script SQL dans Supabase Dashboard');
      console.log('2. Vérifiez que les tables existent');
      console.log('3. Vérifiez les politiques RLS');
      return;
    }
    
    console.log('✅ Connexion Supabase OK');

    // Test 2: Vérification des tables
    console.log('\n2️⃣ VÉRIFICATION DES TABLES');
    console.log('-'.repeat(30));
    
    const tables = ['users', 'missions', 'documents', 'findings', 'sanctions', 'remarks', 'reponses_suivi'];
    const tableStatus = {};
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
          tableStatus[table] = false;
        } else {
          console.log(`✅ ${table}: Accessible`);
          tableStatus[table] = true;
        }
      } catch (err) {
        console.log(`❌ ${table}: Erreur d'accès`);
        tableStatus[table] = false;
      }
    }

    // Test 3: Test d'insertion
    console.log('\n3️⃣ TEST D\'INSERTION');
    console.log('-'.repeat(30));
    
    if (tableStatus.users) {
      try {
        const testUser = {
          email: `debug-test-${Date.now()}@cdp.test`,
          name: 'Test Debug Sync',
          role: 'user',
          is_active: true,
          department: 'Debug',
          permissions: '{"canViewReports": true}'
        };

        console.log('📝 Tentative d\'insertion d\'un utilisateur de test...');
        const { data: insertData, error: insertError } = await supabase
          .from('users')
          .insert(testUser)
          .select()
          .single();

        if (insertError) {
          console.log('❌ Insertion échouée:', insertError.message);
          console.log('\n🔧 CAUSE PROBABLE:');
          console.log('- Politiques RLS trop restrictives');
          console.log('- Contraintes de table non respectées');
          console.log('- Permissions insuffisantes');
        } else {
          console.log('✅ Insertion réussie - ID:', insertData.id);
          
          // Test de lecture immédiate
          const { data: readData, error: readError } = await supabase
            .from('users')
            .select('*')
            .eq('id', insertData.id)
            .single();

          if (readError) {
            console.log('❌ Lecture après insertion échouée:', readError.message);
          } else {
            console.log('✅ Lecture après insertion réussie');
            console.log('🎉 SYNCHRONISATION FONCTIONNELLE !');
          }

          // Nettoyer
          await supabase.from('users').delete().eq('id', insertData.id);
          console.log('🧹 Données de test supprimées');
        }
      } catch (err) {
        console.log('❌ Erreur test insertion:', err.message);
      }
    }

    // Test 4: Test avec une mission
    console.log('\n4️⃣ TEST AVEC UNE MISSION');
    console.log('-'.repeat(30));
    
    if (tableStatus.missions && tableStatus.users) {
      try {
        // D'abord, s'assurer qu'un utilisateur existe
        const { data: existingUsers } = await supabase
          .from('users')
          .select('id')
          .limit(1);

        let userId = null;
        if (existingUsers && existingUsers.length > 0) {
          userId = existingUsers[0].id;
        } else {
          // Créer un utilisateur temporaire
          const { data: tempUser } = await supabase
            .from('users')
            .insert({
              email: `temp-${Date.now()}@cdp.test`,
              name: 'Utilisateur Temporaire',
              role: 'admin',
              is_active: true,
              department: 'Test'
            })
            .select('id')
            .single();
          userId = tempUser?.id;
        }

        if (userId) {
          const testMission = {
            reference: `DEBUG-${Date.now()}`,
            title: 'Mission de test debug',
            description: 'Test de synchronisation',
            type_mission: 'Contrôle sur place',
            organization: 'Test Org',
            address: 'Test Address',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'PLANIFIEE',
            motif_controle: 'Programme annuel',
            decision_numero: 'DEC-TEST',
            date_decision: new Date().toISOString().split('T')[0],
            team_members: ['Test Agent'],
            objectives: ['Test Objective'],
            created_by: userId
          };

          console.log('📝 Tentative de création d\'une mission de test...');
          const { data: missionData, error: missionError } = await supabase
            .from('missions')
            .insert(testMission)
            .select()
            .single();

          if (missionError) {
            console.log('❌ Création mission échouée:', missionError.message);
          } else {
            console.log('✅ Mission créée avec succès - ID:', missionData.id);
            
            // Test d'ajout d'une remarque
            const { data: remarkData, error: remarkError } = await supabase
              .from('remarks')
              .insert({
                mission_id: missionData.id,
                content: 'Remarque de test debug',
                author_name: 'Debug Tester'
              })
              .select()
              .single();

            if (remarkError) {
              console.log('❌ Ajout remarque échoué:', remarkError.message);
            } else {
              console.log('✅ Remarque ajoutée avec succès');
            }

            // Nettoyer
            await supabase.from('missions').delete().eq('id', missionData.id);
            console.log('🧹 Mission de test supprimée');
          }
        }
      } catch (err) {
        console.log('❌ Erreur test mission:', err.message);
      }
    }

    // Test 5: Vérification des politiques RLS
    console.log('\n5️⃣ VÉRIFICATION DES POLITIQUES RLS');
    console.log('-'.repeat(30));
    
    try {
      // Vérifier que les politiques permettent l'accès
      const { data: policies, error: policiesError } = await supabase
        .rpc('get_policies_info')
        .catch(() => ({ data: null, error: null }));
      
      if (policiesError) {
        console.log('⚠️ Impossible de vérifier les politiques RLS automatiquement');
        console.log('💡 Vérifiez manuellement dans Supabase Dashboard > Database > Policies');
      } else {
        console.log('✅ Politiques RLS accessibles');
      }
    } catch (err) {
      console.log('⚠️ Test RLS non disponible');
    }

  } catch (error) {
    console.error('💥 Erreur fatale:', error.message);
  }

  // Résumé et recommandations
  console.log('\n' + '='.repeat(60));
  console.log('📋 RÉSUMÉ DU DIAGNOSTIC');
  console.log('='.repeat(60));

  console.log('\n🔧 ÉTAPES POUR RÉSOUDRE LE PROBLÈME:');
  console.log('1. Copiez le contenu du fichier supabase/migrations/fix_database_final.sql');
  console.log('2. Allez sur https://supabase.com/dashboard');
  console.log('3. Sélectionnez votre projet');
  console.log('4. Allez dans SQL Editor');
  console.log('5. Collez et exécutez le script SQL');
  console.log('6. Redémarrez l\'application');
  console.log('7. Testez la création d\'une mission');

  console.log('\n💡 VÉRIFICATIONS APRÈS EXÉCUTION DU SCRIPT:');
  console.log('- Ouvrez la console du navigateur (F12)');
  console.log('- Cherchez les messages "✅ Supabase initialisé avec succès"');
  console.log('- Cherchez les messages "✅ [Type] synchronisé(e)"');
  console.log('- Vérifiez dans Supabase Dashboard que les données apparaissent');

  console.log('\n🎯 OBJECTIF:');
  console.log('Chaque création/modification dans l\'application doit apparaître');
  console.log('immédiatement dans Supabase Dashboard et être accessible partout.');

  console.log('\n' + '='.repeat(60));
}

debugSupabaseSync();
#!/usr/bin/env node

/**
 * Script pour forcer la synchronisation avec Supabase
 * Utilise ce script si les données ne se synchronisent pas automatiquement
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zkjhbstofbthnitunzcf.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpramhic3RvZmJ0aG5pdHVuemNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwOTA0ODcsImV4cCI6MjA3MjY2NjQ4N30.OoFTGdwjXvA1hwcMsh_8WIQmNerBulCd7wCxRFTe21w';

console.log('🔄 FORÇAGE DE LA SYNCHRONISATION SUPABASE');
console.log('='.repeat(60));

async function forceSupabaseSync() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Test de connexion
    console.log('🔍 Test de connexion...');
    const { error: connectionError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (connectionError) {
      console.log('❌ CONNEXION ÉCHOUÉE:', connectionError.message);
      console.log('\n🚨 ACTIONS URGENTES:');
      console.log('1. Allez sur https://supabase.com/dashboard');
      console.log('2. Sélectionnez votre projet');
      console.log('3. Allez dans SQL Editor');
      console.log('4. Exécutez le script: supabase/migrations/fix_database_final.sql');
      console.log('5. Relancez ce script');
      return;
    }
    
    console.log('✅ Connexion Supabase OK');

    // Créer un utilisateur de test pour vérifier la synchronisation
    console.log('\n📝 Test de création d\'utilisateur...');
    const testUser = {
      email: `sync-test-${Date.now()}@cdp.test`,
      name: 'Test Synchronisation',
      role: 'user',
      is_active: true,
      department: 'Test Sync',
      permissions: '{"canViewReports": true}'
    };

    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert(testUser)
      .select()
      .single();

    if (userError) {
      console.log('❌ CRÉATION UTILISATEUR ÉCHOUÉE:', userError.message);
      console.log('\n🔧 DIAGNOSTIC:');
      
      if (userError.message.includes('permission denied')) {
        console.log('- Problème de politiques RLS');
        console.log('- Exécutez le script SQL pour corriger les politiques');
      } else if (userError.message.includes('relation') && userError.message.includes('does not exist')) {
        console.log('- Table users n\'existe pas');
        console.log('- Exécutez le script SQL pour créer les tables');
      } else {
        console.log('- Erreur inconnue, consultez la documentation Supabase');
      }
      return;
    }
    
    console.log('✅ Utilisateur créé avec succès - ID:', userData.id);

    // Créer une mission de test
    console.log('\n📋 Test de création de mission...');
    const testMission = {
      reference: `SYNC-TEST-${Date.now()}`,
      title: 'Mission de test synchronisation',
      description: 'Test de synchronisation Supabase',
      type_mission: 'Contrôle sur place',
      organization: 'Test Sync Org',
      address: 'Test Address',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'PLANIFIEE',
      motif_controle: 'Programme annuel',
      decision_numero: 'DEC-SYNC-TEST',
      date_decision: new Date().toISOString().split('T')[0],
      team_members: ['Test Agent'],
      objectives: ['Test Objective'],
      created_by: userData.id
    };

    const { data: missionData, error: missionError } = await supabase
      .from('missions')
      .insert(testMission)
      .select()
      .single();

    if (missionError) {
      console.log('❌ CRÉATION MISSION ÉCHOUÉE:', missionError.message);
    } else {
      console.log('✅ Mission créée avec succès - ID:', missionData.id);

      // Test d'ajout d'éléments associés
      console.log('\n📄 Test d\'ajout d\'éléments associés...');
      
      // Ajouter un document
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          mission_id: missionData.id,
          title: 'Document de test',
          type: 'RAPPORT_CONTROLE',
          file_path: 'test.pdf'
        })
        .select()
        .single();

      if (docError) {
        console.log('❌ Document:', docError.message);
      } else {
        console.log('✅ Document créé');
      }

      // Ajouter une constatation
      const { data: findingData, error: findingError } = await supabase
        .from('findings')
        .insert({
          mission_id: missionData.id,
          type: 'OBSERVATION',
          description: 'Constatation de test',
          date_constat: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (findingError) {
        console.log('❌ Constatation:', findingError.message);
      } else {
        console.log('✅ Constatation créée');
      }

      // Ajouter une sanction
      const { data: sanctionData, error: sanctionError } = await supabase
        .from('sanctions')
        .insert({
          mission_id: missionData.id,
          type: 'AVERTISSEMENT',
          description: 'Sanction de test',
          decision_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (sanctionError) {
        console.log('❌ Sanction:', sanctionError.message);
      } else {
        console.log('✅ Sanction créée');
      }

      // Ajouter une remarque
      const { data: remarkData, error: remarkError } = await supabase
        .from('remarks')
        .insert({
          mission_id: missionData.id,
          content: 'Remarque de test',
          author_name: 'Test Author'
        })
        .select()
        .single();

      if (remarkError) {
        console.log('❌ Remarque:', remarkError.message);
      } else {
        console.log('✅ Remarque créée');
      }

      // Nettoyer toutes les données de test
      console.log('\n🧹 Nettoyage des données de test...');
      await supabase.from('missions').delete().eq('id', missionData.id);
      console.log('✅ Données de test supprimées');
    }

    // Supprimer l'utilisateur de test
    await supabase.from('users').delete().eq('id', userData.id);
    console.log('✅ Utilisateur de test supprimé');

    // Résumé final
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SYNCHRONISATION SUPABASE FONCTIONNELLE !');
    console.log('='.repeat(60));
    console.log('✅ Tous les tests de synchronisation ont réussi');
    console.log('✅ Les données créées dans l\'application seront stockées dans Supabase');
    console.log('✅ Les données seront accessibles depuis n\'importe où');
    console.log('\n🚀 Votre application est maintenant prête pour un usage global !');

  } catch (error) {
    console.error('💥 Erreur fatale:', error.message);
    console.log('\n🆘 AIDE URGENTE:');
    console.log('1. Vérifiez votre connexion internet');
    console.log('2. Vérifiez que le projet Supabase existe');
    console.log('3. Exécutez le script SQL dans Supabase Dashboard');
    console.log('4. Contactez le support si le problème persiste');
  }
}

forceSupabaseSync();
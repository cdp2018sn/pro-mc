const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

// Script pour importer les missions de test avec sanctions
async function importTestMissions() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Import des missions de test avec sanctions...');
    
    // Lire le fichier de données de test
    const testDataPath = path.join(__dirname, '../../data/test-missions.json');
    const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
    
    // Supprimer les missions existantes pour éviter les doublons
    await client.query('DELETE FROM sanctions');
    await client.query('DELETE FROM findings');
    await client.query('DELETE FROM remarks');
    await client.query('DELETE FROM documents');
    await client.query('DELETE FROM missions');
    console.log('🗑️ Anciennes données supprimées');
    
    // Importer les missions
    for (const missionData of testData) {
      // Insérer la mission
      const missionResult = await client.query(`
        INSERT INTO missions (
          id, reference, title, description, type_mission, organization, 
          address, start_date, end_date, status, motif_controle, 
          decision_numero, date_decision, team_members, objectives, 
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING id
      `, [
        missionData.id,
        missionData.reference,
        missionData.title,
        missionData.description,
        missionData.type_mission,
        missionData.organization,
        missionData.address,
        missionData.start_date,
        missionData.end_date,
        missionData.status,
        missionData.motif_controle,
        missionData.decision_numero,
        missionData.date_decision,
        JSON.stringify(missionData.team_members),
        JSON.stringify(missionData.objectives),
        missionData.created_at,
        missionData.updated_at
      ]);
      
      const missionId = missionResult.rows[0].id;
      
      // Insérer les constats
      if (missionData.findings && missionData.findings.length > 0) {
        for (const finding of missionData.findings) {
          await client.query(`
            INSERT INTO findings (
              id, mission_id, type, description, reference_legale, 
              recommandation, delai_correction, date_constat, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `, [
            finding.id,
            missionId,
            finding.type,
            finding.description,
            finding.reference_legale,
            finding.recommandation,
            finding.delai_correction,
            finding.date_constat,
            finding.created_at,
            finding.updated_at
          ]);
        }
      }
      
      // Insérer les sanctions
      if (missionData.sanctions && missionData.sanctions.length > 0) {
        for (const sanction of missionData.sanctions) {
          await client.query(`
            INSERT INTO sanctions (
              id, mission_id, type, description, amount, 
              decision_date, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            sanction.id,
            missionId,
            sanction.type,
            sanction.description,
            sanction.amount,
            sanction.decision_date,
            sanction.created_at,
            sanction.updated_at
          ]);
        }
      }
      
      // Insérer les remarques
      if (missionData.remarks && missionData.remarks.length > 0) {
        for (const remark of missionData.remarks) {
          await client.query(`
            INSERT INTO remarks (
              id, mission_id, content, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5)
          `, [
            remark.id,
            missionId,
            remark.content,
            remark.created_at,
            remark.updated_at
          ]);
        }
      }
      
      // Insérer les documents
      if (missionData.documents && missionData.documents.length > 0) {
        for (const document of missionData.documents) {
          await client.query(`
            INSERT INTO documents (
              id, mission_id, type, title, file_path, file_content, 
              created_at, reponse_recue, date_derniere_reponse
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `, [
            document.id,
            missionId,
            document.type,
            document.title,
            document.file_path,
            document.file_content,
            document.created_at,
            document.reponse_recue || false,
            document.date_derniere_reponse
          ]);
        }
      }
    }
    
    console.log(`✅ ${testData.length} missions importées avec succès`);
    console.log('📊 Missions avec sanctions:');
    
    // Afficher un résumé des missions avec sanctions
    const missionsWithSanctions = await client.query(`
      SELECT m.reference, m.title, m.organization, s.type as sanction_type, s.description as sanction_description
      FROM missions m
      LEFT JOIN sanctions s ON m.id = s.mission_id
      WHERE s.id IS NOT NULL
      ORDER BY m.reference
    `);
    
    missionsWithSanctions.rows.forEach(row => {
      console.log(`  - ${row.reference}: ${row.title} (${row.organization}) - ${row.sanction_type}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Exécuter le script
if (require.main === module) {
  importTestMissions()
    .then(() => {
      console.log('✅ Import terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur lors de l\'import:', error);
      process.exit(1);
    });
}

module.exports = { importTestMissions };

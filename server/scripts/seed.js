const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

// Script pour insérer les données initiales
async function seed() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Début du seeding PostgreSQL...');
    
    // Vérifier si l'admin existe déjà
    const adminCheck = await client.query('SELECT id FROM users WHERE id = $1', ['admin-1']);
    
    if (adminCheck.rows.length === 0) {
      // Créer l'administrateur par défaut
      const hashedPassword = await bcrypt.hash('Passer', 10);
      
      await client.query(`
        INSERT INTO users (id, email, name, role, is_active, department, phone, password_hash, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        'admin-1',
        'abdoulaye.niang@cdp.sn',
        'Abdoulaye Niang',
        'admin',
        true,
        'Direction',
        '',
        hashedPassword,
        new Date()
      ]);
      console.log('✅ Administrateur par défaut créé');
    } else {
      console.log('ℹ️ Administrateur existe déjà');
    }

    // Vérifier si les missions de test existent
    const missionCheck = await client.query('SELECT id FROM missions WHERE id = $1', ['mission-1']);
    
    if (missionCheck.rows.length === 0) {
      // Créer des missions de test
      const missions = [
        {
          id: 'mission-1',
          title: 'Audit Financier Q1 2024',
          description: 'Audit financier du premier trimestre 2024',
          status: 'in_progress',
          priority: 'high',
          created_by: 'admin-1',
          start_date: '2024-01-01',
          end_date: '2024-03-31',
          location: 'Siège social',
          budget: 50000.00
        },
        {
          id: 'mission-2',
          title: 'Contrôle Qualité Produits',
          description: 'Contrôle qualité des produits manufacturés',
          status: 'pending',
          priority: 'medium',
          created_by: 'admin-1',
          start_date: '2024-02-01',
          end_date: '2024-04-30',
          location: 'Usine principale',
          budget: 30000.00
        },
        {
          id: 'mission-3',
          title: 'Audit Sécurité IT',
          description: 'Audit de sécurité informatique',
          status: 'completed',
          priority: 'high',
          created_by: 'admin-1',
          start_date: '2024-01-15',
          end_date: '2024-02-15',
          location: 'Centre informatique',
          budget: 25000.00
        }
      ];

      for (const mission of missions) {
        await client.query(`
          INSERT INTO missions (id, title, description, status, priority, created_by, start_date, end_date, location, budget, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          mission.id,
          mission.title,
          mission.description,
          mission.status,
          mission.priority,
          mission.created_by,
          mission.start_date,
          mission.end_date,
          mission.location,
          mission.budget,
          new Date()
        ]);
      }
      console.log('✅ Missions de test créées');

      // Créer des constatations de test
      const findings = [
        {
          id: 'finding-1',
          mission_id: 'mission-1',
          title: 'Irregularités comptables détectées',
          description: 'Des irrégularités ont été détectées dans la comptabilité du Q1',
          severity: 'high',
          status: 'open',
          created_by: 'admin-1'
        },
        {
          id: 'finding-2',
          mission_id: 'mission-2',
          title: 'Non-conformité qualité',
          description: 'Certains produits ne respectent pas les standards de qualité',
          severity: 'medium',
          status: 'open',
          created_by: 'admin-1'
        }
      ];

      for (const finding of findings) {
        await client.query(`
          INSERT INTO findings (id, mission_id, title, description, severity, status, created_by, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          finding.id,
          finding.mission_id,
          finding.title,
          finding.description,
          finding.severity,
          finding.status,
          finding.created_by,
          new Date()
        ]);
      }
      console.log('✅ Constatations de test créées');

      // Créer des remarques de test
      const remarks = [
        {
          id: 'remark-1',
          mission_id: 'mission-1',
          content: 'Audit en cours - résultats préliminaires encourageants',
          created_by: 'admin-1'
        },
        {
          id: 'remark-2',
          mission_id: 'mission-2',
          content: 'Nécessite une attention particulière sur les contrôles qualité',
          created_by: 'admin-1'
        }
      ];

      for (const remark of remarks) {
        await client.query(`
          INSERT INTO remarks (id, mission_id, content, created_by, created_at)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          remark.id,
          remark.mission_id,
          remark.content,
          remark.created_by,
          new Date()
        ]);
      }
      console.log('✅ Remarques de test créées');

    } else {
      console.log('ℹ️ Données de test existent déjà');
    }

    console.log('🎉 Seeding PostgreSQL terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Exécuter le seeding si le script est appelé directement
if (require.main === module) {
  seed()
    .then(() => {
      console.log('✅ Seeding terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur de seeding:', error);
      process.exit(1);
    });
}

module.exports = { seed };

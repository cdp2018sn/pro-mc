import { executeQuery } from '../database/db';

// Fonction pour générer une référence unique
const generateReference = () => {
  const prefix = 'MIS';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Fonction pour insérer une mission complète avec ses détails
async function insertMissionWithDetails(mission: any) {
  try {
    // 1. Insérer la mission
    const missionQuery = `
      INSERT INTO missions (
        reference, title, description, status, priority,
        start_date, end_date, assigned_to, created_by,
        organization, address, team_members
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const result = await executeQuery(missionQuery, [
      mission.reference,
      mission.title,
      mission.description,
      mission.status,
      mission.priority,
      mission.start_date,
      mission.end_date,
      mission.assigned_to,
      mission.created_by,
      mission.organization,
      mission.address,
      JSON.stringify(mission.team_members)
    ]);

    const missionId = result.lastID;

    // 2. Insérer les remarques
    if (mission.remarks && mission.remarks.length > 0) {
      for (const remark of mission.remarks) {
        await executeQuery(
          'INSERT INTO comments (mission_id, user_email, content) VALUES (?, ?, ?)',
          [missionId, mission.assigned_to, remark]
        );
      }
    }

    // 3. Insérer les constats
    if (mission.findings && mission.findings.length > 0) {
      for (const finding of mission.findings) {
        await executeQuery(
          'INSERT INTO findings (mission_id, description, severity) VALUES (?, ?, ?)',
          [missionId, finding.description, finding.severity]
        );
      }
    }

    console.log(`Mission "${mission.title}" insérée avec succès`);
  } catch (error) {
    console.error('Erreur lors de l\'insertion de la mission:', error);
    throw error;
  }
}

// Liste des missions d'exemple
const sampleMissions = [
  {
    reference: generateReference(),
    title: "Audit RGPD - Orange Sénégal",
    description: "Contrôle de conformité au RGPD des traitements de données personnelles et des mesures de sécurité mises en place.",
    status: "EN_COURS",
    priority: "Haute",
    start_date: new Date(2024, 3, 1).toISOString(),
    end_date: new Date(2024, 3, 15).toISOString(),
    assigned_to: "user1@example.com",
    created_by: "admin@example.com",
    organization: "Orange Sénégal",
    address: "Dakar, Sénégal",
    team_members: ["user1@example.com", "user2@example.com"],
    remarks: [
      "Accès aux locaux sécurisé et conforme",
      "Documentation des traitements à mettre à jour",
      "Formation du personnel à planifier"
    ],
    findings: [
      {
        description: "Registre des traitements incomplet",
        severity: "MOYENNE"
      },
      {
        description: "Absence de chiffrement des données sensibles",
        severity: "HAUTE"
      }
    ]
  },
  {
    reference: generateReference(),
    title: "Contrôle Sécurité - Banque Atlantique",
    description: "Évaluation des dispositifs de sécurité physique et logique des agences bancaires.",
    status: "PLANIFIEE",
    priority: "Haute",
    start_date: new Date(2024, 3, 20).toISOString(),
    end_date: new Date(2024, 4, 5).toISOString(),
    assigned_to: "user2@example.com",
    created_by: "admin@example.com",
    organization: "Banque Atlantique",
    address: "Abidjan, Côte d'Ivoire",
    team_members: ["user2@example.com", "user3@example.com"],
    remarks: [
      "Prévoir une réunion avec le responsable sécurité",
      "Vérifier les certificats SSL"
    ],
    findings: []
  },
  {
    reference: generateReference(),
    title: "Audit Conformité - MTN Cameroun",
    description: "Vérification de la conformité des processus de gestion des données clients et des obligations réglementaires.",
    status: "TERMINEE",
    priority: "Moyenne",
    start_date: new Date(2024, 2, 1).toISOString(),
    end_date: new Date(2024, 2, 15).toISOString(),
    assigned_to: "user3@example.com",
    created_by: "admin@example.com",
    organization: "MTN Cameroun",
    address: "Douala, Cameroun",
    team_members: ["user3@example.com"],
    remarks: [
      "Bonne coopération de l'équipe",
      "Documentation bien organisée"
    ],
    findings: [
      {
        description: "Processus de sauvegarde non formalisé",
        severity: "BASSE"
      }
    ]
  },
  {
    reference: generateReference(),
    title: "Contrôle Infrastructure - Société Générale Mali",
    description: "Audit de l'infrastructure IT et évaluation des mesures de continuité d'activité.",
    status: "PLANIFIEE",
    priority: "Haute",
    start_date: new Date(2024, 4, 1).toISOString(),
    end_date: new Date(2024, 4, 15).toISOString(),
    assigned_to: "user1@example.com",
    created_by: "admin@example.com",
    organization: "Société Générale Mali",
    address: "Bamako, Mali",
    team_members: ["user1@example.com", "user3@example.com"],
    remarks: [],
    findings: []
  }
];

// Fonction principale pour insérer toutes les missions
async function insertSampleMissions() {
  try {
    console.log('Début de l\'insertion des missions...');
    
    // Créer la table des constats si elle n'existe pas
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS findings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mission_id INTEGER REFERENCES missions(id),
        description TEXT NOT NULL,
        severity TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insérer chaque mission
    for (const mission of sampleMissions) {
      await insertMissionWithDetails(mission);
    }

    console.log('Toutes les missions ont été insérées avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'insertion des missions:', error);
  }
}

// Exécuter le script
insertSampleMissions(); 
import { getDatabase } from '../database/db';
import path from 'path';
import fs from 'fs';

// Fonction pour générer une référence unique
const generateReference = () => {
  const prefix = 'CTL';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Fonction pour générer une date aléatoire dans les 30 derniers jours
const getRandomDate = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Liste des missions de contrôle d'exemple
const sampleControlMissions = [
  {
    reference: generateReference(),
    title: "Contrôle RGPD - Banque Atlantique",
    description: "Contrôle de conformité au RGPD des traitements de données personnelles des clients",
    status: "PLANIFIEE",
    priority: "HAUTE",
    start_date: getRandomDate(),
    end_date: getRandomDate(),
    assigned_to: "inspecteur1@cdp.sn",
    created_by: "admin@cdp.sn",
    organization: "Banque Atlantique Sénégal",
    address: "Dakar Plateau, Avenue Léopold Sédar Senghor",
    team_members: JSON.stringify(["Inspecteur Principal", "Inspecteur Assistant", "Expert Technique"]),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    reference: generateReference(),
    title: "Audit Protection des Données - SONATEL",
    description: "Audit complet des mesures de protection des données personnelles",
    status: "PLANIFIEE", 
    priority: "HAUTE",
    start_date: getRandomDate(),
    end_date: getRandomDate(),
    assigned_to: "inspecteur2@cdp.sn",
    created_by: "admin@cdp.sn",
    organization: "SONATEL",
    address: "Route des Almadies, Dakar",
    team_members: JSON.stringify(["Chef de Mission", "Expert Technique", "Juriste"]),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    reference: generateReference(),
    title: "Contrôle Données Santé - Hôpital Principal",
    description: "Contrôle du traitement des données de santé des patients",
    status: "PLANIFIEE",
    priority: "HAUTE",
    start_date: getRandomDate(),
    end_date: getRandomDate(),
    assigned_to: "inspecteur3@cdp.sn",
    created_by: "admin@cdp.sn",
    organization: "Hôpital Principal de Dakar",
    address: "Avenue Nelson Mandela, Dakar",
    team_members: JSON.stringify(["Expert Médical", "Inspecteur Principal", "Expert Technique"]),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Fonction pour créer les tables si elles n'existent pas
async function createTablesIfNotExist(db: any) {
  // Créer la table users
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email VARCHAR(255) UNIQUE NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Table users créée ou existante');

  // Créer la table missions
  await db.exec(`
    CREATE TABLE IF NOT EXISTS missions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference VARCHAR(50) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(50) NOT NULL,
      priority VARCHAR(50) NOT NULL,
      start_date TIMESTAMP,
      end_date TIMESTAMP,
      assigned_to VARCHAR(255) REFERENCES users(email),
      created_by VARCHAR(255) REFERENCES users(email),
      organization VARCHAR(255),
      address TEXT,
      team_members TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Table missions créée ou existante');

  // Créer la table comments
  await db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mission_id INTEGER REFERENCES missions(id),
      user_email VARCHAR(255) REFERENCES users(email),
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Table comments créée ou existante');

  // Créer la table findings
  await db.exec(`
    CREATE TABLE IF NOT EXISTS findings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mission_id INTEGER REFERENCES missions(id),
      description TEXT NOT NULL,
      severity VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Table findings créée ou existante');

  // Créer la table attachments
  await db.exec(`
    CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mission_id INTEGER REFERENCES missions(id),
      file_name VARCHAR(255) NOT NULL,
      file_path TEXT NOT NULL,
      file_type VARCHAR(100),
      uploaded_by VARCHAR(255) REFERENCES users(email),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Table attachments créée ou existante');

  // Créer les index
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
    CREATE INDEX IF NOT EXISTS idx_missions_priority ON missions(priority);
    CREATE INDEX IF NOT EXISTS idx_missions_assigned_to ON missions(assigned_to);
    CREATE INDEX IF NOT EXISTS idx_missions_organization ON missions(organization);
    CREATE INDEX IF NOT EXISTS idx_comments_mission_id ON comments(mission_id);
    CREATE INDEX IF NOT EXISTS idx_findings_mission_id ON findings(mission_id);
    CREATE INDEX IF NOT EXISTS idx_attachments_mission_id ON attachments(mission_id)
  `);
  console.log('Index créés ou existants');
}

// Fonction pour insérer les utilisateurs de base
async function insertBaseUsers(db: any) {
  const users = [
    { email: 'admin@cdp.sn', full_name: 'Administrateur CDP', role: 'ADMIN' },
    { email: 'inspecteur1@cdp.sn', full_name: 'Inspecteur Principal', role: 'CONTROLLER' },
    { email: 'inspecteur2@cdp.sn', full_name: 'Inspecteur Assistant', role: 'CONTROLLER' },
    { email: 'inspecteur3@cdp.sn', full_name: 'Expert Technique', role: 'CONTROLLER' }
  ];

  for (const user of users) {
    await db.run(`
      INSERT OR IGNORE INTO users (email, full_name, role)
      VALUES (?, ?, ?)
    `, [user.email, user.full_name, user.role]);
  }
}

// Fonction pour sauvegarder les missions dans un fichier JSON
async function saveMissionsToJson(missions: any[]) {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const filePath = path.join(dataDir, 'control-missions.json');
  fs.writeFileSync(filePath, JSON.stringify(missions, null, 2));
  console.log(`Missions sauvegardées dans ${filePath}`);
}

// Fonction principale pour insérer les missions
async function insertControlMissions() {
  try {
    // Obtenir la connexion à la base de données
    const db = await getDatabase();
    console.log('Connexion à la base de données établie');

    // Créer les tables si elles n'existent pas
    await createTablesIfNotExist(db);

    // Insérer les utilisateurs de base
    await insertBaseUsers(db);
    console.log('Utilisateurs de base insérés');

    // Sauvegarder les missions dans un fichier JSON
    await saveMissionsToJson(sampleControlMissions);

    // Insérer chaque mission dans la base de données
    for (const mission of sampleControlMissions) {
      await db.run(`
        INSERT INTO missions (
          reference, title, description, status, priority,
          start_date, end_date, assigned_to, created_by,
          organization, address, team_members,
          created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        mission.reference,
        mission.title,
        mission.description,
        mission.status,
        mission.priority,
        mission.start_date.toISOString(),
        mission.end_date.toISOString(),
        mission.assigned_to,
        mission.created_by,
        mission.organization,
        mission.address,
        mission.team_members,
        mission.created_at,
        mission.updated_at
      ]);

      console.log(`Mission ${mission.reference} insérée avec succès`);
    }

    console.log('Toutes les missions de contrôle ont été insérées avec succès');
    
    // Fermer la connexion à la base de données
    await db.close();
  } catch (error) {
    console.error('Erreur lors de l\'insertion des missions:', error);
  }
}

// Exécuter le script
insertControlMissions(); 
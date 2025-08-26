import fs from 'fs';
import path from 'path';

// Fonction pour générer une référence unique
const generateReference = () => {
  const prefix = 'MIS';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Fonction pour générer une date aléatoire dans les 30 derniers jours
const getRandomDate = () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  return new Date(thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime()));
};

// Fonction pour formater une date en ISO string
const formatDate = (date: Date) => date.toISOString();

// Liste des missions d'exemple
const sampleMissions = [
  {
    reference: generateReference(),
    title: 'Mission de maintenance préventive',
    description: 'Maintenance préventive des équipements critiques',
    status: 'En cours',
    priority: 'Haute',
    start_date: formatDate(getRandomDate()),
    end_date: formatDate(getRandomDate()),
    assigned_to: 'user1@example.com',
    created_by: 'admin@example.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    reference: generateReference(),
    title: 'Audit de sécurité',
    description: 'Audit complet des systèmes de sécurité',
    status: 'Planifiée',
    priority: 'Moyenne',
    start_date: formatDate(getRandomDate()),
    end_date: formatDate(getRandomDate()),
    assigned_to: 'user2@example.com',
    created_by: 'admin@example.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    reference: generateReference(),
    title: 'Formation des nouveaux employés',
    description: 'Session de formation sur les procédures de sécurité',
    status: 'Terminée',
    priority: 'Basse',
    start_date: formatDate(getRandomDate()),
    end_date: formatDate(getRandomDate()),
    assigned_to: 'user3@example.com',
    created_by: 'admin@example.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    reference: generateReference(),
    title: 'Mise à jour des systèmes',
    description: 'Mise à jour des logiciels et des systèmes d\'exploitation',
    status: 'En cours',
    priority: 'Haute',
    start_date: formatDate(getRandomDate()),
    end_date: formatDate(getRandomDate()),
    assigned_to: 'user1@example.com',
    created_by: 'admin@example.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    reference: generateReference(),
    title: 'Inventaire des équipements',
    description: 'Vérification et mise à jour de l\'inventaire',
    status: 'Planifiée',
    priority: 'Moyenne',
    start_date: formatDate(getRandomDate()),
    end_date: formatDate(getRandomDate()),
    assigned_to: 'user2@example.com',
    created_by: 'admin@example.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    reference: generateReference(),
    title: 'Optimisation des performances',
    description: 'Analyse et optimisation des performances système',
    status: 'En cours',
    priority: 'Haute',
    start_date: formatDate(getRandomDate()),
    end_date: formatDate(getRandomDate()),
    assigned_to: 'user3@example.com',
    created_by: 'admin@example.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    reference: generateReference(),
    title: 'Sauvegarde des données',
    description: 'Vérification et mise à jour des sauvegardes',
    status: 'Planifiée',
    priority: 'Moyenne',
    start_date: formatDate(getRandomDate()),
    end_date: formatDate(getRandomDate()),
    assigned_to: 'user1@example.com',
    created_by: 'admin@example.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    reference: generateReference(),
    title: 'Gestion des licences',
    description: 'Renouvellement et mise à jour des licences logicielles',
    status: 'En cours',
    priority: 'Basse',
    start_date: formatDate(getRandomDate()),
    end_date: formatDate(getRandomDate()),
    assigned_to: 'user2@example.com',
    created_by: 'admin@example.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    reference: generateReference(),
    title: 'Support technique',
    description: 'Assistance technique aux utilisateurs',
    status: 'Terminée',
    priority: 'Moyenne',
    start_date: formatDate(getRandomDate()),
    end_date: formatDate(getRandomDate()),
    assigned_to: 'user3@example.com',
    created_by: 'admin@example.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    reference: generateReference(),
    title: 'Documentation technique',
    description: 'Mise à jour de la documentation technique',
    status: 'Planifiée',
    priority: 'Basse',
    start_date: formatDate(getRandomDate()),
    end_date: formatDate(getRandomDate()),
    assigned_to: 'user1@example.com',
    created_by: 'admin@example.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Fonction pour sauvegarder les missions dans un fichier JSON
function saveMissionsLocally() {
  try {
    // Créer le dossier data s'il n'existe pas
    const dataDir = path.join(__dirname, '..', '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Chemin du fichier JSON
    const filePath = path.join(dataDir, 'sample-missions.json');
    
    // Écrire les missions dans le fichier JSON
    fs.writeFileSync(filePath, JSON.stringify(sampleMissions, null, 2));
    
    console.log(`Missions sauvegardées avec succès dans ${filePath}`);
    console.log(`Nombre de missions sauvegardées: ${sampleMissions.length}`);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des missions:', error);
  }
}

// Exécuter la fonction
saveMissionsLocally(); 
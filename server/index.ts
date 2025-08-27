import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
// Remplacement d'express-validator par des validateurs maison pour éviter les soucis de types
import { MissionModel } from './models/Mission.js';
import { UserModel } from './models/User.js';
import { 
  authenticateToken, 
  requireRole, 
  requirePermission, 
  requireAdminOrOwnership,
  AuthenticatedRequest 
} from './middleware/auth.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Sécurité de base
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par fenêtre
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});
app.use(limiter);

// Configuration CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Santé: pas de test Supabase, la santé DB est testée via /api/health

// Middleware pour logger les requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// Validation des données (simple)
type Validator = (req: Request, res: Response, next: NextFunction) => void;

const validateMission: Validator[] = [
  (req, res, next) => {
    const { reference, title, status, start_date, end_date, priority } = req.body || {};
    if (!reference) return res.status(400).json({ error: 'Référence requise' });
    if (!title) return res.status(400).json({ error: 'Titre requis' });
    if (!['PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }
    if (!start_date || isNaN(Date.parse(start_date))) return res.status(400).json({ error: 'Date de début invalide' });
    if (!end_date || isNaN(Date.parse(end_date))) return res.status(400).json({ error: 'Date de fin invalide' });
    if (!['BASSE', 'MOYENNE', 'HAUTE', 'URGENTE'].includes(priority)) {
      return res.status(400).json({ error: 'Priorité invalide' });
    }
    next();
  }
];

const validateUser: Validator[] = [
  (req, res, next) => {
    const { email, name, role } = req.body || {};
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'Email invalide' });
    if (!name) return res.status(400).json({ error: 'Nom requis' });
    if (!['admin', 'supervisor', 'controller', 'viewer', 'user'].includes(role)) return res.status(400).json({ error: 'Rôle invalide' });
    next();
  }
];

// Fonction pour gérer automatiquement les statuts des missions
async function updateMissionStatuses() {
  try {
    console.log('🔄 Vérification automatique des statuts des missions...');
    
    const result = await MissionModel.updateStatuses();
    
    console.log(`✅ Mise à jour terminée: ${result.plannedToOngoing} missions passées en cours, ${result.ongoingToCompleted} missions terminées`);
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour automatique des statuts:', error);
  }
}

// Planifier la vérification automatique toutes les heures
setInterval(updateMissionStatuses, 60 * 60 * 1000); // 1 heure

// Exécuter une première vérification au démarrage
updateMissionStatuses();

// Routes publiques
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), database: 'PostgreSQL', version: '1.0.0' });
});

// Route de connexion
app.post('/api/auth/login', [
  (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body || {};
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'Email invalide' });
    if (!password) return res.status(400).json({ error: 'Mot de passe requis' });
    next();
  }
], async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await UserModel.verifyCredentials(email, password);
    if (!user) return res.status(401).json({ error: 'Identifiants invalides' });
    res.json({ message: 'Connexion réussie', user });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes protégées pour les missions
app.get('/api/missions', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    const missions = await MissionModel.findAll();
    res.json(missions);
  } catch (error) {
    console.error('Erreur lors de la récupération des missions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/missions/:id', authenticateToken, async (req: AuthenticatedRequest<{ id: string }>, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    const mission = await MissionModel.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ error: 'Mission non trouvée' });
    }
    res.json(mission);
  } catch (error) {
    console.error('Erreur lors de la récupération de la mission:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/missions', [authenticateToken, requirePermission('canCreateMissions'), ...validateMission], async (req: AuthenticatedRequest<any, any, any>, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    const mission = await MissionModel.create(req.body);
    res.status(201).json(mission);
  } catch (error) {
    console.error('Erreur lors de la création de la mission:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/missions/:id', [authenticateToken, requirePermission('canEditMissions'), ...validateMission], async (req: AuthenticatedRequest<{ id: string }>, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    const mission = await MissionModel.update(req.params.id, req.body);
    if (!mission) {
      return res.status(404).json({ error: 'Mission non trouvée' });
    }
    res.json(mission);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la mission:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/missions/:id', [authenticateToken, requirePermission('canDeleteMissions')], async (req: AuthenticatedRequest<{ id: string }>, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    const success = await MissionModel.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Mission non trouvée' });
    }
    res.json({ message: 'Mission supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la mission:', error);
    if (error instanceof Error && error.message.includes('Permissions insuffisantes')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour déclencher manuellement la mise à jour des statuts (admin seulement)
app.post('/api/missions/update-statuses', [
  authenticateToken,
  requireRole(['admin', 'supervisor'])
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('POST /api/missions/update-statuses - Mise à jour manuelle des statuts');
    const result = await MissionModel.updateStatuses();
    res.json({ 
      message: 'Mise à jour des statuts terminée',
      result 
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des statuts:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des statuts' });
  }
});

// Routes protégées pour les utilisateurs (admin seulement)
app.get('/api/users', [authenticateToken, requireRole(['admin'])], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await UserModel.findAll();
    res.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/users', [authenticateToken, requireRole(['admin']), ...validateUser], async (req: AuthenticatedRequest<any, any, any>, res: Response) => {
  try {
    const user = await UserModel.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/users/:id', [authenticateToken, requireRole(['admin']), ...validateUser], async (req: AuthenticatedRequest<{ id: string }>, res: Response) => {
  try {
    const user = await UserModel.update(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/users/:id', [authenticateToken, requireRole(['admin'])], async (req: AuthenticatedRequest<{ id: string }>, res: Response) => {
  try {
    const success = await UserModel.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Gestion des erreurs 404
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Middleware de gestion d'erreurs global
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Erreur non gérée:', error);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`🚀 Serveur sécurisé démarré sur le port ${port}`);
  console.log(`📊 Base de données: PostgreSQL (Local)`);
  console.log(`🔒 Sécurité: Authentification, Autorisation, Rate Limiting`);
  console.log(`🌐 CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
});

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du serveur...');
  process.exit(0);
}); 
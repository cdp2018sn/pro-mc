import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { supabase } from './config/supabase.js';
import { SupabaseMissionModel, SupabaseUserModel } from './models/SupabaseModels.js';
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

// Test de connexion à Supabase
const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('missions').select('count').limit(1);
    if (error) {
      console.error('❌ Erreur de connexion à Supabase:', error);
      process.exit(1);
    } else {
      console.log('✅ Connecté à Supabase avec succès');
    }
  } catch (error) {
    console.error('❌ Erreur de connexion à Supabase:', error);
    process.exit(1);
  }
};

testSupabaseConnection();

// Middleware pour logger les requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// Validation des données
const validateMission = [
  body('reference').notEmpty().withMessage('Référence requise'),
  body('title').notEmpty().withMessage('Titre requis'),
  body('status').isIn(['PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE']).withMessage('Statut invalide'),
  body('start_date').isISO8601().withMessage('Date de début invalide'),
  body('end_date').isISO8601().withMessage('Date de fin invalide'),
  body('priority').isIn(['BASSE', 'MOYENNE', 'HAUTE', 'URGENTE']).withMessage('Priorité invalide')
];

const validateUser = [
  body('email').isEmail().withMessage('Email invalide'),
  body('name').notEmpty().withMessage('Nom requis'),
  body('role').isIn(['admin', 'supervisor', 'controller', 'viewer', 'user']).withMessage('Rôle invalide')
];

// Fonction pour gérer automatiquement les statuts des missions
async function updateMissionStatuses() {
  try {
    console.log('🔄 Vérification automatique des statuts des missions...');
    
    const result = await SupabaseMissionModel.updateStatuses();
    
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
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'Supabase',
    version: '1.0.0'
  });
});

// Route de connexion
app.post('/api/auth/login', [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Authentification avec Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Récupérer les informations complètes de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError || !userData) {
      return res.status(403).json({ error: 'Utilisateur non trouvé' });
    }

    if (!userData.is_active) {
      return res.status(403).json({ error: 'Compte désactivé' });
    }

    // Mettre à jour la dernière connexion
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.user.id);

    res.json({ 
      message: 'Connexion réussie',
      user: userData,
      session: data.session
    });
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

    const missions = await SupabaseMissionModel.findAll(req.user.id, req.user.role);
    res.json(missions);
  } catch (error) {
    console.error('Erreur lors de la récupération des missions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/missions/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    const mission = await SupabaseMissionModel.findById(req.params.id, req.user.id, req.user.role);
    if (!mission) {
      return res.status(404).json({ error: 'Mission non trouvée' });
    }
    res.json(mission);
  } catch (error) {
    console.error('Erreur lors de la récupération de la mission:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/missions', [
  authenticateToken,
  requirePermission('canCreateMissions'),
  ...validateMission
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    const mission = await SupabaseMissionModel.create(req.body, req.user.id);
    res.status(201).json(mission);
  } catch (error) {
    console.error('Erreur lors de la création de la mission:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/missions/:id', [
  authenticateToken,
  requirePermission('canEditMissions'),
  ...validateMission
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    const mission = await SupabaseMissionModel.update(req.params.id, req.body, req.user.id, req.user.role);
    if (!mission) {
      return res.status(404).json({ error: 'Mission non trouvée' });
    }
    res.json(mission);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la mission:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/missions/:id', [
  authenticateToken,
  requirePermission('canDeleteMissions')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    const success = await SupabaseMissionModel.delete(req.params.id, req.user.id, req.user.role);
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
    const result = await SupabaseMissionModel.updateStatuses();
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
app.get('/api/users', [
  authenticateToken,
  requireRole(['admin'])
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await SupabaseUserModel.findAll();
    res.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/users', [
  authenticateToken,
  requireRole(['admin']),
  ...validateUser
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await SupabaseUserModel.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/users/:id', [
  authenticateToken,
  requireRole(['admin']),
  ...validateUser
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await SupabaseUserModel.update(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/users/:id', [
  authenticateToken,
  requireRole(['admin'])
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = await SupabaseUserModel.delete(req.params.id);
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
  console.log(`📊 Base de données: Supabase (Cloud)`);
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
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zkjhbstofbthnitunzcf.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpramhic3RvZmJ0aG5pdHVuemNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwOTA0ODcsImV4cCI6MjA3MjY2NjQ4N30.OoFTGdwjXvA1hwcMsh_8WIQmNerBulCd7wCxRFTe21w';

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Middleware de sécurité
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite chaque IP à 100 requêtes par windowMs
});
app.use(limiter);

// Middleware pour parser JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Route de santé
app.get('/api/health', async (req, res) => {
  try {
    // Test de connexion Supabase
    const { error } = await supabase.from('users').select('count').limit(1);
    if (error) throw error;
    
    res.json({ 
      status: 'OK', 
      database: 'Supabase',
      url: supabaseUrl,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: error.message,
      database: 'Supabase'
    });
  }
});

// Route pour obtenir les utilisateurs
app.get('/api/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour obtenir les missions
app.get('/api/missions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('missions')
      .select(`
        *,
        assigned_user:users!assigned_to(id, name, email),
        created_user:users!created_by(id, name, email)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour créer une mission
app.post('/api/missions', async (req, res) => {
  try {
    const { title, description, assigned_to, created_by, priority = 'medium' } = req.body;
    
    const { data, error } = await supabase
      .from('missions')
      .insert([
        {
          title,
          description,
          assigned_to,
          created_by,
          priority,
          status: 'pending'
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ 
      data,
      message: 'Mission créée avec succès' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour mettre à jour une mission
app.put('/api/missions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assigned_to } = req.body;
    
    const { data, error } = await supabase
      .from('missions')
      .update({
        title,
        description,
        status,
        priority,
        assigned_to,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ 
      data,
      message: 'Mission mise à jour avec succès' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour supprimer une mission
app.delete('/api/missions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('missions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ message: 'Mission supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour l'authentification Supabase
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    res.json({
      user: data.user,
      session: data.session,
      message: 'Connexion réussie'
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Route pour obtenir les statistiques
app.get('/api/stats', async (req, res) => {
  try {
    // Compter les missions
    const { count: totalMissions } = await supabase
      .from('missions')
      .select('*', { count: 'exact', head: true });
    
    const { count: pendingMissions } = await supabase
      .from('missions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    const { count: completedMissions } = await supabase
      .from('missions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');
    
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    res.json({
      totalMissions: totalMissions || 0,
      pendingMissions: pendingMissions || 0,
      completedMissions: completedMissions || 0,
      totalUsers: totalUsers || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((error, req, res, next) => {
  console.error('Erreur serveur:', error);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur Supabase démarré sur le port ${PORT}`);
  console.log(`📊 API disponible sur: http://localhost:${PORT}/api`);
  console.log(`🔍 Santé: http://localhost:${PORT}/api/health`);
  console.log(`👥 Utilisateurs: http://localhost:${PORT}/api/users`);
  console.log(`📋 Missions: http://localhost:${PORT}/api/missions`);
  console.log(`☁️ Base de données: Supabase (${supabaseUrl})`);
});

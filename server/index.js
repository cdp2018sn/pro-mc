const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const { pool } = require('./config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de sécurité
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../dist')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite chaque IP à 100 requêtes par fenêtre
});
app.use('/api/', limiter);

// Route de santé
app.get('/api/health', async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    res.json({ 
      status: 'OK', 
      message: 'Serveur CDP Missions opérationnel',
      database: 'PostgreSQL connecté'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Erreur de connexion à la base de données',
      error: error.message 
    });
  }
});

// Routes pour les utilisateurs
app.get('/api/users', async (req, res) => {
  try {
    const { email } = req.query;
    let query = 'SELECT id, email, name, role, is_active, department, phone, created_at, updated_at, last_login FROM users';
    let params = [];
    
    if (email) {
      query += ' WHERE email = $1';
      params.push(email);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/users', [
  body('email').isEmail().normalizeEmail(),
  body('name').trim().isLength({ min: 2 }),
  body('password').isLength({ min: 8 }),
  body('role').isIn(['admin', 'supervisor', 'controller', 'viewer', 'user'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, password, role, department, phone } = req.body;
    
    // Vérifier si l'email existe déjà
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà' });
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      name,
      role,
      is_active: true,
      department: department || '',
      phone: phone || '',
      password_hash: hashedPassword,
      created_at: new Date()
    };
    
    await pool.query(`
      INSERT INTO users (id, email, name, role, is_active, department, phone, password_hash, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      newUser.id, newUser.email, newUser.name, newUser.role,
      newUser.is_active, newUser.department, newUser.phone,
      newUser.password_hash, newUser.created_at
    ]);
    
    // Retourner l'utilisateur sans le mot de passe
    const { password_hash, ...userWithoutPassword } = newUser;
    console.log('✅ Utilisateur créé:', newUser.email);
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/users/:id', [
  body('name').optional().trim().isLength({ min: 2 }),
  body('role').optional().isIn(['admin', 'supervisor', 'controller', 'viewer', 'user'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;
    
    // Vérifier si l'utilisateur existe
    const existingUser = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Construire la requête de mise à jour
    const updateFields = [];
    const values = [];
    let paramCount = 1;
    
    Object.keys(updates).forEach(key => {
      if (['name', 'role', 'department', 'phone', 'is_active', 'last_login'].includes(key)) {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Aucun champ valide à mettre à jour' });
    }
    
    values.push(id);
    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, email, name, role, is_active, department, phone, created_at, updated_at, last_login
    `;
    
    const result = await pool.query(query, values);
    const updatedUser = result.rows[0];
    
    console.log('✅ Utilisateur mis à jour:', updatedUser.email);
    res.json(updatedUser);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Empêcher la suppression de l'admin principal
    if (id === 'admin-1') {
      return res.status(400).json({ error: 'Impossible de supprimer l\'administrateur principal' });
    }
    
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING email', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    console.log('✅ Utilisateur supprimé:', result.rows[0].email);
    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes pour les missions
app.get('/api/missions', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, 
             u1.name as created_by_name,
             u2.name as assigned_to_name
      FROM missions m
      LEFT JOIN users u1 ON m.created_by = u1.id
      LEFT JOIN users u2 ON m.assigned_to = u2.id
      ORDER BY m.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des missions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/missions', [
  body('title').trim().isLength({ min: 3 }),
  body('description').optional().trim(),
  body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, status, priority, created_by, assigned_to, start_date, end_date, location, budget } = req.body;
    
    const newMission = {
      id: `mission-${Date.now()}`,
      title,
      description: description || '',
      status: status || 'pending',
      priority: priority || 'medium',
      created_by: created_by || 'admin-1',
      assigned_to: assigned_to || null,
      start_date: start_date || null,
      end_date: end_date || null,
      location: location || '',
      budget: budget || null,
      created_at: new Date()
    };
    
    await pool.query(`
      INSERT INTO missions (id, title, description, status, priority, created_by, assigned_to, start_date, end_date, location, budget, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
      newMission.id, newMission.title, newMission.description, newMission.status,
      newMission.priority, newMission.created_by, newMission.assigned_to,
      newMission.start_date, newMission.end_date, newMission.location,
      newMission.budget, newMission.created_at
    ]);
    
    console.log('✅ Mission créée:', newMission.title);
    res.status(201).json(newMission);
  } catch (error) {
    console.error('Erreur lors de la création de la mission:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/missions/:id', [
  body('title').optional().trim().isLength({ min: 3 }),
  body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;
    
    // Vérifier si la mission existe
    const existingMission = await pool.query('SELECT * FROM missions WHERE id = $1', [id]);
    if (existingMission.rows.length === 0) {
      return res.status(404).json({ error: 'Mission non trouvée' });
    }
    
    // Construire la requête de mise à jour
    const updateFields = [];
    const values = [];
    let paramCount = 1;
    
    Object.keys(updates).forEach(key => {
      if (['title', 'description', 'status', 'priority', 'assigned_to', 'start_date', 'end_date', 'location', 'budget'].includes(key)) {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Aucun champ valide à mettre à jour' });
    }
    
    values.push(id);
    const query = `
      UPDATE missions 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    const updatedMission = result.rows[0];
    
    console.log('✅ Mission mise à jour:', updatedMission.title);
    res.json(updatedMission);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la mission:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/missions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM missions WHERE id = $1 RETURNING title', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mission non trouvée' });
    }
    
    console.log('✅ Mission supprimée:', result.rows[0].title);
    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression de la mission:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes pour les constatations
app.get('/api/findings', async (req, res) => {
  try {
    const { mission_id } = req.query;
    let query = `
      SELECT f.*, 
             u1.name as created_by_name,
             u2.name as assigned_to_name
      FROM findings f
      LEFT JOIN users u1 ON f.created_by = u1.id
      LEFT JOIN users u2 ON f.assigned_to = u2.id
    `;
    let params = [];
    
    if (mission_id) {
      query += ' WHERE f.mission_id = $1';
      params.push(mission_id);
    }
    
    query += ' ORDER BY f.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des constatations:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes pour les remarques
app.get('/api/remarks', async (req, res) => {
  try {
    const { mission_id } = req.query;
    let query = `
      SELECT r.*, u.name as created_by_name
      FROM remarks r
      LEFT JOIN users u ON r.created_by = u.id
    `;
    let params = [];
    
    if (mission_id) {
      query += ' WHERE r.mission_id = $1';
      params.push(mission_id);
    }
    
    query += ' ORDER BY r.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des remarques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour servir l'application React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur CDP Missions démarré sur http://localhost:${PORT}`);
  console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
  console.log(`🌐 Application disponible sur http://localhost:${PORT}`);
  console.log(`🗄️ Base de données: PostgreSQL`);
});

// Gestion des erreurs
process.on('uncaughtException', (error) => {
  console.error('Erreur non gérée:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesse rejetée non gérée:', reason);
});

// Fermeture propre du serveur
process.on('SIGINT', async () => {
  console.log('\n🔄 Arrêt du serveur...');
  await pool.end();
  process.exit(0);
});

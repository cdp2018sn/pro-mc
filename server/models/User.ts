import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';

export interface User {
  id?: string;
  email: string;
  name: string;
  role: 'admin' | 'supervisor' | 'controller' | 'viewer' | 'user';
  password_hash: string;
  department?: string;
  phone?: string;
  is_active: boolean;
  permissions?: Record<string, boolean>;
  last_login?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserWithoutPassword extends Omit<User, 'password_hash'> {}

export class UserModel {
  // Créer un nouvel utilisateur
  static async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'password_hash'> & { password: string }): Promise<UserWithoutPassword> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const query = `
      INSERT INTO users (
        email, name, role, password_hash, department, phone, is_active, permissions
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, '{}'::jsonb))
      RETURNING id, email, name, role, department, phone, is_active, permissions, last_login, created_at, updated_at
    `;
    
    const values = [
      userData.email,
      userData.name,
      userData.role,
      hashedPassword,
      userData.department || null,
      userData.phone || null,
      userData.is_active,
      userData.permissions ? JSON.stringify(userData.permissions) : null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Obtenir tous les utilisateurs
  static async findAll(): Promise<UserWithoutPassword[]> {
    const query = `
      SELECT id, email, name, role, department, phone, is_active, permissions, last_login, created_at, updated_at
      FROM users 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Obtenir un utilisateur par ID
  static async findById(id: string): Promise<UserWithoutPassword | null> {
    const query = `
      SELECT id, email, name, role, department, phone, is_active, permissions, last_login, created_at, updated_at
      FROM users 
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Obtenir un utilisateur par email
  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  // Obtenir un utilisateur par ID (avec password_hash)
  static async findByIdWithPassword(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Mettre à jour un utilisateur
  static async update(id: string, updates: Partial<Omit<User, 'id' | 'password_hash' | 'created_at'>>): Promise<UserWithoutPassword | null> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const query = `
      UPDATE users 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING id, email, name, role, department, phone, is_active, permissions, last_login, created_at, updated_at
    `;
    
    const values = [
      id,
      ...Object.values(
        Object.fromEntries(
          Object.entries(updates).map(([k, v]) => [k, k === 'permissions' && v ? JSON.stringify(v) : v])
        )
      )
    ];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // Changer le mot de passe
  static async changePassword(id: string, newPassword: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const query = `
      UPDATE users 
      SET password_hash = $2, updated_at = NOW()
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id, hashedPassword]);
    return result.rowCount > 0;
  }

  // Mettre à jour la dernière connexion
  static async updateLastLogin(id: string): Promise<void> {
    const query = `
      UPDATE users 
      SET last_login = NOW(), updated_at = NOW()
      WHERE id = $1
    `;
    
    await pool.query(query, [id]);
  }

  // Supprimer un utilisateur
  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }

  // Vérifier les identifiants de connexion
  static async verifyCredentials(email: string, password: string): Promise<UserWithoutPassword | null> {
    const user = await this.findByEmail(email);
    
    if (!user || !user.is_active) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return null;
    }

    // Mettre à jour la dernière connexion
    await this.updateLastLogin(user.id!);

    // Retourner l'utilisateur sans le mot de passe
    const { password_hash: _, ...userWithoutPassword } = user as any;
    return userWithoutPassword as UserWithoutPassword;
  }

  // Créer l'utilisateur administrateur par défaut
  static async createDefaultAdmin(): Promise<void> {
    const adminExists = await this.findByEmail('abdoulaye.niang@cdp.sn');
    
    if (!adminExists) {
      await this.create({
        email: 'abdoulaye.niang@cdp.sn',
        name: 'Abdoulaye Niang',
        role: 'admin',
        password: 'Passer', // Sera hashé automatiquement
        department: 'Direction',
        phone: '',
        is_active: true
      });
      console.log('✅ Utilisateur administrateur par défaut créé');
    }
  }
}

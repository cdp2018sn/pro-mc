import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';

export interface User {
  id?: string;
  email: string;
  name: string;
  role: 'admin' | 'supervisor' | 'controller' | 'viewer' | 'user';
  password: string;
  department?: string;
  phone?: string;
  is_active: boolean;
  last_login?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserWithoutPassword extends Omit<User, 'password'> {}

export class UserModel {
  // Créer un nouvel utilisateur
  static async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<UserWithoutPassword> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const query = `
      INSERT INTO users (
        email, name, role, password, department, phone, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, name, role, department, phone, is_active, last_login, created_at, updated_at
    `;
    
    const values = [
      userData.email,
      userData.name,
      userData.role,
      hashedPassword,
      userData.department || null,
      userData.phone || null,
      userData.is_active
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Obtenir tous les utilisateurs
  static async findAll(): Promise<UserWithoutPassword[]> {
    const query = `
      SELECT id, email, name, role, department, phone, is_active, last_login, created_at, updated_at
      FROM users 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Obtenir un utilisateur par ID
  static async findById(id: string): Promise<UserWithoutPassword | null> {
    const query = `
      SELECT id, email, name, role, department, phone, is_active, last_login, created_at, updated_at
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

  // Mettre à jour un utilisateur
  static async update(id: string, updates: Partial<Omit<User, 'id' | 'password' | 'created_at'>>): Promise<UserWithoutPassword | null> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const query = `
      UPDATE users 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING id, email, name, role, department, phone, is_active, last_login, created_at, updated_at
    `;
    
    const values = [id, ...Object.values(updates)];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // Changer le mot de passe
  static async changePassword(id: string, newPassword: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const query = `
      UPDATE users 
      SET password = $2, updated_at = NOW()
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

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return null;
    }

    // Mettre à jour la dernière connexion
    await this.updateLastLogin(user.id!);

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
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

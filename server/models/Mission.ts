import { pool } from '../config/database.js';

export interface Mission {
  id?: string;
  reference: string;
  title: string;
  description?: string;
  status: 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';
  start_date: Date;
  end_date: Date;
  location: string;
  controller_name: string;
  entity_controlled: string;
  mission_type: string;
  priority: 'BASSE' | 'MOYENNE' | 'HAUTE' | 'URGENTE';
  created_at?: Date;
  updated_at?: Date;
}

export interface Document {
  id?: string;
  mission_id: string;
  type: 'RAPPORT_CONTROLE' | 'LETTRE_NOTIFICATION' | 'LETTRE_REPONSE' | 'AUTRE' | 'LETTRE_DECISION' | 'LETTRE_PROCUREUR' | 'NOTIFICATION_RECU';
  title: string;
  content?: string;
  file_path?: string;
  created_at?: Date;
}

export interface Finding {
  id?: string;
  mission_id: string;
  description: string;
  severity: 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'CRITIQUE';
  status: 'OUVERT' | 'EN_COURS' | 'RESOLU' | 'FERME';
  created_at?: Date;
  updated_at?: Date;
}

export interface Sanction {
  id?: string;
  mission_id: string;
  type: string;
  description: string;
  amount?: number;
  status: 'PROPOSEE' | 'APPLIQUEE' | 'ANNULEE';
  created_at?: Date;
}

export interface Remark {
  id?: string;
  mission_id: string;
  content: string;
  author: string;
  created_at?: Date;
}

export class MissionModel {
  // Créer une nouvelle mission
  static async create(mission: Omit<Mission, 'id' | 'created_at' | 'updated_at'>): Promise<Mission> {
    const query = `
      INSERT INTO missions (
        reference, title, description, status, start_date, end_date, 
        location, controller_name, entity_controlled, mission_type, priority
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      mission.reference,
      mission.title,
      mission.description,
      mission.status,
      mission.start_date,
      mission.end_date,
      mission.location,
      mission.controller_name,
      mission.entity_controlled,
      mission.mission_type,
      mission.priority
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Obtenir toutes les missions
  static async findAll(): Promise<Mission[]> {
    const query = 'SELECT * FROM missions ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  // Obtenir une mission par ID
  static async findById(id: string): Promise<Mission | null> {
    const query = 'SELECT * FROM missions WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Mettre à jour une mission
  static async update(id: string, updates: Partial<Mission>): Promise<Mission | null> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const query = `
      UPDATE missions 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const values = [id, ...Object.values(updates)];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // Supprimer une mission
  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM missions WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }

  // Rechercher des missions
  static async search(criteria: {
    status?: string;
    controller_name?: string;
    entity_controlled?: string;
    start_date?: Date;
    end_date?: Date;
  }): Promise<Mission[]> {
    let query = 'SELECT * FROM missions WHERE 1=1';
    const values: any[] = [];
    let paramIndex = 1;

    if (criteria.status) {
      query += ` AND status = $${paramIndex++}`;
      values.push(criteria.status);
    }

    if (criteria.controller_name) {
      query += ` AND controller_name ILIKE $${paramIndex++}`;
      values.push(`%${criteria.controller_name}%`);
    }

    if (criteria.entity_controlled) {
      query += ` AND entity_controlled ILIKE $${paramIndex++}`;
      values.push(`%${criteria.entity_controlled}%`);
    }

    if (criteria.start_date) {
      query += ` AND start_date >= $${paramIndex++}`;
      values.push(criteria.start_date);
    }

    if (criteria.end_date) {
      query += ` AND end_date <= $${paramIndex++}`;
      values.push(criteria.end_date);
    }

    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  // Mettre à jour automatiquement les statuts
  static async updateStatuses(): Promise<{ plannedToOngoing: number; ongoingToCompleted: number }> {
    const now = new Date();
    
    // Missions planifiées qui doivent passer en cours
    const plannedResult = await pool.query(`
      UPDATE missions 
      SET status = 'EN_COURS', updated_at = NOW()
      WHERE status = 'PLANIFIEE' AND start_date <= $1
      RETURNING id
    `, [now]);

    // Missions en cours qui doivent se terminer
    const ongoingResult = await pool.query(`
      UPDATE missions 
      SET status = 'TERMINEE', updated_at = NOW()
      WHERE status = 'EN_COURS' AND end_date <= $1
      RETURNING id
    `, [now]);

    return {
      plannedToOngoing: plannedResult.rowCount,
      ongoingToCompleted: ongoingResult.rowCount
    };
  }
} 
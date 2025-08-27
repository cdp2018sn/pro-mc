import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';
import { pool } from '../config/database.js';

// Interface pour étendre Request avec l'utilisateur
export interface AuthenticatedRequest<P = any, ResBody = any, ReqBody = any, ReqQuery = any> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: {
    id: string;
    email: string;
    role: string;
    permissions?: any;
  };
}

// Middleware d'authentification
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: "Token d'accès requis" });
    }

    const secret = process.env.JWT_SECRET || 'dev-secret';
    const payload = jwt.verify(token, secret) as { id: string; email: string; role: string };

    // Vérifier l'utilisateur en base
    const user = await UserModel.findById(payload.id);
    if (!user || !user.is_active) {
      return res.status(403).json({ error: 'Utilisateur non autorisé ou inactif' });
    }

    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      permissions: (user as any).permissions || undefined,
    };

    next();
  } catch (error) {
    console.error("Erreur d'authentification:", error);
    return res.status(403).json({ error: 'Token invalide' });
  }
};

// Middleware d'autorisation par rôle
export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Permissions insuffisantes',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

// Middleware d'autorisation par permission
const ROLE_PERMISSIONS: Record<string, Record<string, boolean>> = {
  admin: {
    canCreateMissions: true,
    canEditMissions: true,
    canDeleteMissions: true,
    canManageUsers: true,
    canViewAllMissions: true,
  },
  supervisor: {
    canCreateMissions: true,
    canEditMissions: true,
    canDeleteMissions: true,
    canManageUsers: false,
    canViewAllMissions: true,
  },
  controller: {
    canCreateMissions: true,
    canEditMissions: true, // limité par ownership
    canDeleteMissions: false,
    canManageUsers: false,
    canViewAllMissions: false,
  },
  viewer: {
    canCreateMissions: false,
    canEditMissions: false,
    canDeleteMissions: false,
    canManageUsers: false,
    canViewAllMissions: false,
  },
  user: {
    canCreateMissions: false,
    canEditMissions: false,
    canDeleteMissions: false,
    canManageUsers: false,
    canViewAllMissions: false,
  },
};

export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    // Priorité aux permissions personnalisées si présentes sur la requête (hydratées en amont) ou en base
    const custom = (req.user.permissions as any) || undefined;
    if (custom && typeof custom === 'object' && permission in custom) {
      const allowedCustom = Boolean((custom as any)[permission]);
      if (!allowedCustom) {
        return res.status(403).json({ error: 'Permission insuffisante', required: permission });
      }
      return next();
    }

    const role = req.user.role || 'user';
    const allowed = ROLE_PERMISSIONS[role]?.[permission] || false;
    if (!allowed) {
      return res.status(403).json({ error: 'Permission insuffisante', required: permission });
    }

    next();
  };
};

// Middleware pour vérifier la propriété (seul le créateur peut modifier/supprimer)
export const requireOwnership = (table: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    const { id } = req.params as any;
    if (!id) return res.status(400).json({ error: 'ID manquant' });
    if (req.user.role === 'admin') return next();

    try {
      const result = await pool.query(`SELECT created_by FROM ${table} WHERE id = $1`, [id]);
      const row = result.rows[0];
      if (!row) return res.status(404).json({ error: 'Ressource non trouvée' });
      if (row.created_by !== req.user.id) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }
      return next();
    } catch (e) {
      console.error('Erreur de vérification ownership:', e);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  };
};

// Middleware pour les opérations sensibles (suppression)
export const requireAdminOrOwnership = (table: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    // Les admins peuvent tout faire
    if (req.user.role === 'admin') {
      return next();
    }

    // Pour les autres rôles, vérifier la propriété
    return requireOwnership(table)(req, res, next);
  };
};

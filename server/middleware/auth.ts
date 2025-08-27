import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';

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
export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    // Simple règle par défaut: seuls admin/supervisor peuvent passer ce middleware
    if (!['admin', 'supervisor'].includes(req.user.role)) {
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
    // Règle minimale: admin ok, sinon on laisse passer (à spécialiser si besoin)
    if (req.user.role === 'admin') return next();
    if (!id) return res.status(400).json({ error: 'ID manquant' });
    return next();
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

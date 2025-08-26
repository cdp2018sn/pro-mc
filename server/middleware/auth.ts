import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

// Interface pour étendre Request avec l'utilisateur
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    permissions: any;
  };
}

// Middleware d'authentification
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Token d\'accès requis' });
    }

    // Vérifier le token avec Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(403).json({ error: 'Token invalide' });
    }

    // Récupérer les informations complètes de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return res.status(403).json({ error: 'Utilisateur non trouvé' });
    }

    if (!userData.is_active) {
      return res.status(403).json({ error: 'Compte désactivé' });
    }

    // Ajouter l'utilisateur à la requête
    req.user = {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      permissions: userData.permissions
    };

    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return res.status(500).json({ error: 'Erreur d\'authentification' });
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

    if (!req.user.permissions || !req.user.permissions[permission]) {
      return res.status(403).json({ 
        error: 'Permission insuffisante',
        required: permission
      });
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

    const { id } = req.params;
    
    try {
      const { data, error } = await supabase
        .from(table)
        .select('created_by')
        .eq('id', id)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: 'Ressource non trouvée' });
      }

      // Les admins peuvent tout faire
      if (req.user.role === 'admin') {
        return next();
      }

      // Vérifier si l'utilisateur est le propriétaire
      if (data.created_by !== req.user.id) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }

      next();
    } catch (error) {
      console.error('Erreur de vérification de propriété:', error);
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

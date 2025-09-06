import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { ApiResponse } from '@shared/types';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      const response: ApiResponse = {
        success: false,
        error: 'Not authorized to access this route'
      };
      return res.status(401).json(response);
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'No user found with this token'
        };
        return res.status(401).json(response);
      }

      if (!user.isActive) {
        const response: ApiResponse = {
          success: false,
          error: 'User account is deactivated'
        };
        return res.status(401).json(response);
      }

      req.user = user;
      next();
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Not authorized to access this route'
      };
      return res.status(401).json(response);
    }
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Server error in authentication'
    };
    return res.status(500).json(response);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'Not authorized to access this route'
      };
      return res.status(401).json(response);
    }

    if (!roles.includes(req.user.role)) {
      const response: ApiResponse = {
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      };
      return res.status(403).json(response);
    }

    next();
  };
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we continue without user
      }
    }

    next();
  } catch (error) {
    next();
  }
};
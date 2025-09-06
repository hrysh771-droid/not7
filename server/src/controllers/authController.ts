import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { ApiResponse } from '@shared/types';

// Generate JWT Token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password, language = 'ar' } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    return next(createError('User already exists with this email or username', 400));
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    preferences: {
      language: language as 'ar' | 'en',
      theme: 'auto',
      readingSettings: {
        fontSize: 'medium',
        fontFamily: 'arabic',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        lineHeight: 1.6,
        maxWidth: 800
      },
      notifications: {
        email: true,
        push: true,
        newChapters: true,
        updates: true
      }
    }
  });

  const token = generateToken(user._id);

  const response: ApiResponse = {
    success: true,
    data: {
      user,
      token
    },
    message: 'User registered successfully'
  };

  res.status(201).json(response);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(createError('Invalid credentials', 401));
  }

  // Check if user is active
  if (!user.isActive) {
    return next(createError('Account is deactivated', 401));
  }

  // Check password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return next(createError('Invalid credentials', 401));
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id);

  const response: ApiResponse = {
    success: true,
    data: {
      user,
      token
    },
    message: 'Login successful'
  };

  res.status(200).json(response);
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const response: ApiResponse = {
    success: true,
    message: 'Logout successful'
  };

  res.status(200).json(response);
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user!._id);

  const response: ApiResponse = {
    success: true,
    data: user,
    message: 'User profile retrieved successfully'
  };

  res.status(200).json(response);
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { username, email, preferences } = req.body;
  const userId = req.user!._id;

  // Check if username or email is already taken by another user
  if (username || email) {
    const existingUser = await User.findOne({
      _id: { $ne: userId },
      $or: [
        ...(username ? [{ username }] : []),
        ...(email ? [{ email }] : [])
      ]
    });

    if (existingUser) {
      return next(createError('Username or email already exists', 400));
    }
  }

  const updateData: any = {};
  if (username) updateData.username = username;
  if (email) updateData.email = email;
  if (preferences) updateData.preferences = { ...req.user!.preferences, ...preferences };

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  );

  const response: ApiResponse = {
    success: true,
    data: user,
    message: 'Profile updated successfully'
  };

  res.status(200).json(response);
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!._id;

  // Get user with password
  const user = await User.findById(userId).select('+password');

  if (!user) {
    return next(createError('User not found', 404));
  }

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    return next(createError('Current password is incorrect', 400));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  const response: ApiResponse = {
    success: true,
    message: 'Password changed successfully'
  };

  res.status(200).json(response);
});
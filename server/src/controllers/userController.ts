import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Novel from '../models/Novel';
import Chapter from '../models/Chapter';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { ApiResponse, PaginatedResponse } from '@shared/types';

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin/Moderator)
export const getUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { page = 1, limit = 20, search, role } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build filter
  const filter: any = {};
  if (search) {
    filter.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  if (role) {
    filter.role = role;
  }

  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await User.countDocuments(filter);
  const totalPages = Math.ceil(total / limitNum);

  const response: PaginatedResponse<any> = {
    success: true,
    data: users,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1
    },
    message: 'Users retrieved successfully'
  };

  res.status(200).json(response);
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
export const getUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const currentUser = req.user!;

  // Users can only view their own profile unless they're admin/moderator
  if (id !== currentUser._id.toString() && !['admin', 'moderator'].includes(currentUser.role)) {
    return next(createError('Not authorized to view this user', 403));
  }

  const user = await User.findById(id).select('-password');

  if (!user) {
    return next(createError('User not found', 404));
  }

  const response: ApiResponse = {
    success: true,
    data: user,
    message: 'User retrieved successfully'
  };

  res.status(200).json(response);
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const currentUser = req.user!;

  // Users can only update their own profile unless they're admin/moderator
  if (id !== currentUser._id.toString() && !['admin', 'moderator'].includes(currentUser.role)) {
    return next(createError('Not authorized to update this user', 403));
  }

  const user = await User.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return next(createError('User not found', 404));
  }

  const response: ApiResponse = {
    success: true,
    data: user,
    message: 'User updated successfully'
  };

  res.status(200).json(response);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
export const deleteUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(createError('User not found', 404));
  }

  const response: ApiResponse = {
    success: true,
    message: 'User deleted successfully'
  };

  res.status(200).json(response);
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
export const getUserStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user!._id;

  const [
    totalFavorites,
    totalReadingHistory,
    totalNovelsRead,
    recentActivity
  ] = await Promise.all([
    Novel.countDocuments({ _id: { $in: req.user!.favorites } }),
    req.user!.readingHistory.length,
    Novel.countDocuments({ _id: { $in: req.user!.readingHistory.map(h => h.novelId) } }),
    Novel.find({ _id: { $in: req.user!.readingHistory.map(h => h.novelId) } })
      .select('title coverImage')
      .sort({ updatedAt: -1 })
      .limit(5)
  ]);

  const stats = {
    totalFavorites,
    totalReadingHistory,
    totalNovelsRead,
    recentActivity
  };

  const response: ApiResponse = {
    success: true,
    data: stats,
    message: 'User statistics retrieved successfully'
  };

  res.status(200).json(response);
});
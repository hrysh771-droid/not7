import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Novel from '../models/Novel';
import Chapter from '../models/Chapter';
import Comment from '../models/Comment';
import { Genre } from '../models/Novel';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { ApiResponse, PaginatedResponse, AdminStats } from '@shared/types';

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin/Moderator)
export const getDashboardStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const [
    totalUsers,
    totalNovels,
    totalChapters,
    totalComments,
    totalViews,
    recentUsers,
    popularNovels,
    recentComments,
    pendingComments
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Novel.countDocuments({ isActive: true }),
    Chapter.countDocuments({ isActive: true }),
    Comment.countDocuments({ isActive: true }),
    Novel.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]),
    User.find({ isActive: true })
      .select('username email createdAt')
      .sort({ createdAt: -1 })
      .limit(5),
    Novel.find({ isActive: true })
      .select('title coverImage views favorites')
      .sort({ views: -1 })
      .limit(5),
    Comment.find({ isActive: true })
      .populate('userId', 'username')
      .populate('novelId', 'title')
      .sort({ createdAt: -1 })
      .limit(5),
    Comment.countDocuments({ isActive: true, isApproved: false })
  ]);

  const stats: AdminStats = {
    totalUsers,
    totalNovels,
    totalChapters,
    totalViews: totalViews[0]?.totalViews || 0,
    recentUsers,
    popularNovels,
    recentComments
  };

  const response: ApiResponse = {
    success: true,
    data: {
      ...stats,
      totalComments,
      pendingComments
    },
    message: 'Dashboard statistics retrieved successfully'
  };

  res.status(200).json(response);
});

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Private (Admin/Moderator)
export const getUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { page = 1, limit = 20, search, role, isActive } = req.query;

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
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

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

// @desc    Get all novels for admin
// @route   GET /api/admin/novels
// @access  Private (Admin/Moderator)
export const getNovels = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { page = 1, limit = 20, search, country, status, isActive } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build filter
  const filter: any = {};
  if (search) {
    filter.$or = [
      { 'title.ar': { $regex: search, $options: 'i' } },
      { 'title.en': { $regex: search, $options: 'i' } },
      { 'author.ar': { $regex: search, $options: 'i' } },
      { 'author.en': { $regex: search, $options: 'i' } }
    ];
  }
  if (country) filter.country = country;
  if (status) filter.status = status;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const novels = await Novel.find(filter)
    .populate('genres', 'name slug color')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Novel.countDocuments(filter);
  const totalPages = Math.ceil(total / limitNum);

  const response: PaginatedResponse<any> = {
    success: true,
    data: novels,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1
    },
    message: 'Novels retrieved successfully'
  };

  res.status(200).json(response);
});

// @desc    Get all comments for admin
// @route   GET /api/admin/comments
// @access  Private (Admin/Moderator)
export const getComments = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { page = 1, limit = 20, isApproved, isActive } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build filter
  const filter: any = {};
  if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const comments = await Comment.find(filter)
    .populate('userId', 'username email')
    .populate('novelId', 'title')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Comment.countDocuments(filter);
  const totalPages = Math.ceil(total / limitNum);

  const response: PaginatedResponse<any> = {
    success: true,
    data: comments,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1
    },
    message: 'Comments retrieved successfully'
  };

  res.status(200).json(response);
});

// @desc    Approve comment
// @route   PUT /api/admin/comments/:id/approve
// @access  Private (Admin/Moderator)
export const approveComment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const comment = await Comment.findByIdAndUpdate(
    req.params.id,
    { isApproved: true },
    { new: true }
  ).populate('userId', 'username').populate('novelId', 'title');

  if (!comment) {
    return next(createError('Comment not found', 404));
  }

  const response: ApiResponse = {
    success: true,
    data: comment,
    message: 'Comment approved successfully'
  };

  res.status(200).json(response);
});

// @desc    Reject comment
// @route   PUT /api/admin/comments/:id/reject
// @access  Private (Admin/Moderator)
export const rejectComment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const comment = await Comment.findByIdAndUpdate(
    req.params.id,
    { isApproved: false },
    { new: true }
  ).populate('userId', 'username').populate('novelId', 'title');

  if (!comment) {
    return next(createError('Comment not found', 404));
  }

  const response: ApiResponse = {
    success: true,
    data: comment,
    message: 'Comment rejected successfully'
  };

  res.status(200).json(response);
});

// @desc    Delete comment
// @route   DELETE /api/admin/comments/:id
// @access  Private (Admin/Moderator)
export const deleteComment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const comment = await Comment.findByIdAndDelete(req.params.id);

  if (!comment) {
    return next(createError('Comment not found', 404));
  }

  const response: ApiResponse = {
    success: true,
    message: 'Comment deleted successfully'
  };

  res.status(200).json(response);
});

// @desc    Get all genres
// @route   GET /api/admin/genres
// @access  Private (Admin/Moderator)
export const getGenres = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const genres = await Genre.find({ isActive: true }).sort({ name: 1 });

  const response: ApiResponse = {
    success: true,
    data: genres,
    message: 'Genres retrieved successfully'
  };

  res.status(200).json(response);
});

// @desc    Create new genre
// @route   POST /api/admin/genres
// @access  Private (Admin/Moderator)
export const createGenre = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { name, description, color } = req.body;

  // Generate slug
  const slug = name.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // Check if slug already exists
  const existingGenre = await Genre.findOne({ slug });
  if (existingGenre) {
    return next(createError('Genre with this name already exists', 400));
  }

  const genre = await Genre.create({
    name,
    description,
    color: color || '#3b82f6',
    slug
  });

  const response: ApiResponse = {
    success: true,
    data: genre,
    message: 'Genre created successfully'
  };

  res.status(201).json(response);
});

// @desc    Update genre
// @route   PUT /api/admin/genres/:id
// @access  Private (Admin/Moderator)
export const updateGenre = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const genre = await Genre.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!genre) {
    return next(createError('Genre not found', 404));
  }

  const response: ApiResponse = {
    success: true,
    data: genre,
    message: 'Genre updated successfully'
  };

  res.status(200).json(response);
});

// @desc    Delete genre
// @route   DELETE /api/admin/genres/:id
// @access  Private (Admin/Moderator)
export const deleteGenre = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const genre = await Genre.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!genre) {
    return next(createError('Genre not found', 404));
  }

  const response: ApiResponse = {
    success: true,
    data: genre,
    message: 'Genre deleted successfully'
  };

  res.status(200).json(response);
});
import { Request, Response, NextFunction } from 'express';
import Comment, { IComment } from '../models/Comment';
import Novel from '../models/Novel';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { ApiResponse, PaginatedResponse } from '@shared/types';

// @desc    Get comments for a novel
// @route   GET /api/comments/novel/:novelId
// @access  Public
export const getComments = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { novelId } = req.params;
  const { page = 1, limit = 20, approved = true } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Check if novel exists
  const novel = await Novel.findById(novelId);
  if (!novel || !novel.isActive) {
    return next(createError('Novel not found', 404));
  }

  // Build filter
  const filter: any = { 
    novelId, 
    isActive: true 
  };
  
  if (approved === 'true') {
    filter.isApproved = true;
  }

  const comments = await Comment.find(filter)
    .populate('userId', 'username avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Comment.countDocuments(filter);
  const totalPages = Math.ceil(total / limitNum);

  const response: PaginatedResponse<IComment> = {
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

// @desc    Create new comment
// @route   POST /api/comments/novel/:novelId
// @access  Private
export const createComment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { novelId } = req.params;
  const { content, rating } = req.body;
  const userId = req.user!._id;

  // Check if novel exists
  const novel = await Novel.findById(novelId);
  if (!novel || !novel.isActive) {
    return next(createError('Novel not found', 404));
  }

  // Check if user already commented on this novel
  const existingComment = await Comment.findOne({ novelId, userId });
  if (existingComment) {
    return next(createError('You have already commented on this novel', 400));
  }

  const comment = await Comment.create({
    novelId,
    userId,
    content,
    rating,
    isApproved: false // Comments need approval by default
  });

  await comment.populate('userId', 'username avatar');

  const response: ApiResponse = {
    success: true,
    data: comment,
    message: 'Comment created successfully and is pending approval'
  };

  res.status(201).json(response);
});

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
export const updateComment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user!._id;

  const comment = await Comment.findById(id);
  if (!comment) {
    return next(createError('Comment not found', 404));
  }

  // Users can only update their own comments
  if (comment.userId.toString() !== userId.toString()) {
    return next(createError('Not authorized to update this comment', 403));
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    id,
    { ...req.body, isApproved: false }, // Reset approval status when updated
    { new: true, runValidators: true }
  ).populate('userId', 'username avatar');

  const response: ApiResponse = {
    success: true,
    data: updatedComment,
    message: 'Comment updated successfully'
  };

  res.status(200).json(response);
});

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
export const deleteComment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user!._id;

  const comment = await Comment.findById(id);
  if (!comment) {
    return next(createError('Comment not found', 404));
  }

  // Users can only delete their own comments (unless admin/moderator)
  if (comment.userId.toString() !== userId.toString() && !['admin', 'moderator'].includes(req.user!.role)) {
    return next(createError('Not authorized to delete this comment', 403));
  }

  await Comment.findByIdAndDelete(id);

  const response: ApiResponse = {
    success: true,
    message: 'Comment deleted successfully'
  };

  res.status(200).json(response);
});

// @desc    Like comment
// @route   POST /api/comments/:id/like
// @access  Private
export const likeComment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(createError('Comment not found', 404));
  }

  await comment.like();

  const response: ApiResponse = {
    success: true,
    data: { likes: comment.likes },
    message: 'Comment liked successfully'
  };

  res.status(200).json(response);
});

// @desc    Dislike comment
// @route   POST /api/comments/:id/dislike
// @access  Private
export const dislikeComment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(createError('Comment not found', 404));
  }

  await comment.dislike();

  const response: ApiResponse = {
    success: true,
    data: { dislikes: comment.dislikes },
    message: 'Comment disliked successfully'
  };

  res.status(200).json(response);
});
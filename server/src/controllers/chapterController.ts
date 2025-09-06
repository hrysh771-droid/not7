import { Request, Response, NextFunction } from 'express';
import Chapter, { IChapter } from '../models/Chapter';
import Novel from '../models/Novel';
import User from '../models/User';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { ApiResponse, PaginatedResponse } from '@shared/types';

// @desc    Get chapters for a novel
// @route   GET /api/chapters/novel/:novelId
// @access  Public
export const getChapters = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { novelId } = req.params;
  const { page = 1, limit = 20, published = true } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Check if novel exists
  const novel = await Novel.findById(novelId);
  if (!novel || !novel.isActive) {
    return next(createError('Novel not found', 404));
  }

  // Build filter
  const filter: any = { novelId, isActive: true };
  if (published === 'true') {
    filter.isPublished = true;
  }

  const chapters = await Chapter.find(filter)
    .select('title chapterNumber isPublished publishedAt views wordCount')
    .sort({ chapterNumber: 1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Chapter.countDocuments(filter);
  const totalPages = Math.ceil(total / limitNum);

  const response: PaginatedResponse<IChapter> = {
    success: true,
    data: chapters,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1
    },
    message: 'Chapters retrieved successfully'
  };

  res.status(200).json(response);
});

// @desc    Get single chapter
// @route   GET /api/chapters/:id
// @access  Public
export const getChapter = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const chapter = await Chapter.findById(req.params.id)
    .populate('novelId', 'title author country status');

  if (!chapter || !chapter.isActive) {
    return next(createError('Chapter not found', 404));
  }

  // Check if chapter is published (unless user is admin/moderator)
  if (!chapter.isPublished && (!req.user || !['admin', 'moderator'].includes(req.user.role))) {
    return next(createError('Chapter not available', 404));
  }

  // Increment views
  await chapter.incrementViews();

  const response: ApiResponse = {
    success: true,
    data: chapter,
    message: 'Chapter retrieved successfully'
  };

  res.status(200).json(response);
});

// @desc    Get chapter content for reading
// @route   GET /api/chapters/:id/content
// @access  Public
export const getChapterContent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { language = 'ar' } = req.query;
  const chapter = await Chapter.findById(req.params.id)
    .populate('novelId', 'title author');

  if (!chapter || !chapter.isActive) {
    return next(createError('Chapter not found', 404));
  }

  // Check if chapter is published (unless user is admin/moderator)
  if (!chapter.isPublished && (!req.user || !['admin', 'moderator'].includes(req.user.role))) {
    return next(createError('Chapter not available', 404));
  }

  // Increment views
  await chapter.incrementViews();

  const content = {
    id: chapter._id,
    title: chapter.title[language as 'ar' | 'en'],
    content: chapter.content[language as 'ar' | 'en'],
    chapterNumber: chapter.chapterNumber,
    wordCount: chapter.wordCount,
    novel: {
      id: chapter.novelId._id,
      title: chapter.novelId.title[language as 'ar' | 'en'],
      author: chapter.novelId.author[language as 'ar' | 'en']
    }
  };

  const response: ApiResponse = {
    success: true,
    data: content,
    message: 'Chapter content retrieved successfully'
  };

  res.status(200).json(response);
});

// @desc    Create new chapter
// @route   POST /api/chapters/novel/:novelId
// @access  Private (Admin/Moderator)
export const createChapter = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { novelId } = req.params;
  const chapterData = req.body;

  // Check if novel exists
  const novel = await Novel.findById(novelId);
  if (!novel) {
    return next(createError('Novel not found', 404));
  }

  // Check if chapter number already exists
  const existingChapter = await Chapter.findOne({
    novelId,
    chapterNumber: chapterData.chapterNumber
  });

  if (existingChapter) {
    return next(createError('Chapter with this number already exists', 400));
  }

  const chapter = await Chapter.create({
    ...chapterData,
    novelId
  });

  // Add chapter to novel's chapters array
  novel.chapters.push(chapter._id);
  await novel.save();

  const response: ApiResponse = {
    success: true,
    data: chapter,
    message: 'Chapter created successfully'
  };

  res.status(201).json(response);
});

// @desc    Update chapter
// @route   PUT /api/chapters/:id
// @access  Private (Admin/Moderator)
export const updateChapter = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const chapter = await Chapter.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!chapter) {
    return next(createError('Chapter not found', 404));
  }

  const response: ApiResponse = {
    success: true,
    data: chapter,
    message: 'Chapter updated successfully'
  };

  res.status(200).json(response);
});

// @desc    Delete chapter
// @route   DELETE /api/chapters/:id
// @access  Private (Admin)
export const deleteChapter = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const chapter = await Chapter.findById(req.params.id);

  if (!chapter) {
    return next(createError('Chapter not found', 404));
  }

  // Remove chapter from novel's chapters array
  await Novel.findByIdAndUpdate(
    chapter.novelId,
    { $pull: { chapters: chapter._id } }
  );

  await Chapter.findByIdAndDelete(req.params.id);

  const response: ApiResponse = {
    success: true,
    message: 'Chapter deleted successfully'
  };

  res.status(200).json(response);
});

// @desc    Update reading progress
// @route   POST /api/chapters/:id/progress
// @access  Private
export const updateReadingProgress = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { progress } = req.body;
  const userId = req.user!._id;

  if (progress < 0 || progress > 100) {
    return next(createError('Progress must be between 0 and 100', 400));
  }

  const chapter = await Chapter.findById(id);
  if (!chapter) {
    return next(createError('Chapter not found', 404));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(createError('User not found', 404));
  }

  // Update or create reading history entry
  const historyIndex = user.readingHistory.findIndex(
    h => h.novelId.toString() === chapter.novelId.toString()
  );

  if (historyIndex > -1) {
    user.readingHistory[historyIndex].chapterId = chapter._id;
    user.readingHistory[historyIndex].progress = progress;
    user.readingHistory[historyIndex].lastRead = new Date();
  } else {
    user.readingHistory.push({
      novelId: chapter.novelId,
      chapterId: chapter._id,
      progress,
      lastRead: new Date()
    });
  }

  await user.save();

  const response: ApiResponse = {
    success: true,
    data: { progress },
    message: 'Reading progress updated successfully'
  };

  res.status(200).json(response);
});
import { Request, Response, NextFunction } from 'express';
import Novel, { INovel } from '../models/Novel';
import { Genre } from '../models/Novel';
import Chapter from '../models/Chapter';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { ApiResponse, PaginatedResponse, SearchFilters } from '@shared/types';

// @desc    Get all novels with filters and pagination
// @route   GET /api/novels
// @access  Public
export const getNovels = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const {
    page = 1,
    limit = 12,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    country,
    status,
    genres,
    rating,
    language = 'ar'
  } = req.query;

  // Build filter object
  const filter: any = { isActive: true };

  if (country) filter.country = country;
  if (status) filter.status = status;
  if (rating) filter.rating = { $gte: parseFloat(rating as string) };

  if (genres) {
    const genreArray = (genres as string).split(',');
    filter.genres = { $in: genreArray };
  }

  // Build sort object
  const sort: any = {};
  sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

  // Calculate pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Execute query
  const novels = await Novel.find(filter)
    .populate('genres', 'name slug color')
    .sort(sort)
    .skip(skip)
    .limit(limitNum)
    .lean();

  const total = await Novel.countDocuments(filter);
  const totalPages = Math.ceil(total / limitNum);

  const response: PaginatedResponse<INovel> = {
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

// @desc    Get single novel
// @route   GET /api/novels/:id
// @access  Public
export const getNovel = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const novel = await Novel.findById(req.params.id)
    .populate('genres', 'name slug color')
    .populate({
      path: 'chapters',
      match: { isPublished: true },
      select: 'title chapterNumber publishedAt views',
      options: { sort: { chapterNumber: 1 } }
    });

  if (!novel || !novel.isActive) {
    return next(createError('Novel not found', 404));
  }

  // Increment views
  await novel.incrementViews();

  const response: ApiResponse = {
    success: true,
    data: novel,
    message: 'Novel retrieved successfully'
  };

  res.status(200).json(response);
});

// @desc    Create new novel
// @route   POST /api/novels
// @access  Private (Admin/Moderator)
export const createNovel = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const novelData = req.body;

  // Generate slug from title
  const slug = novelData.title.en
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Check if slug already exists
  const existingNovel = await Novel.findOne({ slug });
  if (existingNovel) {
    return next(createError('A novel with this title already exists', 400));
  }

  const novel = await Novel.create({
    ...novelData,
    slug
  });

  await novel.populate('genres', 'name slug color');

  const response: ApiResponse = {
    success: true,
    data: novel,
    message: 'Novel created successfully'
  };

  res.status(201).json(response);
});

// @desc    Update novel
// @route   PUT /api/novels/:id
// @access  Private (Admin/Moderator)
export const updateNovel = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const novel = await Novel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('genres', 'name slug color');

  if (!novel) {
    return next(createError('Novel not found', 404));
  }

  const response: ApiResponse = {
    success: true,
    data: novel,
    message: 'Novel updated successfully'
  };

  res.status(200).json(response);
});

// @desc    Delete novel
// @route   DELETE /api/novels/:id
// @access  Private (Admin)
export const deleteNovel = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const novel = await Novel.findByIdAndDelete(req.params.id);

  if (!novel) {
    return next(createError('Novel not found', 404));
  }

  // Also delete associated chapters
  await Chapter.deleteMany({ novelId: req.params.id });

  const response: ApiResponse = {
    success: true,
    message: 'Novel deleted successfully'
  };

  res.status(200).json(response);
});

// @desc    Get novels by country
// @route   GET /api/novels/country/:country
// @access  Public
export const getNovelsByCountry = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { country } = req.params;
  const { page = 1, limit = 12 } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const novels = await Novel.find({ 
    country, 
    isActive: true 
  })
    .populate('genres', 'name slug color')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Novel.countDocuments({ country, isActive: true });
  const totalPages = Math.ceil(total / limitNum);

  const response: PaginatedResponse<INovel> = {
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
    message: `Novels from ${country} retrieved successfully`
  };

  res.status(200).json(response);
});

// @desc    Get novels by genre
// @route   GET /api/novels/genre/:genre
// @access  Public
export const getNovelsByGenre = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { genre } = req.params;
  const { page = 1, limit = 12 } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const novels = await Novel.find({ 
    genres: genre, 
    isActive: true 
  })
    .populate('genres', 'name slug color')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Novel.countDocuments({ genres: genre, isActive: true });
  const totalPages = Math.ceil(total / limitNum);

  const response: PaginatedResponse<INovel> = {
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
    message: `Novels in ${genre} genre retrieved successfully`
  };

  res.status(200).json(response);
});

// @desc    Get popular novels
// @route   GET /api/novels/popular
// @access  Public
export const getPopularNovels = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { limit = 10 } = req.query;
  const limitNum = parseInt(limit as string);

  const novels = await Novel.find({ 
    isActive: true,
    isPopular: true 
  })
    .populate('genres', 'name slug color')
    .sort({ views: -1, favorites: -1 })
    .limit(limitNum);

  const response: ApiResponse = {
    success: true,
    data: novels,
    message: 'Popular novels retrieved successfully'
  };

  res.status(200).json(response);
});

// @desc    Get featured novels
// @route   GET /api/novels/featured
// @access  Public
export const getFeaturedNovels = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { limit = 6 } = req.query;
  const limitNum = parseInt(limit as string);

  const novels = await Novel.find({ 
    isActive: true,
    isFeatured: true 
  })
    .populate('genres', 'name slug color')
    .sort({ createdAt: -1 })
    .limit(limitNum);

  const response: ApiResponse = {
    success: true,
    data: novels,
    message: 'Featured novels retrieved successfully'
  };

  res.status(200).json(response);
});

// @desc    Search novels
// @route   GET /api/novels/search
// @access  Public
export const searchNovels = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { q, page = 1, limit = 12 } = req.query;

  if (!q || (q as string).trim().length < 2) {
    return next(createError('Search query must be at least 2 characters long', 400));
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const searchQuery = {
    $and: [
      { isActive: true },
      {
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { author: { $regex: q, $options: 'i' } },
          { tags: { $regex: q, $options: 'i' } }
        ]
      }
    ]
  };

  const novels = await Novel.find(searchQuery)
    .populate('genres', 'name slug color')
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Novel.countDocuments(searchQuery);
  const totalPages = Math.ceil(total / limitNum);

  const response: PaginatedResponse<INovel> = {
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
    message: `Search results for "${q}"`
  };

  res.status(200).json(response);
});

// @desc    Toggle favorite novel
// @route   POST /api/novels/:id/favorite
// @access  Private
export const toggleFavorite = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const novelId = req.params.id;
  const userId = req.user!._id;

  const novel = await Novel.findById(novelId);
  if (!novel) {
    return next(createError('Novel not found', 404));
  }

  const user = req.user!;
  const isFavorite = user.favorites.includes(novelId);

  if (isFavorite) {
    user.favorites = user.favorites.filter(id => id.toString() !== novelId);
    novel.favorites -= 1;
  } else {
    user.favorites.push(novelId);
    novel.favorites += 1;
  }

  await Promise.all([user.save(), novel.save()]);

  const response: ApiResponse = {
    success: true,
    data: {
      isFavorite: !isFavorite,
      favoritesCount: novel.favorites
    },
    message: isFavorite ? 'Removed from favorites' : 'Added to favorites'
  };

  res.status(200).json(response);
});

// @desc    Get user's favorite novels
// @route   GET /api/novels/user/favorites
// @access  Private
export const getFavorites = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { page = 1, limit = 12 } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const user = req.user!;
  const novels = await Novel.find({
    _id: { $in: user.favorites },
    isActive: true
  })
    .populate('genres', 'name slug color')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = user.favorites.length;
  const totalPages = Math.ceil(total / limitNum);

  const response: PaginatedResponse<INovel> = {
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
    message: 'Favorite novels retrieved successfully'
  };

  res.status(200).json(response);
});
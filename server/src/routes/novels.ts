import express from 'express';
import { query, param } from 'express-validator';
import { 
  getNovels, 
  getNovel, 
  createNovel, 
  updateNovel, 
  deleteNovel,
  getNovelsByCountry,
  getNovelsByGenre,
  getPopularNovels,
  getFeaturedNovels,
  searchNovels,
  toggleFavorite,
  getFavorites
} from '../controllers/novelController';
import { protect, authorize, optionalAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

// Validation rules
const getNovelsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('sortBy').optional().isIn(['title', 'rating', 'views', 'favorites', 'createdAt', 'updatedAt']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('country').optional().isIn(['korean', 'chinese', 'japanese', 'other']).withMessage('Invalid country'),
  query('status').optional().isIn(['ongoing', 'completed', 'hiatus', 'dropped']).withMessage('Invalid status'),
  query('genres').optional().isString().withMessage('Genres must be a string'),
  query('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5')
];

const novelIdValidation = [
  param('id').isMongoId().withMessage('Invalid novel ID')
];

// Public routes
router.get('/', getNovelsValidation, validateRequest, optionalAuth, getNovels);
router.get('/search', optionalAuth, searchNovels);
router.get('/popular', optionalAuth, getPopularNovels);
router.get('/featured', optionalAuth, getFeaturedNovels);
router.get('/country/:country', optionalAuth, getNovelsByCountry);
router.get('/genre/:genre', optionalAuth, getNovelsByGenre);
router.get('/:id', novelIdValidation, validateRequest, optionalAuth, getNovel);

// Protected routes
router.post('/:id/favorite', protect, novelIdValidation, validateRequest, toggleFavorite);
router.get('/user/favorites', protect, getFavorites);

// Admin routes
router.post('/', protect, authorize('admin', 'moderator'), createNovel);
router.put('/:id', protect, authorize('admin', 'moderator'), novelIdValidation, validateRequest, updateNovel);
router.delete('/:id', protect, authorize('admin'), novelIdValidation, validateRequest, deleteNovel);

export default router;
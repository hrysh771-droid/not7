import express from 'express';
import { body, param, query } from 'express-validator';
import { 
  getChapters, 
  getChapter, 
  createChapter, 
  updateChapter, 
  deleteChapter,
  getChapterContent,
  updateReadingProgress
} from '../controllers/chapterController';
import { protect, authorize, optionalAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

// Validation rules
const chapterIdValidation = [
  param('id').isMongoId().withMessage('Invalid chapter ID')
];

const novelIdValidation = [
  param('novelId').isMongoId().withMessage('Invalid novel ID')
];

const createChapterValidation = [
  body('title.ar').notEmpty().withMessage('Arabic title is required'),
  body('title.en').notEmpty().withMessage('English title is required'),
  body('content.ar').notEmpty().withMessage('Arabic content is required'),
  body('content.en').notEmpty().withMessage('English content is required'),
  body('chapterNumber').isInt({ min: 1 }).withMessage('Chapter number must be a positive integer')
];

const updateChapterValidation = [
  body('title.ar').optional().notEmpty().withMessage('Arabic title cannot be empty'),
  body('title.en').optional().notEmpty().withMessage('English title cannot be empty'),
  body('content.ar').optional().notEmpty().withMessage('Arabic content cannot be empty'),
  body('content.en').optional().notEmpty().withMessage('English content cannot be empty'),
  body('chapterNumber').optional().isInt({ min: 1 }).withMessage('Chapter number must be a positive integer')
];

const getChaptersValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('published').optional().isBoolean().withMessage('Published must be a boolean')
];

// Public routes
router.get('/novel/:novelId', novelIdValidation, validateRequest, optionalAuth, getChapters);
router.get('/:id', chapterIdValidation, validateRequest, optionalAuth, getChapter);
router.get('/:id/content', chapterIdValidation, validateRequest, optionalAuth, getChapterContent);

// Protected routes
router.post('/:id/progress', protect, chapterIdValidation, validateRequest, updateReadingProgress);

// Admin routes
router.post('/novel/:novelId', protect, authorize('admin', 'moderator'), novelIdValidation, validateRequest, createChapter);
router.put('/:id', protect, authorize('admin', 'moderator'), chapterIdValidation, validateRequest, updateChapter);
router.delete('/:id', protect, authorize('admin'), chapterIdValidation, validateRequest, deleteChapter);

export default router;
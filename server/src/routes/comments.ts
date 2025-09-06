import express from 'express';
import { body, param, query } from 'express-validator';
import { 
  getComments, 
  createComment, 
  updateComment, 
  deleteComment,
  likeComment,
  dislikeComment
} from '../controllers/commentController';
import { protect, optionalAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

// Validation rules
const commentIdValidation = [
  param('id').isMongoId().withMessage('Invalid comment ID')
];

const novelIdValidation = [
  param('novelId').isMongoId().withMessage('Invalid novel ID')
];

const createCommentValidation = [
  body('content').notEmpty().withMessage('Comment content is required')
    .isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
];

const getCommentsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('approved').optional().isBoolean().withMessage('Approved must be a boolean')
];

// Public routes
router.get('/novel/:novelId', novelIdValidation, validateRequest, optionalAuth, getComments);

// Protected routes
router.post('/novel/:novelId', protect, novelIdValidation, validateRequest, createComment);
router.put('/:id', protect, commentIdValidation, validateRequest, updateComment);
router.delete('/:id', protect, commentIdValidation, validateRequest, deleteComment);
router.post('/:id/like', protect, commentIdValidation, validateRequest, likeComment);
router.post('/:id/dislike', protect, commentIdValidation, validateRequest, dislikeComment);

export default router;
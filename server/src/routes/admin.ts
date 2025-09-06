import express from 'express';
import { 
  getDashboardStats, 
  getUsers, 
  getNovels, 
  getComments,
  approveComment,
  rejectComment,
  deleteComment,
  createGenre,
  updateGenre,
  deleteGenre,
  getGenres
} from '../controllers/adminController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// All admin routes require authentication and admin/moderator role
router.use(protect);
router.use(authorize('admin', 'moderator'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Users management
router.get('/users', getUsers);

// Novels management
router.get('/novels', getNovels);

// Comments management
router.get('/comments', getComments);
router.put('/comments/:id/approve', approveComment);
router.put('/comments/:id/reject', rejectComment);
router.delete('/comments/:id', deleteComment);

// Genres management
router.get('/genres', getGenres);
router.post('/genres', createGenre);
router.put('/genres/:id', updateGenre);
router.delete('/genres/:id', deleteGenre);

export default router;
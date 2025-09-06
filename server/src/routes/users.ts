import express from 'express';
import { getUsers, getUser, updateUser, deleteUser, getUserStats } from '../controllers/userController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect);

// User routes
router.get('/stats', getUserStats);
router.get('/:id', getUser);
router.put('/:id', updateUser);

// Admin routes
router.get('/', authorize('admin', 'moderator'), getUsers);
router.delete('/:id', authorize('admin'), deleteUser);

export default router;
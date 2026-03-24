import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/stats', getDashboardStats);

export default router;

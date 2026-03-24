import { Router } from 'express';
import { getAllUsers, updateUser } from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN']));

router.get('/', getAllUsers);
router.patch('/:id', updateUser);

export default router;

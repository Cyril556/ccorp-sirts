import { Router } from 'express';
import {
  getAllIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident,
  addComment,
} from '../controllers/incident.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getAllIncidents);
router.get('/:id', getIncidentById);
router.post('/', createIncident);
router.patch('/:id', updateIncident);
router.delete('/:id', roleMiddleware(['ADMIN']), deleteIncident);
router.post('/:id/comments', addComment);

export default router;

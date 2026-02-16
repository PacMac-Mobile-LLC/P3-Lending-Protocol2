import { Router, Request, Response } from 'express';
import { UserController } from '../controllers/userController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

// Trust Score Endpoint
router.get('/:user_id/trust', UserController.getUserTrust);

router.get('/', UserController.getCurrentUser);
router.get('/:id', UserController.getUserById);
router.patch('/:id', UserController.updateUser);

export default router;

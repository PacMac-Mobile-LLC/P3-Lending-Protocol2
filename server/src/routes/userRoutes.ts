import { Router, Request, Response } from 'express';
import { UserController } from '../controllers/userController';

const router = Router();

// Trust Score Endpoint
router.get('/:user_id/trust', UserController.getUserTrust);

// Placeholder endpoints
router.get('/', (req: Request, res: Response) => res.json({ message: 'User retrieval route' }));
router.get('/:id', (req: Request, res: Response) => res.json({ message: 'Single user details route' }));
router.patch('/:id', (req: Request, res: Response) => res.json({ message: 'User update route' }));

export default router;

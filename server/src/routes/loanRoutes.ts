import { Router, Request, Response } from 'express';

const router = Router();

// Placeholder endpoints
router.get('/', (req: Request, res: Response) => res.json({ message: 'Active loans list route' }));
router.post('/request', (req: Request, res: Response) => res.json({ message: 'Loan request submission route' }));
router.post('/repay', (req: Request, res: Response) => res.json({ message: 'Loan repayment route' }));

export default router;

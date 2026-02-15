import { Router } from 'express';
import { LoanController } from '../controllers/loanController';
import { sensitiveApiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Gated Loan Request
router.post('/request', sensitiveApiLimiter, LoanController.requestLoan);

// Placeholder endpoints
router.get('/', (req, res) => res.json({ message: 'Active loans list route' }));
router.post('/repay', (req, res) => res.json({ message: 'Loan repayment route' }));

export default router;

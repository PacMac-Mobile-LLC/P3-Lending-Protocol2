import { Router } from 'express';
import { LoanController } from '../controllers/loanController';
import { sensitiveApiLimiter, publicApiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Gated Loan Request
router.post('/request', sensitiveApiLimiter, LoanController.requestLoan);

// Production endpoints with rate limiting
router.get('/', publicApiLimiter, (req, res) => res.json({ message: 'Active loans list route' }));
router.post('/repay', sensitiveApiLimiter, (req, res) => res.json({ message: 'Loan repayment route' }));

export default router;

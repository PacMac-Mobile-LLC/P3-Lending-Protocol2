import { Router } from 'express';
import { LoanController } from '../controllers/loanController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', LoanController.listLoans);
router.post('/request', LoanController.createRequest);
router.post('/repay', LoanController.repayLoan);

export default router;

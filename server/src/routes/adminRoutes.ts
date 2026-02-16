import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { requireAuth, requireRoles } from '../middleware/auth';

const router = Router();

router.use(requireAuth);
router.use(requireRoles('admin', 'risk_officer', 'service_role'));

router.get('/stats', AdminController.getStats);
router.post('/override', AdminController.createOverride);
router.get('/audit', AdminController.getAuditLogs);

export default router;

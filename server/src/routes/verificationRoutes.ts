import { Router } from 'express';
import { VerificationController } from '../controllers/verificationController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Hash Verification Endpoint
router.post('/hash', VerificationController.verifyHash);

router.post('/kyc', requireAuth, VerificationController.submitKYC);
router.get('/status/:userId', requireAuth, VerificationController.getStatus);
router.post('/attestation', requireAuth, VerificationController.createAttestation);

export default router;

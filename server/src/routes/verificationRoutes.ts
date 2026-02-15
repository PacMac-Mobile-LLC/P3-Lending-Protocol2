import { Router } from 'express';
import { VerificationController } from '../controllers/verificationController';
import { sensitiveApiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Full Bridge Verification (Snapshot -> Reconstructed Hash -> Ethereum Anchor)
router.get('/user/:user_id', sensitiveApiLimiter, VerificationController.verifyUserSnapshot);

// Hash Verification Endpoint (Internal Lookup)
router.post('/hash', sensitiveApiLimiter, VerificationController.verifyHash);

// Placeholder endpoints
router.post('/kyc', (req, res) => res.json({ message: 'KYC submission route' }));
router.get('/status/:userId', (req, res) => res.json({ message: 'Verification status check' }));
router.post('/attestation', (req, res) => res.json({ message: 'Snapshot attestation anchor route' }));

export default router;

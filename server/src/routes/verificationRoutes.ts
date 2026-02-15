import { Router } from 'express';
import { VerificationController } from '../controllers/verificationController';

const router = Router();

// Hash Verification Endpoint
router.post('/hash', VerificationController.verifyHash);

// Placeholder endpoints
router.post('/kyc', (req, res) => res.json({ message: 'KYC submission route' }));
router.get('/status/:userId', (req, res) => res.json({ message: 'Verification status check' }));
router.post('/attestation', (req, res) => res.json({ message: 'Snapshot attestation anchor route' }));

export default router;

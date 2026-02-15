import { Request, Response, NextFunction } from 'express';
import { VerificationService } from '../services/verificationService';

export const VerificationController = {
    /**
     * POST /api/verification/hash
     * Validates a snapshot hash against the reputation engine.
     */
    verifyHash: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { snapshot_hash } = req.body;

            if (!snapshot_hash) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing snapshot_hash in request body.'
                });
            }

            // 1. Call Service
            const result = await VerificationService.verifySnapshotHash(snapshot_hash);

            // 2. Return Response
            return res.status(200).json({
                success: true,
                data: {
                    is_valid: result.isValid,
                    snapshot_time: result.snapshotTime
                }
            });
        } catch (error) {
            next(error);
        }
    }
};

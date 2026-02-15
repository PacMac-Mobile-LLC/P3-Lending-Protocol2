import { Request, Response, NextFunction } from 'express';
import { validate as uuidValidate, version as uuidVersion } from 'uuid';
import { VerificationService } from '../services/verificationService';
import { ApiResponse } from '../types/api';

const isValidUUIDv4 = (id: string) => uuidValidate(id) && uuidVersion(id) === 4;

export const VerificationController = {
    /**
     * GET /api/verification/user/:user_id
     * Full bridge verification: DB Snapshot -> Reconstructed Hash -> Ethereum Anchor.
     */
    verifyUserSnapshot: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user_id } = req.params;

            if (!isValidUUIDv4(user_id)) {
                const errorResponse: ApiResponse = {
                    success: false,
                    error: 'Invalid User ID format. UUID v4 expected.'
                };
                return res.status(400).json(errorResponse);
            }

            const result = await VerificationService.verifyTrustSnapshot(user_id);

            const successResponse: ApiResponse = {
                success: true,
                data: {
                    verified: result.verified,
                    local_hash: result.localHash,
                    onchain_hash: result.onChainHash
                }
            };
            return res.status(200).json(successResponse);
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/verification/hash
     * Validates a snapshot hash directly against the database (internal lookup).
     */
    verifyHash: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { snapshot_hash } = req.body;

            if (!snapshot_hash) {
                const errorResponse: ApiResponse = {
                    success: false,
                    error: 'Missing snapshot_hash in request body.'
                };
                return res.status(400).json(errorResponse);
            }

            // 1. Call Service
            const result = await VerificationService.verifySnapshotHash(snapshot_hash);

            // 2. Return Response
            const successResponse: ApiResponse = {
                success: true,
                data: {
                    is_valid: result.isValid,
                    snapshot_time: result.snapshotTime
                }
            };
            return res.status(200).json(successResponse);
        } catch (error) {
            next(error);
        }
    }
};

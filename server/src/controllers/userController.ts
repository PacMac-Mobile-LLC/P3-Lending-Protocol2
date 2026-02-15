import { Request, Response, NextFunction } from 'express';
import { validate as uuidValidate, version as uuidVersion } from 'uuid';
import { TrustService } from '../services/trustService';
import { ApiResponse } from '../types/api';

const isValidUUIDv4 = (id: string) => uuidValidate(id) && uuidVersion(id) === 4;

export const UserController = {
    /**
     * GET /api/users/:user_id/trust
     * Retrieves latest trust score snapshot for a user.
     */
    getUserTrust: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user_id } = req.params;

            // 1. Validate UUID
            if (!isValidUUIDv4(user_id)) {
                const errorResponse: ApiResponse = {
                    success: false,
                    error: 'Invalid User ID format. UUID v4 expected.'
                };
                return res.status(400).json(errorResponse);
            }

            // 2. Fetch from Service
            const snapshot = await TrustService.getLatestTrustSnapshot(user_id);

            // 3. Handle Not Found
            if (!snapshot) {
                const errorResponse: ApiResponse = {
                    success: false,
                    error: 'No trust score snapshot found for this user.'
                };
                return res.status(404).json(errorResponse);
            }

            // 4. Return Data
            const successResponse: ApiResponse = {
                success: true,
                data: {
                    trust_score: snapshot.score,
                    risk_tier: snapshot.risk_tier,
                    snapshot_time: snapshot.snapshot_time,
                    model_version: snapshot.model_version,
                    feature_vector_hash: snapshot.feature_vector_hash,
                    wallet_address: snapshot.wallet_address
                }
            };
            return res.status(200).json(successResponse);
        } catch (error) {
            next(error);
        }
    }
};

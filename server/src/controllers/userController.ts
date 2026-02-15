import { Request, Response, NextFunction } from 'express';
import { TrustService } from '../services/trustService';

// Simple UUID v4 regex validation
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const UserController = {
    /**
     * GET /api/users/:user_id/trust
     * Retrieves latest trust score snapshot for a user.
     */
    getUserTrust: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user_id } = req.params;

            // 1. Validate UUID
            if (!UUID_V4_REGEX.test(user_id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid User ID format. UUID v4 expected.'
                });
            }

            // 2. Fetch from Service
            const snapshot = await TrustService.getLatestTrustSnapshot(user_id);

            // 3. Handle Not Found
            if (!snapshot) {
                return res.status(404).json({
                    success: false,
                    error: 'No trust score snapshot found for this user.'
                });
            }

            // 4. Return Data
            return res.status(200).json({
                success: true,
                data: {
                    trust_score: snapshot.score,
                    risk_tier: snapshot.risk_tier,
                    snapshot_time: snapshot.snapshot_time,
                    model_version: snapshot.model_version,
                    feature_vector_hash: snapshot.feature_vector_hash
                }
            });
        } catch (error) {
            next(error);
        }
    }
};

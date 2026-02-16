import { Request, Response, NextFunction } from 'express';
import { VerificationService } from '../services/verificationService';

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isSelfOrPrivileged = (req: Request, targetUserId: string) => {
    const requesterId = req.auth?.userId;
    const roles = req.auth?.roles || [];

    return (
        requesterId === targetUserId ||
        roles.includes('admin') ||
        roles.includes('service_role') ||
        roles.includes('risk_officer')
    );
};

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

            const result = await VerificationService.verifySnapshotHash(snapshot_hash, req.accessToken);

            return res.status(200).json({
                success: true,
                data: {
                    is_valid: result.isValid,
                    is_chain_verified: result.isChainVerified,
                    snapshot_time: result.snapshotTime
                }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/verification/kyc
     */
    submitKYC: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.auth?.userId;
            const { requested_tier, provider, raw_response } = req.body || {};

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthenticated request.',
                });
            }

            if (typeof requested_tier !== 'number' || requested_tier < 0) {
                return res.status(400).json({
                    success: false,
                    error: 'requested_tier must be a non-negative number.',
                });
            }

            const updatedUser = await VerificationService.submitKYC(
                {
                    userId,
                    requestedTier: requested_tier,
                    provider,
                    rawResponse: raw_response,
                },
                req.accessToken
            );

            return res.status(200).json({
                success: true,
                data: updatedUser,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/verification/status/:userId
     */
    getStatus: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.params;

            if (!UUID_V4_REGEX.test(userId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid User ID format. UUID v4 expected.',
                });
            }

            if (!isSelfOrPrivileged(req, userId)) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden: cannot access another user verification status.',
                });
            }

            const status = await VerificationService.getVerificationStatus(userId, req.accessToken);

            if (!status) {
                return res.status(404).json({
                    success: false,
                    error: 'Verification status not found for this user.',
                });
            }

            return res.status(200).json({
                success: true,
                data: status,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/verification/attestation
     */
    createAttestation: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const actorId = req.auth?.userId;
            const { user_id, snapshot_hash, note } = req.body || {};

            if (!actorId) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthenticated request.',
                });
            }

            if (!user_id || !UUID_V4_REGEX.test(user_id)) {
                return res.status(400).json({
                    success: false,
                    error: 'user_id must be a valid UUID v4.',
                });
            }

            if (!isSelfOrPrivileged(req, user_id)) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden: cannot attest snapshot for another user.',
                });
            }

            if (!snapshot_hash || typeof snapshot_hash !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'snapshot_hash must be provided.',
                });
            }

            const attestation = await VerificationService.createAttestation(
                {
                    actorId,
                    userId: user_id,
                    snapshotHash: snapshot_hash,
                    note,
                },
                req.accessToken
            );

            return res.status(201).json({
                success: true,
                data: attestation,
            });
        } catch (error) {
            next(error);
        }
    },
};

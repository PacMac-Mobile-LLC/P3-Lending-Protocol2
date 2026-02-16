import { Request, Response, NextFunction } from 'express';
import { TrustService } from '../services/trustService';
import { UserService } from '../services/userService';

// Simple UUID v4 regex validation
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

export const UserController = {
    /**
     * GET /api/users/:user_id/trust
     * Retrieves latest trust score snapshot for a user.
     */
    getUserTrust: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user_id } = req.params;

            if (!UUID_V4_REGEX.test(user_id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid User ID format. UUID v4 expected.'
                });
            }

            if (!isSelfOrPrivileged(req, user_id)) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden: cannot access trust snapshot for another user.',
                });
            }

            const snapshot = await TrustService.getLatestTrustSnapshot(user_id, req.accessToken);

            if (!snapshot) {
                return res.status(404).json({
                    success: false,
                    error: 'No trust score snapshot found for this user.'
                });
            }

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
    },

    /**
     * GET /api/users
     * Returns profile for current authenticated user.
     */
    getCurrentUser: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const currentUserId = req.auth?.userId;

            if (!currentUserId) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthenticated request.',
                });
            }

            const user = await UserService.getUserById(currentUserId, req.accessToken);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User profile not found.',
                });
            }

            return res.status(200).json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/users/:id
     * Returns user profile by id (self or privileged roles only).
     */
    getUserById: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;

            if (!UUID_V4_REGEX.test(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid User ID format. UUID v4 expected.'
                });
            }

            if (!isSelfOrPrivileged(req, id)) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden: cannot access another user profile.',
                });
            }

            const user = await UserService.getUserById(id, req.accessToken);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User profile not found.',
                });
            }

            return res.status(200).json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PATCH /api/users/:id
     * Updates allowed user profile fields for self or privileged roles.
     */
    updateUser: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { wallet_address } = req.body || {};

            if (!UUID_V4_REGEX.test(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid User ID format. UUID v4 expected.'
                });
            }

            if (!isSelfOrPrivileged(req, id)) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden: cannot update another user profile.',
                });
            }

            if (wallet_address && typeof wallet_address !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'wallet_address must be a string when provided.',
                });
            }

            const updatedUser = await UserService.updateUserById(
                id,
                { wallet_address: wallet_address ?? null },
                req.accessToken
            );

            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    error: 'User profile not found.',
                });
            }

            return res.status(200).json({
                success: true,
                data: updatedUser,
            });
        } catch (error) {
            next(error);
        }
    },
};

import { NextFunction, Request, Response } from 'express';
import { AdminService } from '../services/adminService';

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const AdminController = {
    /**
     * GET /api/admin/stats
     */
    getStats: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const stats = await AdminService.getProtocolStats();
            return res.status(200).json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/admin/override
     */
    createOverride: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const actorId = req.auth?.userId;
            const {
                user_id,
                score,
                risk_tier,
                model_version,
                feature_vector_hash,
                reason,
                snapshot_time,
            } = req.body || {};

            if (!actorId) {
                return res.status(401).json({ success: false, error: 'Unauthenticated request.' });
            }

            if (!user_id || !UUID_V4_REGEX.test(user_id)) {
                return res.status(400).json({ success: false, error: 'user_id must be a valid UUID v4.' });
            }

            if (typeof score !== 'number' || score < 0 || score > 100) {
                return res.status(400).json({ success: false, error: 'score must be between 0 and 100.' });
            }

            if (typeof risk_tier !== 'number' || risk_tier < 0) {
                return res.status(400).json({ success: false, error: 'risk_tier must be a non-negative number.' });
            }

            if (!model_version || typeof model_version !== 'string') {
                return res.status(400).json({ success: false, error: 'model_version is required.' });
            }

            if (!feature_vector_hash || typeof feature_vector_hash !== 'string') {
                return res.status(400).json({ success: false, error: 'feature_vector_hash is required.' });
            }

            if (!reason || typeof reason !== 'string') {
                return res.status(400).json({ success: false, error: 'reason is required for manual override.' });
            }

            const snapshot = await AdminService.createScoreOverride({
                actorId,
                userId: user_id,
                score,
                riskTier: risk_tier,
                modelVersion: model_version,
                featureVectorHash: feature_vector_hash,
                snapshotTime: snapshot_time,
                reason,
            });

            return res.status(201).json({ success: true, data: snapshot });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/admin/audit
     */
    getAuditLogs: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limitRaw = typeof req.query.limit === 'string' ? Number(req.query.limit) : 50;
            const offsetRaw = typeof req.query.offset === 'string' ? Number(req.query.offset) : 0;
            const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(200, limitRaw)) : 50;
            const offset = Number.isFinite(offsetRaw) ? Math.max(0, offsetRaw) : 0;

            const logs = await AdminService.getAuditLogs(limit, offset);

            return res.status(200).json({
                success: true,
                data: logs,
                meta: { limit, offset },
            });
        } catch (error) {
            next(error);
        }
    },
};

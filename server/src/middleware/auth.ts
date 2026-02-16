import { NextFunction, Request, Response } from 'express';
import { resolveAuthUser } from '../config/supabase';

const TEST_USER_ID_HEADER = 'x-test-user-id';
const TEST_USER_ROLES_HEADER = 'x-test-user-roles';

const parseBearerToken = (authorizationHeader?: string) => {
    if (!authorizationHeader) return null;
    const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
    return match ? match[1] : null;
};

const getRolesFromUser = (user: any): string[] => {
    const roles = new Set<string>();

    if (typeof user?.role === 'string') {
        roles.add(user.role.toLowerCase());
    }

    const appMetadata = user?.app_metadata || {};

    if (typeof appMetadata?.role === 'string') {
        roles.add(appMetadata.role.toLowerCase());
    }

    const p3Roles = appMetadata?.p3_roles ?? appMetadata?.roles;
    if (Array.isArray(p3Roles)) {
        p3Roles.forEach((role) => roles.add(String(role).toLowerCase()));
    } else if (typeof p3Roles === 'string') {
        roles.add(p3Roles.toLowerCase());
    }

    return Array.from(roles);
};

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Deterministic auth bypass for test runtime only.
        if (process.env.NODE_ENV === 'test') {
            const testUserId = req.header(TEST_USER_ID_HEADER);
            if (testUserId) {
                const roleHeader = req.header(TEST_USER_ROLES_HEADER);
                const roles = roleHeader
                    ? roleHeader.split(',').map((role) => role.trim().toLowerCase()).filter(Boolean)
                    : ['authenticated'];

                req.auth = {
                    userId: testUserId,
                    email: `${testUserId}@test.local`,
                    roles,
                };
                req.accessToken = 'test-access-token';
                return next();
            }
        }

        const accessToken = parseBearerToken(req.header('authorization'));

        if (!accessToken) {
            return res.status(401).json({
                success: false,
                error: 'Missing bearer token.',
            });
        }

        const { data, error } = await resolveAuthUser(accessToken);

        if (error || !data?.user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired auth token.',
            });
        }

        req.auth = {
            userId: data.user.id,
            email: data.user.email ?? null,
            roles: getRolesFromUser(data.user),
            rawUser: data.user,
        };
        req.accessToken = accessToken;

        return next();
    } catch (error) {
        return next(error);
    }
};

export const requireRoles = (...allowedRoles: string[]) => {
    const normalizedAllowed = allowedRoles.map((role) => role.toLowerCase());

    return (req: Request, res: Response, next: NextFunction) => {
        const assignedRoles = req.auth?.roles || [];
        const isAuthorized = assignedRoles.some((role) => normalizedAllowed.includes(role));

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden: insufficient role privileges.',
            });
        }

        return next();
    };
};

export const requireSelfOrRole = (paramName: string, ...allowedRoles: string[]) => {
    const normalizedAllowed = allowedRoles.map((role) => role.toLowerCase());

    return (req: Request, res: Response, next: NextFunction) => {
        const targetUserId = req.params[paramName];
        const currentUserId = req.auth?.userId;

        if (!currentUserId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthenticated request.',
            });
        }

        if (targetUserId === currentUserId) {
            return next();
        }

        const assignedRoles = req.auth?.roles || [];
        const isRoleAuthorized = assignedRoles.some((role) => normalizedAllowed.includes(role));

        if (!isRoleAuthorized) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden: cannot access another user resource.',
            });
        }

        return next();
    };
};

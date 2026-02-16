import rateLimit from 'express-rate-limit';
import { ApiResponse } from '../types/api';

/**
 * Creates a rate limiter middleware for specific routes.
 */
export const createRateLimiter = (maxRequests: number = 100, windowMinutes: number = 15) => {
    return rateLimit({
        windowMs: windowMinutes * 60 * 1000,
        max: maxRequests,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            error: `Too many requests, please try again after ${windowMinutes} minutes`
        } as ApiResponse
    });
};

// Default limiter profiles
export const authLimiter = createRateLimiter(5, 15); // Strict for auth
export const publicApiLimiter = createRateLimiter(200, 15); // Standard for public APIs
export const sensitiveApiLimiter = createRateLimiter(50, 15); // For data lookups (UUID enumeration prevention)

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/config';
import { errorHandler } from './middleware/errorHandler';
import logger from './utils/logger';

// Import Routes
import userRoutes from './routes/userRoutes';
import loanRoutes from './routes/loanRoutes';
import verificationRoutes from './routes/verificationRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();

// Trust proxy for Render/Load Balancers
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: config.allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Payload limits
app.use(express.json({
    limit: '1mb',
    verify: (req: any, res, buf) => {
        if (req.originalUrl.startsWith('/api/payments/webhook')) {
            req.rawBody = buf;
        }
    }
}));

// Logging Request Meta
app.use((req, res, next) => {
    logger.info({ method: req.method, url: req.url, ip: req.ip }, 'Incoming Request');
    next();
});

import { publicApiLimiter, sensitiveApiLimiter } from './middleware/rateLimiter';

import paymentRoutes from './routes/paymentRoutes';

// Routes
app.use('/api/users', publicApiLimiter, userRoutes);
app.use('/api/loans', publicApiLimiter, loanRoutes); // loanRoutes already has fine-grained limiters
app.use('/api/verification', sensitiveApiLimiter, verificationRoutes);
app.use('/api/admin', sensitiveApiLimiter, adminRoutes);
app.use('/api/payments', paymentRoutes);

// Health Check
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'active', timestamp: new Date().toISOString() });
});

// Serve Static Frontend Files (if building in container/production)
import path from 'path';
const publicPath = path.join(__dirname, '../../public');
app.use(express.static(publicPath));

// SPA Fallback: Redirect all other routes to index.html
app.get('*', (req: Request, res: Response, next: NextFunction) => {
    res.sendFile(path.join(publicPath, 'index.html'), (err) => {
        if (err) {
            // If index.html doesn't exist, just move to error handler
            next();
        }
    });
});

// Error handling
app.use(errorHandler);

app.listen(config.port, () => {
    logger.info(`P3 Backend running on port ${config.port} [${config.nodeEnv}]`);
});

export default app;

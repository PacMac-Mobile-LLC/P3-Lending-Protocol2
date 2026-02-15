import express, { Request, Response } from 'express';
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

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: config.allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Payload limits
app.use(express.json({ limit: '1mb' }));

// Logging Request Meta
app.use((req, res, next) => {
    logger.info({ method: req.method, url: req.url, ip: req.ip }, 'Incoming Request');
    next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'active', timestamp: new Date().toISOString() });
});

// Serve Static Frontend Files (if building in container/production)
import path from 'path';
const publicPath = path.join(__dirname, '../../public');
app.use(express.static(publicPath));

// SPA Fallback: Redirect all other routes to index.html
app.get('*', (req: Request, res: Response) => {
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

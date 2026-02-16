import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/config';
import { errorHandler } from './middleware/errorHandler';

// Import Routes (Placeholders)
import userRoutes from './routes/userRoutes';
import loanRoutes from './routes/loanRoutes';
import verificationRoutes from './routes/verificationRoutes';
import adminRoutes from './routes/adminRoutes';

export const createApp = () => {
    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json());

    // Routes
    app.use('/api/users', userRoutes);
    app.use('/api/loans', loanRoutes);
    app.use('/api/verification', verificationRoutes);
    app.use('/api/admin', adminRoutes);

    // Health Check
    app.get('/health', (req: Request, res: Response) => {
        res.json({ status: 'active', timestamp: new Date().toISOString() });
    });

    // Error handling
    app.use(errorHandler);

    return app;
};

const app = createApp();

if (process.env.NODE_ENV !== 'test') {
    app.listen(config.port, () => {
        console.log(`P3 Backend running on port ${config.port}`);
    });
}

export default app;

import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = z.object({
    PORT: z.string().default('5000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    SUPABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    ETH_RPC_URL: z.string().url().optional(),
    P3_PROTOCOL_ADDRESS: z.string().min(1).optional(),
    ALLOWED_ORIGINS: z.string().default('*'),
});

const env = envSchema.parse(process.env);

export const config = {
    port: parseInt(env.PORT, 10),
    nodeEnv: env.NODE_ENV,
    supabase: {
        url: env.SUPABASE_URL,
        serviceKey: env.SUPABASE_SERVICE_ROLE_KEY,
    },
    ethereum: {
        rpcUrl: env.ETH_RPC_URL || '',
        contractAddress: env.P3_PROTOCOL_ADDRESS || '',
    },
    allowedOrigins: env.ALLOWED_ORIGINS.split(',').map(o => o.trim()),
    isProd: env.NODE_ENV === 'production',
};

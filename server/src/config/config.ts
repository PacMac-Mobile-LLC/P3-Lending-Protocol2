import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from project root .env file
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const rawEnv = {
    ...process.env,
    SUPABASE_URL: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
};

const envSchema = z.object({
    PORT: z.string().default('5000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    SUPABASE_URL: z.string().url({ 
        message: "SUPABASE_URL is missing or invalid. Set it in Render Dashboard -> Settings -> Environment. Get it from Supabase Project Settings -> API." 
    }),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, { 
        message: "SUPABASE_SERVICE_ROLE_KEY is required for server operations. Set it in Render Dashboard -> Settings -> Environment. Get it from Supabase Project Settings -> API (Service Role key)." 
    }),
    STRIPE_SECRET_KEY: z.string().default(''),
    STRIPE_WEBHOOK_SECRET: z.string().default(''),
    ETH_RPC_URL: z.string().url().optional(),
    P3_PROTOCOL_ADDRESS: z.string().min(1).optional(),
    ALLOWED_ORIGINS: z.string().default('*'),
});

const env = envSchema.parse(rawEnv);

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
    stripe: {
        secretKey: env.STRIPE_SECRET_KEY || '',
        webhookSecret: env.STRIPE_WEBHOOK_SECRET || '',
    },
    allowedOrigins: env.ALLOWED_ORIGINS.split(',').map(o => o.trim()),
    isProd: env.NODE_ENV === 'production',
};

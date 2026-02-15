import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
    port: process.env.PORT || 5000,
    supabase: {
        url: process.env.SUPABASE_URL || '',
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    },
    ethereum: {
        rpcUrl: process.env.ETH_RPC_URL || '',
        contractAddress: process.env.P3_PROTOCOL_ADDRESS || '',
    },
    isProd: process.env.NODE_ENV === 'production',
};

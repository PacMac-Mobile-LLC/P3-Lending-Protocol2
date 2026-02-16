import { validatedEnv } from './env';

export const config = {
    port: validatedEnv.PORT,
    supabase: {
        url: validatedEnv.SUPABASE_URL,
        anonKey: validatedEnv.SUPABASE_ANON_KEY,
        serviceKey: validatedEnv.SUPABASE_SERVICE_ROLE_KEY,
    },
    ethereum: {
        rpcUrl: validatedEnv.ETH_RPC_URL,
        contractAddress: validatedEnv.P3_PROTOCOL_ADDRESS,
    },
    isProd: validatedEnv.NODE_ENV === 'production',
};

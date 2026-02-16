import { createClient } from '@supabase/supabase-js';
import { config } from './config';

if (!config.supabase.url || !config.supabase.serviceKey || !config.supabase.anonKey) {
    console.warn('Supabase configuration missing. Ensure SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are set.');
}

export const supabase = createClient(
    config.supabase.url,
    config.supabase.serviceKey
);

export const createRlsClient = (accessToken: string) =>
    createClient(config.supabase.url, config.supabase.anonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    });

export const resolveAuthUser = async (accessToken: string) => {
    const authClient = createRlsClient(accessToken);
    return authClient.auth.getUser(accessToken);
};

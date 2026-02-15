import { createClient } from '@supabase/supabase-js';
import { config } from './config';

if (!config.supabase.url || !config.supabase.serviceKey) {
    console.warn('Supabase configuration missing. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
}

export const supabase = createClient(
    config.supabase.url,
    config.supabase.serviceKey
);

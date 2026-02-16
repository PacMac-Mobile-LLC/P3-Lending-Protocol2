import { createRlsClient, supabase } from '../config/supabase';

export const getDbClient = (accessToken?: string) => {
    if (accessToken) {
        return createRlsClient(accessToken);
    }

    return supabase;
};

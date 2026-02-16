import { supabase } from '../config/supabase';

export const TrustService = {
    /**
     * Fetches the latest trust score snapshot for a specific user ID, including wallet address.
     * @param userId UUID of the user
     */
    getLatestTrustSnapshot: async (userId: string) => {
        const { data, error } = await supabase
            .from('trust_score_snapshots')
            .select(`
                score, 
                risk_tier, 
                snapshot_time, 
                model_version, 
                feature_vector_hash,
                users (wallet_address)
            `)
            .eq('user_id', userId)
            .order('snapshot_time', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            throw new Error(`Database error: ${error.message}`);
        }

        if (!data) return null;

        // Flatten the response
        const { users, ...snapshot } = data;
        return {
            ...snapshot,
            wallet_address: (users as any)?.wallet_address
        };
    }
};

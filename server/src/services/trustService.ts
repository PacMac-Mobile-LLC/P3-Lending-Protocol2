import { getDbClient } from './dbClient';

export const TrustService = {
    /**
     * Fetches the latest trust score snapshot for a specific user ID.
     * @param userId UUID of the user
     */
    getLatestTrustSnapshot: async (userId: string, accessToken?: string) => {
        const client = getDbClient(accessToken);
        const { data, error } = await client
            .from('trust_score_snapshots')
            .select('score, risk_tier, snapshot_time, model_version, feature_vector_hash')
            .eq('user_id', userId)
            .order('snapshot_time', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            throw new Error(`Database error: ${error.message}`);
        }

        return data;
    }
};

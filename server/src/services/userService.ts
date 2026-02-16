import { getDbClient } from './dbClient';

export type UserProfileRecord = {
    id: string;
    wallet_address: string | null;
    kyc_tier: number;
    created_at: string;
    updated_at: string;
};

export const UserService = {
    getUserById: async (userId: string, accessToken?: string): Promise<UserProfileRecord | null> => {
        const client = getDbClient(accessToken);
        const { data, error } = await client
            .from('users')
            .select('id, wallet_address, kyc_tier, created_at, updated_at')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            throw new Error(`Failed to fetch user profile: ${error.message}`);
        }

        return data;
    },

    updateUserById: async (
        userId: string,
        updates: Partial<Pick<UserProfileRecord, 'wallet_address'>>,
        accessToken?: string
    ): Promise<UserProfileRecord | null> => {
        const client = getDbClient(accessToken);

        const { data, error } = await client
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select('id, wallet_address, kyc_tier, created_at, updated_at')
            .maybeSingle();

        if (error) {
            throw new Error(`Failed to update user profile: ${error.message}`);
        }

        return data;
    },
};

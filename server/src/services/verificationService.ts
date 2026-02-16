import { getDbClient } from './dbClient';

export const VerificationService = {
    /**
     * Verifies if a snapshot hash corresponds to a valid trust score snapshot.
     * @param hash The feature_vector_hash to verify
     */
    verifySnapshotHash: async (hash: string, accessToken?: string) => {
        const client = getDbClient(accessToken);

        const { data, error } = await client
            .from('trust_score_snapshots')
            .select('snapshot_time')
            .eq('feature_vector_hash', hash)
            .limit(1)
            .maybeSingle();

        if (error) {
            throw new Error(`Database error during verification: ${error.message}`);
        }

        return {
            isValid: !!data,
            snapshotTime: data ? data.snapshot_time : null,
            isChainVerified: false,
        };
    },

    submitKYC: async (
        payload: {
            userId: string;
            requestedTier: number;
            provider?: string;
            rawResponse?: Record<string, unknown>;
        },
        accessToken?: string
    ) => {
        const client = getDbClient(accessToken);

        const { data: updatedUser, error: updateError } = await client
            .from('users')
            .update({
                kyc_tier: payload.requestedTier,
                updated_at: new Date().toISOString(),
            })
            .eq('id', payload.userId)
            .select('id, wallet_address, kyc_tier, created_at, updated_at')
            .single();

        if (updateError) {
            throw new Error(`Failed to update KYC tier: ${updateError.message}`);
        }

        const { error: auditError } = await client
            .from('audit_log')
            .insert({
                actor_id: payload.userId,
                action: 'kyc_submission',
                resource_type: 'users',
                resource_id: payload.userId,
                metadata: {
                    provider: payload.provider || 'manual',
                    requested_tier: payload.requestedTier,
                    raw_response: payload.rawResponse || null,
                },
            });

        if (auditError) {
            throw new Error(`Failed to write KYC audit log: ${auditError.message}`);
        }

        return updatedUser;
    },

    getVerificationStatus: async (userId: string, accessToken?: string) => {
        const client = getDbClient(accessToken);

        const { data: userData, error: userError } = await client
            .from('users')
            .select('id, kyc_tier, updated_at')
            .eq('id', userId)
            .maybeSingle();

        if (userError) {
            throw new Error(`Failed to fetch verification status: ${userError.message}`);
        }

        if (!userData) {
            return null;
        }

        const { data: latestSnapshot, error: snapshotError } = await client
            .from('trust_score_snapshots')
            .select('score, risk_tier, snapshot_time, model_version')
            .eq('user_id', userId)
            .order('snapshot_time', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (snapshotError) {
            throw new Error(`Failed to fetch trust snapshot status: ${snapshotError.message}`);
        }

        return {
            user_id: userData.id,
            kyc_tier: userData.kyc_tier,
            status_updated_at: userData.updated_at,
            latest_trust_snapshot: latestSnapshot,
        };
    },

    createAttestation: async (
        payload: {
            actorId: string;
            userId: string;
            snapshotHash: string;
            note?: string;
        },
        accessToken?: string
    ) => {
        const client = getDbClient(accessToken);

        const attestationRef = `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        const { error } = await client
            .from('audit_log')
            .insert({
                actor_id: payload.actorId,
                action: 'snapshot_attestation_anchor',
                resource_type: 'trust_score_snapshots',
                resource_id: payload.userId,
                metadata: {
                    attestation_reference: attestationRef,
                    snapshot_hash: payload.snapshotHash,
                    note: payload.note || null,
                },
            });

        if (error) {
            throw new Error(`Failed to create attestation audit record: ${error.message}`);
        }

        return {
            attestation_reference: attestationRef,
            snapshot_hash: payload.snapshotHash,
            anchored_at: new Date().toISOString(),
        };
    },
};

import { supabase } from '../config/supabase';

export const AdminService = {
    getProtocolStats: async () => {
        const [
            usersRes,
            loansRes,
            repaymentsRes,
            snapshotsRes,
            fraudFlagsRes,
        ] = await Promise.all([
            supabase.from('users').select('*', { count: 'exact', head: true }),
            supabase.from('loan_activity').select('*', { count: 'exact', head: true }),
            supabase.from('repayment_history').select('*', { count: 'exact', head: true }),
            supabase.from('trust_score_snapshots').select('*', { count: 'exact', head: true }),
            supabase.from('fraud_flags').select('*', { count: 'exact', head: true }).eq('is_active', true),
        ]);

        const firstError = [usersRes, loansRes, repaymentsRes, snapshotsRes, fraudFlagsRes]
            .map((result) => result.error)
            .find(Boolean);

        if (firstError) {
            throw new Error(`Failed to fetch protocol stats: ${firstError.message}`);
        }

        return {
            users: usersRes.count || 0,
            loans: loansRes.count || 0,
            repayments: repaymentsRes.count || 0,
            trust_snapshots: snapshotsRes.count || 0,
            active_fraud_flags: fraudFlagsRes.count || 0,
        };
    },

    createScoreOverride: async (payload: {
        actorId: string;
        userId: string;
        score: number;
        riskTier: number;
        modelVersion: string;
        featureVectorHash: string;
        snapshotTime?: string;
        reason: string;
    }) => {
        const snapshotTime = payload.snapshotTime || new Date().toISOString();

        const { data: snapshot, error: snapshotError } = await supabase
            .from('trust_score_snapshots')
            .insert({
                user_id: payload.userId,
                score: payload.score,
                risk_tier: payload.riskTier,
                model_version: payload.modelVersion,
                feature_vector_hash: payload.featureVectorHash,
                snapshot_time: snapshotTime,
            })
            .select('*')
            .single();

        if (snapshotError) {
            throw new Error(`Failed to create score override snapshot: ${snapshotError.message}`);
        }

        const { error: auditError } = await supabase
            .from('audit_log')
            .insert({
                actor_id: payload.actorId,
                action: 'manual_score_override',
                resource_type: 'trust_score_snapshots',
                resource_id: snapshot.id,
                metadata: {
                    reason: payload.reason,
                    score: payload.score,
                    risk_tier: payload.riskTier,
                },
            });

        if (auditError) {
            throw new Error(`Failed to write audit log for score override: ${auditError.message}`);
        }

        return snapshot;
    },

    getAuditLogs: async (limit: number, offset: number) => {
        const { data, error } = await supabase
            .from('audit_log')
            .select('*')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            throw new Error(`Failed to fetch audit logs: ${error.message}`);
        }

        return data || [];
    },
};

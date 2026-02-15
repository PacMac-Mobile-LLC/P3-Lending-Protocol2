import { ethers } from 'ethers';
import { supabase } from '../config/supabase';
import { BlockchainService } from './blockchainService';
import logger from '../utils/logger';

export const VerificationService = {
    /**
     * Reconstructs the Keccak256 hash of a snapshot using a deterministic sequence.
     * FROZEN SPEC: [user_id|score|risk_tier|snapshot_time|model_version|feature_vector_hash]
     */
    reconstructSnapshotHash: (snapshot: any): string => {
        const payload = [
            snapshot.user_id,
            snapshot.score,
            snapshot.risk_tier,
            new Date(snapshot.snapshot_time).toISOString(), // Rule: Force ISO UTC normalization
            snapshot.model_version,
            snapshot.feature_vector_hash
        ].join('|');

        return ethers.keccak256(ethers.toUtf8Bytes(payload));
    },

    /**
     * Orchestrates the Pull-Verification bridge.
     * Resolves userId -> wallet, reconstructs local hash, and compares with Ethereum anchor.
     */
    verifyTrustSnapshot: async (userId: string) => {
        // 1. Fetch latest snapshot AND user wallet address
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select(`
        wallet_address,
        trust_score_snapshots (
          user_id,
          score,
          risk_tier,
          snapshot_time,
          model_version,
          feature_vector_hash
        )
      `)
            .eq('id', userId)
            .order('snapshot_time', { foreignTable: 'trust_score_snapshots', ascending: false })
            .limit(1, { foreignTable: 'trust_score_snapshots' })
            .single();

        if (userError || !userData) {
            throw new Error(`User or snapshot not found: ${userError?.message || 'None'}`);
        }

        const snapshot = userData.trust_score_snapshots[0];
        if (!snapshot) {
            return { verified: false, localHash: null, onChainHash: null, error: 'No snapshot found for user' };
        }

        // 2. Local Reconstruction
        const localHash = VerificationService.reconstructSnapshotHash(snapshot);

        // 3. Chain Resolution
        const onChainHash = await BlockchainService.getAnchoredHash(userData.wallet_address);

        // 4. Strict Equality Comparison
        const verified = !!onChainHash && (localHash.toLowerCase() === onChainHash.toLowerCase());

        logger.info({ userId, verified, localHash, onChainHash }, 'Hash Bridge Verification Complete');

        return {
            verified,
            localHash,
            onChainHash
        };
    },

    /**
     * (Legacy/Simple) Verifies if a raw hash corresponds to a valid trust score snapshot in DB.
     */
    verifySnapshotHash: async (hash: string) => {
        const { data, error } = await supabase
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
            snapshotTime: data ? data.snapshot_time : null
        };
    }
};

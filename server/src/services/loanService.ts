import { supabase } from '../config/supabase';
import { VerificationService } from './verificationService';
import { LoanPolicyService } from './loanPolicyService';
import logger from '../utils/logger';

export const LoanService = {
    /**
     * Processes a loan request with mandatory verification gating.
     */
    createLoanRequest: async (userId: string, amount: number, duration: number) => {
        logger.info({ userId, amount, duration }, 'Processing new loan request');

        // 1. Mandatory Security Gate: Cryptographic Hash Verification
        // Calls internal VerificationService to check Ethereum anchor
        const verification = await VerificationService.verifyTrustSnapshot(userId);

        if (!verification.verified) {
            logger.warn({ userId, localHash: verification.localHash, onChainHash: verification.onChainHash }, 'Loan request rejected: Verification failed');
            throw new Error('Cryptographic verification mismatch. Loan request blocked for protocol integrity.');
        }

        // 2. Fetch Latest Snapshot for Policy Layer
        // We fetch again to get data points needed for policy enforcement
        const { data: snapshotData, error: snapshotError } = await supabase
            .from('trust_score_snapshots')
            .select('score, risk_tier')
            .eq('user_id', userId)
            .order('snapshot_time', { ascending: false })
            .limit(1)
            .single();

        if (snapshotError || !snapshotData) {
            throw new Error('Trust snapshot missing during policy evaluation');
        }

        // 3. Decision Layer: Risk Policy Enforcement
        LoanPolicyService.validateLoanRequest(amount, snapshotData.risk_tier, snapshotData.score);

        // 4. Persistence: Insert into loan_activity
        const { data: loan, error: loanError } = await supabase
            .from('loan_activity')
            .insert({
                borrower_id: userId,
                lender_id: '00000000-0000-0000-0000-000000000000', // P3 Protocol Escrow placeholder
                amount_usd: amount,
                interest_rate: 0.1, // Placeholder 10% interest
                status: 'approved' // Automatically approved if gated checks pass
            })
            .select()
            .single();

        if (loanError) {
            logger.error({ error: loanError.message }, 'Failed to persist loan request');
            throw new Error(`Database error: ${loanError.message}`);
        }

        logger.info({ loanId: loan.id, userId }, 'Loan request approved and persisted');

        return loan;
    }
};

export interface LoanPolicy {
    maxAmount: number;
    maxLTV: number;
}

export const LoanPolicyService = {
    /**
     * Retrieves risk policy based on user's risk tier.
     * @param tier Risk tier from trust snapshot.
     */
    getPolicyForTier: (tier: number): LoanPolicy => {
        switch (tier) {
            case 0: // Prime
                return { maxAmount: 5000, maxLTV: 0.8 };
            case 1: // Near-Prime
                return { maxAmount: 2000, maxLTV: 0.6 };
            case 2: // Sub-Prime
            default:
                return { maxAmount: 500, maxLTV: 0.4 };
        }
    },

    /**
     * Validates a loan request against policy limits.
     * @throws Error if validation fails.
     */
    validateLoanRequest: (amount: number, tier: number, score: number) => {
        // 1. Check Score Floor
        if (score < 20) {
            throw new Error('Trust score below minimum required for any capital allocation (min: 20)');
        }

        // 2. Resolve Policy
        const policy = LoanPolicyService.getPolicyForTier(tier);

        // 3. Amount Cap logic
        if (amount > policy.maxAmount) {
            throw new Error(`Requested amount exceeds max cap for Risk Tier ${tier} ($${policy.maxAmount})`);
        }

        // Note: LTV check would happen here if collateral data was provided
        return true;
    }
};

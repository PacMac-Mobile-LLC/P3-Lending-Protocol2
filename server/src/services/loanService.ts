import { getDbClient } from './dbClient';

export type LoanRecord = {
    id: string;
    borrower_id: string;
    lender_id: string;
    amount_usd: string;
    interest_rate: string;
    status: string;
    created_at: string;
    updated_at: string;
};

export type RepaymentRecord = {
    id: string;
    loan_id: string;
    amount: string;
    is_late: boolean;
    tx_hash: string;
    created_at: string;
};

export const LoanService = {
    listLoansForUser: async (userId: string, accessToken?: string, status?: string): Promise<LoanRecord[]> => {
        const client = getDbClient(accessToken);

        let query = client
            .from('loan_activity')
            .select('id, borrower_id, lender_id, amount_usd, interest_rate, status, created_at, updated_at')
            .or(`borrower_id.eq.${userId},lender_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Failed to list loans: ${error.message}`);
        }

        return data || [];
    },

    createLoanRequest: async (
        payload: {
            borrowerId: string;
            lenderId?: string;
            amountUsd: number;
            interestRate: number;
            status: string;
        },
        accessToken?: string
    ): Promise<LoanRecord> => {
        const client = getDbClient(accessToken);

        const { data, error } = await client
            .from('loan_activity')
            .insert({
                borrower_id: payload.borrowerId,
                // Legacy schema requires lender_id. Fallback to borrower for pending requests.
                lender_id: payload.lenderId || payload.borrowerId,
                amount_usd: payload.amountUsd,
                interest_rate: payload.interestRate,
                status: payload.status,
            })
            .select('id, borrower_id, lender_id, amount_usd, interest_rate, status, created_at, updated_at')
            .single();

        if (error) {
            throw new Error(`Failed to create loan request: ${error.message}`);
        }

        return data;
    },

    repayLoan: async (
        payload: {
            userId: string;
            loanId: string;
            amount: number;
            txHash: string;
            isLate?: boolean;
        },
        accessToken?: string
    ): Promise<{ loan: LoanRecord; repayment: RepaymentRecord }> => {
        const client = getDbClient(accessToken);

        const { data: loan, error: loanError } = await client
            .from('loan_activity')
            .select('id, borrower_id, lender_id, amount_usd, interest_rate, status, created_at, updated_at')
            .eq('id', payload.loanId)
            .maybeSingle();

        if (loanError) {
            throw new Error(`Failed to fetch loan for repayment: ${loanError.message}`);
        }

        if (!loan) {
            throw new Error('Loan not found.');
        }

        if (loan.borrower_id !== payload.userId && loan.lender_id !== payload.userId) {
            throw new Error('You are not authorized to repay this loan.');
        }

        const { data: repayment, error: repaymentError } = await client
            .from('repayment_history')
            .insert({
                loan_id: payload.loanId,
                amount: payload.amount,
                tx_hash: payload.txHash,
                is_late: payload.isLate || false,
            })
            .select('id, loan_id, amount, is_late, tx_hash, created_at')
            .single();

        if (repaymentError) {
            throw new Error(`Failed to record repayment: ${repaymentError.message}`);
        }

        const { data: updatedLoan, error: updateError } = await client
            .from('loan_activity')
            .update({ status: 'repaid' })
            .eq('id', payload.loanId)
            .select('id, borrower_id, lender_id, amount_usd, interest_rate, status, created_at, updated_at')
            .single();

        if (updateError) {
            throw new Error(`Failed to update loan status: ${updateError.message}`);
        }

        return {
            loan: updatedLoan,
            repayment,
        };
    },
};

import { NextFunction, Request, Response } from 'express';
import { LoanService } from '../services/loanService';

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const LoanController = {
    /**
     * GET /api/loans
     * List loans visible to current user.
     */
    listLoans: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.auth?.userId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthenticated request.',
                });
            }

            const statusFilter = typeof req.query.status === 'string' ? req.query.status : undefined;
            const loans = await LoanService.listLoansForUser(userId, req.accessToken, statusFilter);

            return res.status(200).json({
                success: true,
                data: loans,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/loans/request
     * Create a new loan request.
     */
    createRequest: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const borrowerId = req.auth?.userId;
            const { amount_usd, interest_rate, lender_id, status } = req.body || {};

            if (!borrowerId) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthenticated request.',
                });
            }

            if (typeof amount_usd !== 'number' || amount_usd <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'amount_usd must be a positive number.',
                });
            }

            if (typeof interest_rate !== 'number' || interest_rate < 0) {
                return res.status(400).json({
                    success: false,
                    error: 'interest_rate must be a non-negative number.',
                });
            }

            if (lender_id && (!UUID_V4_REGEX.test(lender_id))) {
                return res.status(400).json({
                    success: false,
                    error: 'lender_id must be a UUID v4 when provided.',
                });
            }

            const created = await LoanService.createLoanRequest(
                {
                    borrowerId,
                    lenderId: lender_id,
                    amountUsd: amount_usd,
                    interestRate: interest_rate,
                    status: status || 'pending',
                },
                req.accessToken
            );

            return res.status(201).json({
                success: true,
                data: created,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/loans/repay
     * Repay a loan and append repayment history.
     */
    repayLoan: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.auth?.userId;
            const { loan_id, amount, tx_hash, is_late } = req.body || {};

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthenticated request.',
                });
            }

            if (!loan_id || !UUID_V4_REGEX.test(loan_id)) {
                return res.status(400).json({
                    success: false,
                    error: 'loan_id must be a valid UUID v4.',
                });
            }

            if (typeof amount !== 'number' || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'amount must be a positive number.',
                });
            }

            if (!tx_hash || typeof tx_hash !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'tx_hash must be a non-empty string.',
                });
            }

            const result = await LoanService.repayLoan(
                {
                    userId,
                    loanId: loan_id,
                    amount,
                    txHash: tx_hash,
                    isLate: Boolean(is_late),
                },
                req.accessToken
            );

            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error: any) {
            if (error?.message === 'Loan not found.') {
                return res.status(404).json({ success: false, error: error.message });
            }

            if (error?.message === 'You are not authorized to repay this loan.') {
                return res.status(403).json({ success: false, error: error.message });
            }

            next(error);
        }
    },
};

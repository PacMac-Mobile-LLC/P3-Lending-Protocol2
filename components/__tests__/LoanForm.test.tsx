import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import LoanForm from '../LoanForm';
import { useTrustScoreEvents } from '../../hooks/useTrustScoreEvents';
import { useLoanRequest } from '../../hooks/useLoanRequest';

// Mock hooks
vi.mock('../../hooks/useTrustScoreEvents');
vi.mock('../../hooks/useLoanRequest');

describe('LoanForm Integration', () => {
    const userId = 'user-123';

    const mockUpdateTrust = (data: any) => {
        (useTrustScoreEvents as any).mockReturnValue(data);
    };

    const mockLoanRequest = (data: any) => {
        (useLoanRequest as any).mockReturnValue(data);
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockLoanRequest({
            loading: false,
            error: null,
            success: false,
            submitLoanRequest: vi.fn(),
        });
    });

    it('should display trust data and enable form when verified', async () => {
        mockUpdateTrust({
            trustData: { trust_score: 90, risk_tier: 0 },
            verifiedStatus: 'verified',
            loading: false,
        });

        render(<LoanForm userId={userId} />);

        expect(screen.getByText(/Trust Score:/i)).toBeInTheDocument();
        expect(screen.getByText(/90/)).toBeInTheDocument();
        expect(screen.getByText(/Risk Tier:/i)).toBeInTheDocument();
        expect(screen.getByText(/Prime/)).toBeInTheDocument();
        expect(screen.getByText(/\$5000/)).toBeInTheDocument();

        const submitBtn = screen.getByRole('button', { name: /Request Loan/i });
        expect(submitBtn).not.toBeDisabled();
    });

    it('should show warning banner and disable form when unverified', async () => {
        mockUpdateTrust({
            trustData: { trust_score: 40, risk_tier: 2 },
            verifiedStatus: 'unverified',
            loading: false,
        });

        render(<LoanForm userId={userId} />);

        expect(screen.getByText(/Trust verification failed/i)).toBeInTheDocument();

        const submitBtn = screen.getByRole('button', { name: /Request Loan/i });
        expect(submitBtn).toBeDisabled();

        const amountInput = screen.getByLabelText(/Amount/i);
        expect(amountInput).toBeDisabled();
    });

    it('should update limits instantly when trust data changes', async () => {
        const { rerender } = render(<LoanForm userId={userId} />);

        // Tier 0 (Prime)
        mockUpdateTrust({
            trustData: { trust_score: 95, risk_tier: 0 },
            verifiedStatus: 'verified',
            loading: false,
        });
        rerender(<LoanForm userId={userId} />);
        expect(screen.getByText(/\$5000/)).toBeInTheDocument();

        // Simulate downgrade to Tier 1 (Near-Prime)
        mockUpdateTrust({
            trustData: { trust_score: 65, risk_tier: 1 },
            verifiedStatus: 'verified',
            loading: false,
        });
        rerender(<LoanForm userId={userId} />);
        expect(screen.getByText(/\$2000/)).toBeInTheDocument();
    });
});

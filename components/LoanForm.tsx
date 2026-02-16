import React, { useState } from 'react';
import { useLoanRequest } from '../hooks/useLoanRequest';
import { useTrustScoreEvents } from '../hooks/useTrustScoreEvents';

interface LoanFormProps {
    userId: string;
}

/**
 * LoanForm Component
 * Gated by cryptographic trust verification. 
 * Reacts in real-time to on-chain TrustUpdated events.
 */
const LoanForm: React.FC<LoanFormProps> = ({ userId }) => {
    // 1. Real-time Monitoring: Subscribes to Ethereum events for the resolved wallet address
    const { trustData, verifiedStatus, loading: monitorLoading } = useTrustScoreEvents(userId);

    // 2. Submission Logic: Hard-linked to the same user context
    const { loading: submitting, error, success, submitLoanRequest } = useLoanRequest(userId);

    const [amount, setAmount] = useState<number>(0);
    const [duration, setDuration] = useState<number>(30);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Safety check: Block submission if local verified state is not clear
        if (verifiedStatus !== 'verified') return;
        submitLoanRequest(amount, duration);
    };

    const getTierLabel = (tier: number) => {
        switch (tier) {
            case 0: return 'Prime';
            case 1: return 'Near-Prime';
            case 2: return 'Sub-Prime';
            default: return 'Unknown';
        }
    };

    const getLimitByTier = (tier: number) => {
        switch (tier) {
            case 0: return 5000;
            case 1: return 2000;
            case 2: return 500;
            default: return 0;
        }
    };

    // Dynamic Enforcement: UI limits change instantly when trust score is recalibrated on-chain
    const maxLimit = trustData ? getLimitByTier(trustData.risk_tier) : 0;

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '400px', backgroundColor: 'white' }}>
            <h3 style={{ marginTop: 0 }}>P3 Loan Request</h3>

            {/* Verification Warning Banner: Appears if hash mismatch is detected */}
            {verifiedStatus === 'unverified' && (
                <div style={{
                    backgroundColor: '#ff4d4d',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '4px',
                    marginBottom: '15px',
                    fontSize: '13px',
                    fontWeight: 'bold'
                }}>
                    ⚠️ Trust verification failed. Loan requests disabled.
                </div>
            )}

            {trustData && (
                <div style={{
                    marginBottom: '20px',
                    fontSize: '14px',
                    backgroundColor: '#f9f9f9',
                    padding: '10px',
                    borderRadius: '4px',
                    border: verifiedStatus === 'unverified' ? '1px solid #ff4d4d' : '1px solid #eee'
                }}>
                    <div><strong>Trust Score:</strong> {trustData.trust_score} / 100</div>
                    <div><strong>Risk Tier:</strong> {getTierLabel(trustData.risk_tier)}</div>
                    <div><strong>Max Loan Limit:</strong> ${maxLimit}</div>
                    <div style={{ fontSize: '11px', marginTop: '5px', color: '#666' }}>
                        Protocol: Event-Driven | Integrity: {verifiedStatus}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="loan-amount" style={{ display: 'block', marginBottom: '5px' }}>Amount (USD)</label>
                    <input
                        id="loan-amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                        disabled={submitting || verifiedStatus !== 'verified'}
                        required
                        max={maxLimit}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="loan-duration" style={{ display: 'block', marginBottom: '5px' }}>Duration (Days)</label>
                    <input
                        id="loan-duration"
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                        disabled={submitting || verifiedStatus !== 'verified'}
                        required
                        min={1}
                        max={365}
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting || !trustData || verifiedStatus !== 'verified'}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: verifiedStatus === 'verified' ? '#007bff' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: (submitting || verifiedStatus !== 'verified') ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    {submitting ? 'Processing...' : 'Request Loan'}
                </button>
            </form>

            {error && (
                <div style={{ marginTop: '15px', color: 'red', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                    <strong>Submission Error:</strong> {error}
                </div>
            )}

            {success && (
                <div style={{ marginTop: '15px', color: 'green', fontSize: '14px' }}>
                    <strong>Success!</strong> Your loan request has been approved.
                </div>
            )}

            {monitorLoading && !trustData && (
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
                    Synchronizing with blockchain...
                </div>
            )}
        </div>
    );
};

export default LoanForm;

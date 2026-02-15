import { useState, useEffect } from 'react';
import { fetchWithBase } from '../client-services/backendService';

export interface TrustData {
    trust_score: number;
    risk_tier: number;
    snapshot_time: string;
    model_version: string;
    feature_vector_hash: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export const useLoanRequest = (userId: string) => {
    const [trustData, setTrustData] = useState<TrustData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const fetchTrustData = async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetchWithBase(`/api/users/${userId}/trust`);
            const result: ApiResponse<TrustData> = await response.json();
            if (result.success && result.data) {
                setTrustData(result.data);
            } else {
                setError(result.error || 'Failed to fetch trust data');
            }
        } catch (err: any) {
            setError(err.message || 'Network error fetching trust data');
        } finally {
            setLoading(false);
        }
    };

    const submitLoanRequest = async (amount: number, duration: number) => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            const response = await fetchWithBase('/api/loans/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, amount, duration }),
            });

            const result: ApiResponse<any> = await response.json();

            if (result.success) {
                setSuccess(true);
            } else {
                setError(result.error || 'Loan request failed');
            }
        } catch (err: any) {
            setError(err.message || 'Network error submitting loan request');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrustData();
    }, [userId]);

    return { trustData, loading, error, success, submitLoanRequest, refreshTrustData: fetchTrustData };
};

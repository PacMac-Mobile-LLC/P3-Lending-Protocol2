import { useState, useEffect, useRef } from 'react';

export type VerifiedStatus = 'verified' | 'unverified' | 'pending';

export interface TrustData {
    trust_score: number;
    risk_tier: number;
    snapshot_time: string;
    model_version: string;
    feature_vector_hash: string;
}

export interface VerificationData {
    verified: boolean;
    local_hash: string;
    onchain_hash: string | null;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export const useTrustScoreMonitor = (userId: string) => {
    const [trustData, setTrustData] = useState<TrustData | null>(null);
    const [verifiedStatus, setVerifiedStatus] = useState<VerifiedStatus>('pending');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const pollInterval = useRef<NodeJS.Timeout | null>(null);

    const checkVerification = async () => {
        if (!userId) return;
        try {
            // 1. Fetch trust data
            const trustRes = await fetch(`/api/users/${userId}/trust`);
            const trustResult: ApiResponse<TrustData> = await trustRes.json();

            if (trustResult.success && trustResult.data) {
                setTrustData(trustResult.data);
            }

            // 2. Fetch bridge verification status
            const verifyRes = await fetch(`/api/verification/user/${userId}`);
            const verifyResult: ApiResponse<VerificationData> = await verifyRes.json();

            if (verifyResult.success && verifyResult.data) {
                setVerifiedStatus(verifyResult.data.verified ? 'verified' : 'unverified');
            } else {
                setVerifiedStatus('unverified');
            }
        } catch (err: any) {
            console.error('Trust monitor polling error:', err);
            // We don't set global error here to avoid flickering UI, just log it.
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        setLoading(true);
        checkVerification();

        // Start polling every 15 seconds
        pollInterval.current = setInterval(checkVerification, 15000);

        return () => {
            if (pollInterval.current) {
                clearInterval(pollInterval.current);
            }
        };
    }, [userId]);

    return { trustData, verifiedStatus, loading, error };
};

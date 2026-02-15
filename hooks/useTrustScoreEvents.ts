import { useState, useEffect } from 'react';
import { Contract, JsonRpcProvider } from 'ethers';
import { CONFIG } from '../config';

export type VerifiedStatus = 'verified' | 'unverified' | 'pending';

export interface TrustData {
    trust_score: number;
    risk_tier: number;
    snapshot_time: string;
    model_version: string;
    feature_vector_hash: string;
    wallet_address?: string;
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

const REPUTATION_REGISTRY_ABI = [
    "event TrustUpdated(address indexed user)"
];

const REGISTRY_ADDRESS = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

/**
 * useTrustScoreEvents Hook
 * Listens for on-chain TrustUpdated events and refreshes trust/verification state.
 * Resolves walletAddress from backend if not provided initially.
 */
export const useTrustScoreEvents = (userId: string, initialWalletAddress?: string) => {
    const [trustData, setTrustData] = useState<TrustData | null>(null);
    const [verifiedStatus, setVerifiedStatus] = useState<VerifiedStatus>('pending');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [walletAddress, setWalletAddress] = useState<string | undefined>(initialWalletAddress);

    const refreshTrustState = async () => {
        if (!userId) return;
        try {
            // 1. Fetch latest trust data (Backend)
            const trustRes = await fetch(`/api/users/${userId}/trust`);
            const trustResult: ApiResponse<TrustData> = await trustRes.json();
            if (trustResult.success && trustResult.data) {
                setTrustData(trustResult.data);
                if (!walletAddress && trustResult.data.wallet_address) {
                    setWalletAddress(trustResult.data.wallet_address);
                }
            }

            // 2. Fetch cryptographic verification status (Bridge)
            const verifyRes = await fetch(`/api/verification/user/${userId}`);
            const verifyResult: ApiResponse<VerificationData> = await verifyRes.json();
            if (verifyResult.success && verifyResult.data) {
                setVerifiedStatus(verifyResult.data.verified ? 'verified' : 'unverified');
            } else {
                setVerifiedStatus('unverified');
            }
        } catch (err: any) {
            console.error('Failed to refresh trust state:', err);
            setError('Synchronization error');
        } finally {
            setLoading(false);
        }
    };

    // Initial state load
    useEffect(() => {
        refreshTrustState();
    }, [userId]);

    // Setup Ethereum Event Listener once walletAddress is resolved
    useEffect(() => {
        if (!userId || !walletAddress) return;

        // Note: Using JsonRpcProvider for compatibility; WebSocketProvider can be swapped in if available.
        const rpcUrl = `https://mainnet.infura.io/v3/${CONFIG.INFURA_PROJECT_ID}`;
        const provider = new JsonRpcProvider(rpcUrl);
        const contract = new Contract(REGISTRY_ADDRESS, REPUTATION_REGISTRY_ABI, provider);

        const filter = contract.filters.TrustUpdated(walletAddress);

        const onTrustUpdated = (user: string) => {
            console.log(`[On-Chain Event] Trust Updated for ${user}. Synchronizing UI...`);
            refreshTrustState();
        };

        contract.on(filter, onTrustUpdated);

        // Cleanup listener on unmount OR when wallet/user change
        return () => {
            contract.off(filter, onTrustUpdated);
        };
    }, [userId, walletAddress]);

    return { trustData, verifiedStatus, loading, error };
};

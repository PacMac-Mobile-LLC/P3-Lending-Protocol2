import { renderHook, waitFor, act } from '@testing-library/react';
import { useTrustScoreEvents } from '../useTrustScoreEvents';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Contract, JsonRpcProvider } from 'ethers';

// Mock ethers
const mockContractInstance = {
    filters: {
        TrustUpdated: vi.fn().mockReturnValue('mock-filter'),
    },
    on: vi.fn(),
    off: vi.fn(),
};

vi.mock('ethers', () => {
    return {
        JsonRpcProvider: vi.fn().mockImplementation(function () { return {}; }),
        Contract: vi.fn().mockImplementation(function () { return mockContractInstance; }),
    };
});

// Mock CONFIG
vi.mock('../config', () => ({
    CONFIG: { INFURA_PROJECT_ID: 'test-id' }
}));

describe('useTrustScoreEvents', () => {
    const userId = 'user-123';
    const walletAddress = '0x123';

    const mockTrustData = {
        success: true,
        data: {
            trust_score: 85,
            risk_tier: 0,
            wallet_address: walletAddress
        }
    };

    const mockVerifyData = {
        success: true,
        data: { verified: true }
    };

    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn().mockImplementation((url) => {
            if (url.includes('/trust')) return Promise.resolve({ json: () => Promise.resolve(mockTrustData) });
            if (url.includes('/verification')) return Promise.resolve({ json: () => Promise.resolve(mockVerifyData) });
            return Promise.reject(new Error('Unknown URL'));
        });
    });

    it('should fetch trust data and subscribe to events on mount', async () => {
        const { result } = renderHook(() => useTrustScoreEvents(userId, walletAddress));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining(`/api/users/${userId}/trust`));
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining(`/api/verification/user/${userId}`));

        expect(mockContractInstance.on).toHaveBeenCalledWith('mock-filter', expect.any(Function));
    });

    it('should refresh data when TrustUpdated event is triggered', async () => {
        let eventCallback: Function;
        mockContractInstance.on.mockImplementation((filter: any, cb: Function) => {
            eventCallback = cb;
        });

        const { result } = renderHook(() => useTrustScoreEvents(userId, walletAddress));
        await waitFor(() => expect(result.current.loading).toBe(false));

        // Clear initial fetch calls
        (global.fetch as any).mockClear();

        // Simulate on-chain event
        await act(async () => {
            eventCallback!(walletAddress);
        });

        expect(global.fetch).toHaveBeenCalledTimes(2); // Should refresh trust and verification
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining(`/api/users/${userId}/trust`));
    });

    it('should cleanup listeners on unmount', async () => {
        const { unmount } = renderHook(() => useTrustScoreEvents(userId, walletAddress));

        unmount();

        expect(mockContractInstance.off).toHaveBeenCalledWith('mock-filter', expect.any(Function));
    });
});

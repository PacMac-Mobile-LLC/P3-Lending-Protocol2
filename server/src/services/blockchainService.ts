import { ethers, JsonRpcProvider, Contract } from 'ethers';
import { config } from '../config/config';
import logger from '../utils/logger';

// Minimal ABI to read the anchored hash
const REPUTATION_REGISTRY_ABI = [
    "function getUserTrustHash(address user) public view returns (bytes32)"
];

export const BlockchainService = {
    /**
     * Retrieves the anchored reputation hash from the Ethereum registry.
     * @param walletAddress The user's wallet address.
     */
    getAnchoredHash: async (walletAddress: string): Promise<string | null> => {
        try {
            if (!config.ethereum.rpcUrl || !config.ethereum.contractAddress) {
                throw new Error('Blockchain configuration missing (ETH_RPC_URL or P3_PROTOCOL_ADDRESS)');
            }

            const provider = new JsonRpcProvider(config.ethereum.rpcUrl);
            const contract = new Contract(config.ethereum.contractAddress, REPUTATION_REGISTRY_ABI, provider);

            const anchoredHash = await contract.getUserTrustHash(walletAddress);

            // Zero hash (0x000...) indicates no anchor exists
            if (anchoredHash === ethers.ZeroHash) {
                return null;
            }

            return anchoredHash;
        } catch (error: any) {
            logger.error({ error: error.message, address: walletAddress }, 'Failed to fetch anchored hash from Ethereum');
            throw error;
        }
    }
};

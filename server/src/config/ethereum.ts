import { JsonRpcProvider } from 'ethers';
import { config } from './config';

let provider: JsonRpcProvider | null = null;

if (config.ethereum.rpcUrl) {
    try {
        provider = new JsonRpcProvider(config.ethereum.rpcUrl);
        console.log('Ethereum JSON-RPC Provider initialized.');
    } catch (error) {
        console.error('Failed to initialize Ethereum provider:', error);
    }
} else {
    console.warn('Ethereum RPC URL missing. Blockchain features will be disabled.');
}

export { provider };

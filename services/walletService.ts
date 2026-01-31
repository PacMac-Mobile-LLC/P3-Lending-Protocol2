import { BrowserProvider, formatEther } from 'ethers';
import { WalletState, WalletProvider } from '../types';

// Declare global ethereum property on window
declare global {
  interface Window {
    ethereum?: any;
  }
}

export const connectMetamask = async (): Promise<WalletState> => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed!");
  }

  try {
    const provider = new BrowserProvider(window.ethereum);
    // Request account access
    const accounts = await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    const balance = await provider.getBalance(address);

    return {
      isConnected: true,
      address,
      provider: 'METAMASK',
      chainId: Number(network.chainId),
      balance: parseFloat(formatEther(balance)).toFixed(4)
    };
  } catch (error) {
    console.error("MetaMask Connection Error:", error);
    throw error;
  }
};

export const connectCoinbase = async (): Promise<WalletState> => {
  // Coinbase Wallet Extension also injects into window.ethereum, 
  // often with isCoinbaseWallet = true
  if (!window.ethereum) {
    throw new Error("No wallet detected");
  }

  try {
    // Note: If both MetaMask and Coinbase are installed, window.ethereum might handle conflict
    // or provide window.ethereum.providers
    const provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    const balance = await provider.getBalance(address);

    return {
      isConnected: true,
      address,
      provider: 'COINBASE',
      chainId: Number(network.chainId),
      balance: parseFloat(formatEther(balance)).toFixed(4)
    };
  } catch (error) {
    console.error("Coinbase Connection Error:", error);
    throw error;
  }
};

// Simplified WalletConnect simulation for this environment
// Full WalletConnect v2 requires significant bundled dependencies usually
export const connectWalletConnect = async (): Promise<WalletState> => {
  // This is a placeholder. In a real CRA/Vite app, you would import { EthereumProvider } from '@walletconnect/ethereum-provider'
  throw new Error("WalletConnect requires a build step with polyfills in this environment. Please use MetaMask.");
};

export const shortenAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

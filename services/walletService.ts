
import { BrowserProvider, formatEther } from 'ethers';
import { SiweMessage } from 'siwe'; 
import { WalletState, WalletProvider } from '../types';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';

// Declare global ethereum property on window
declare global {
  interface Window {
    ethereum?: any;
  }
}

const BACKEND_URL = 'http://localhost:3001'; // Update for production

export const authenticateWithBackend = async (signer: any, address: string, chainId: number) => {
  try {
    // 1. Get Nonce from Backend
    const nonceRes = await fetch(`${BACKEND_URL}/api/nonce`);
    const nonce = await nonceRes.text();

    // 2. Create SIWE Message
    const message = new SiweMessage({
      domain: window.location.host,
      address,
      statement: 'Sign in with Ethereum to P3 Lending Protocol',
      uri: window.location.origin,
      version: '1',
      chainId,
      nonce,
    });

    const preparedMessage = message.prepareMessage();

    // 3. Ask User to Sign
    const signature = await signer.signMessage(preparedMessage);

    // 4. Send to Backend for Verification
    const verifyRes = await fetch(`${BACKEND_URL}/api/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: preparedMessage, signature }),
    });

    const data = await verifyRes.json();
    if (!data.ok) throw new Error('Backend verification failed');

    // 5. Store JWT
    localStorage.setItem('p3_jwt', data.token);
    return true;

  } catch (error) {
    console.error("SIWE Error (Non-blocking):", error);
    return false; // Allow connection even if SIWE fails for demo purposes
  }
};

export const connectMetamask = async (): Promise<WalletState> => {
  if (!window.ethereum) throw new Error("MetaMask is not installed!");

  try {
    const provider = new BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    const balance = await provider.getBalance(address);

    // Perform SIWE Authentication
    await authenticateWithBackend(signer, address, Number(network.chainId));

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
  try {
    const APP_NAME = 'P3 Lending';
    const APP_LOGO_URL = window.location.origin + '/logo.svg';
    const DEFAULT_ETH_JSONRPC_URL = 'https://mainnet.infura.io/v3/6b945ed6e0494a1c9ce16b118cd60aac'; 
    const DEFAULT_CHAIN_ID = 1;

    // Initialize Coinbase Wallet SDK
    const coinbaseWallet = new CoinbaseWalletSDK({
      appName: APP_NAME,
      appLogoUrl: APP_LOGO_URL,
      darkMode: true
    });

    // Initialize a Web3 Provider object
    const ethereum = coinbaseWallet.makeWeb3Provider(DEFAULT_ETH_JSONRPC_URL, DEFAULT_CHAIN_ID);

    // Initialize Ethers Provider
    const provider = new BrowserProvider(ethereum);

    // Request accounts (This triggers the QR Code popup if extension is missing)
    const accounts = await provider.send("eth_requestAccounts", []);
    const address = accounts[0];
    const signer = await provider.getSigner();
    const network = await provider.getNetwork();
    const balance = await provider.getBalance(address);

    // Perform SIWE Authentication
    await authenticateWithBackend(signer, address, Number(network.chainId));

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

export const connectWalletConnect = async (): Promise<WalletState> => {
  // WalletConnect v2 requires a strict Project ID setup and build process that often fails in
  // pure client-side/CDN environments without a dedicated bundler config. 
  // For stability, we guide users to MetaMask/Coinbase in this demo environment.
  throw new Error("WalletConnect requires additional configuration. Please use Coinbase Wallet (supports Scan-to-Connect) or MetaMask.");
};

export const shortenAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

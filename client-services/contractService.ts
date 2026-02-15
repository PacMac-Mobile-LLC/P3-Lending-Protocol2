
import { BrowserProvider, parseEther, toUtf8Bytes, hexlify } from 'ethers';
import { LoanRequest } from '../types';

declare const __P3_PROTOCOL_ADDRESS__: string;

// A dynamic address representing the P3 Protocol Smart Contract
// Injected via vite.config.ts from REPUTATION_ANCHOR_REGISTRY env var
const PROTOCOL_ESCROW_ADDRESS = typeof __P3_PROTOCOL_ADDRESS__ !== 'undefined' ? __P3_PROTOCOL_ADDRESS__ : '';

export const ContractService = {
  /**
   * Helper to get the Ethers provider from the window object
   */
  getProvider: () => {
    if (!window.ethereum) throw new Error("No crypto wallet found. Please install MetaMask or Coinbase Wallet.");
    return new BrowserProvider(window.ethereum);
  },

  /**
   * Triggers a blockchain transaction to fund the loan.
   * Sends ETH to the escrow address with the Loan ID embedded in the data.
   */
  fundLoan: async (request: LoanRequest) => {
    const provider = ContractService.getProvider();
    const signer = await provider.getSigner();

    // CONVERSION LOGIC FOR DEMO:
    // Real loan amounts (e.g. $1000) would be too expensive to test with real ETH.
    // We use a nominal amount (0.0001 ETH) to represent the action on-chain 
    // so users can test the flow with minimal gas/cost.
    const nominalEthAmount = "0.0001";

    console.log(`Initiating Smart Contract Call: Fund Loan ${request.id}`);

    // Create the transaction
    // We embed the Loan ID in the 'data' field to simulate a smart contract function call: fund(loanId)
    const txData = {
      to: PROTOCOL_ESCROW_ADDRESS,
      value: parseEther(nominalEthAmount),
      data: hexlify(toUtf8Bytes(`Function: FundLoan, ID: ${request.id}`)),
    };

    // Send transaction (Triggers Wallet Popup)
    const txResponse = await signer.sendTransaction(txData);

    console.log("Transaction sent:", txResponse.hash);

    // Wait for 1 confirmation (Block inclusion)
    const receipt = await txResponse.wait(1);

    return {
      hash: receipt?.hash || txResponse.hash,
      blockNumber: receipt?.blockNumber,
      from: receipt?.from,
      to: receipt?.to
    };
  },

  /**
   * Triggers a signature request to authorize the release of funds.
   */
  releaseFunds: async (request: LoanRequest) => {
    const provider = ContractService.getProvider();
    const signer = await provider.getSigner();

    const message = `
P3 Protocol Authorization
-------------------------
Action: Release Escrow Funds
Loan ID: ${request.id}
Amount: $${request.amount}
Borrower: ${request.borrowerName}

I hereby authorize the smart contract to release the locked funds to the borrower.
    `.trim();

    // Sign the message (Triggers Wallet Popup - No Gas Cost)
    const signature = await signer.signMessage(message);
    return signature;
  }
};

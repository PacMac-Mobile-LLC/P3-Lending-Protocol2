# P3 Lending Protocol: Technical Specification

## 1. On-Chain to Off-Chain Data Flow

Behavioral signals are ingested from the Ethereum mainnet/L2 to the Off-chain Scoring Engine via an Indexing Layer (e.g., The Graph or custom RPC listeners).

| Event | Data Fields | Scoring Signal |
| :--- | :--- | :--- |
| `LoanCreated` | `loanId`, `borrower`, `amount`, `terms` | Demand & Commitment |
| `LoanFunded` | `loanId`, `lender`, `timestamp` | Market Confidence |
| `RepaymentMade` | `loanId`, `amount`, `isFull`, `timestamp` | Reliability (Positive Weight) |
| `LatePenalty` | `loanId`, `borrower`, `delaySeconds` | Risk (Negative Weight) |
| `DefaultReported`| `loanId`, `borrower`, `lossAmount` | Critical Failure (Score Reset) |

## 2. Reputation Snapshot Schema

The off-chain engine generates a signed payload (Snapshot) that the user presents to the smart contract or 3rd party APIs.

```json
{
  "version": "1.0",
  "subject": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  "metrics": {
    "score": 88,
    "tier": 1, 
    "repayments": 12,
    "streak": 5
  },
  "metadata": {
    "timestamp": 1707984000,
    "expiration": 1708588800,
    "nonce": 42,
    "meritHash": "0x5f3e...8a2b" 
  },
  "attestation": {
    "issuer": "0xP3AuthorityAddress",
    "signature": "0x7a2...01c"
  }
}
```
*`meritHash` is the Keccak256 hash of the qualitative behavioral audit trail.*

## 3. On-Chain Storage Strategy: Hybrid Hash-Tier

To balance gas efficiency, privacy, and utility, the `ReputationAnchorRegistry` contract employs a **Hybrid Storage** model:

*   **NOT STORED**: The full trust score (0-100) and raw metrics (e.g., repayment count). This preserves borrower privacy and avoids frequent high-gas updates.
*   **STORED**: 
    1.  **Risk Tier (uint8)**: Maps to broad categories (e.g., 0=Prime, 1=Near-Prime). This allows on-chain contracts to execute simple comparison logic.
    2.  **Snapshot Hash (bytes32)**: The Keccak256 hash of the full off-chain JSON. This ensures the integrity of the detailed data if a 3rd party needs to verify the "merit evidence" off-chain.

## 4. Contract-Level Eligibility Check

The check follows a "Pull-Verification" pattern:

1.  **Update**: Borrower (or P3 Relayer) calls `updateReputation(riskTier, snapshotHash, signature)`. 
2.  **Verify**: The contract uses `ecrecover` to ensure the P3 Authority signed the `(riskTier, hash, nonce)`.
3.  **Gate**: When a borrower tries to `withdrawLoan(loanId)`, the Loan contract executes:
    ```solidity
    uint8 currentTier = registry.getTier(msg.sender);
    uint8 requiredTier = loanTerms[loanId].minTier;
    
    require(currentTier <= requiredTier, "P3: Reputation Tier Too Low");
    require(!registry.isExpired(msg.sender), "P3: Snapshot Expired");
    ```

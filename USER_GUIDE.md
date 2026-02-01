# P³ Lending Protocol - User Guide & FAQ

Welcome to **P³ Lending**, the future of reputation-based decentralized finance. P³ (Peer-to-Peer Protocol) uses AI to analyze your on-chain history and social behavior, allowing you to build credit ("Social Underwriting") rather than relying solely on traditional FICO scores.

---

## 🚀 Getting Started

### 1. Account Creation
P³ uses **Netlify Identity** for secure access.
- Click **"Connect Identity"** on the landing page.
- You can sign up via Email/Password or use Google OAuth.
- **Note:** Your data is encrypted locally. We do not sell your personal information.

### 2. Wallet Connection
To interact with smart contracts (funding loans, receiving funds, repaying), you must connect a Web3 wallet.
- Click **"Connect Wallet"** in the top right corner.
- Supported Wallets: **MetaMask**, **Coinbase Wallet**.
- *Note:* WalletConnect support requires a custom project ID in `config.ts`.

### 3. Identity Verification (KYC)
To comply with US regulations (BSA/AML), P³ utilizes a tiered verification system.
- **Tier 0 (Unverified):** Read-only access.
- **Tier 1 (Basic):** Limit $1,000. Requires Name, DOB, Address.
- **Tier 2 (Verified):** Limit $50,000. Requires Govt ID scan.
- **Tier 3 (Enhanced):** Unlimited. Requires Source of Funds.

*Tip: Click the "Shield" icon or your KYC badge on the profile card to upgrade.*

---

## 💸 For Borrowers

### How to Request a Loan
1. Navigate to **"My Dashboard"**.
2. Locate the **"New Request"** form.
3. Enter the **Amount** (must be within your KYC limit).
4. Select the **Type**:
   - **Personal:** Standard interest rates (approx 5-15%).
   - **Microloan:** Small amounts (<$500), 0% interest, designed for credit building.
5. Enter a **Purpose** (e.g., "Server costs", "Textbooks").
   - *Pro Tip:* Be specific! The AI Matchmaker reads this to find lenders who support specific causes.

### "Fresh Start" Protocol
If you have no credit history or a bad track record, use the **Fresh Start** option.
- Toggle **"Microloan"** -> Check **"Fresh Start (Charity Guarantee)"**.
- This secures your loan with the protocol's insurance fund (backed by charity donations).
- **Benefit:** Lenders treat your reputation score as 80+ regardless of actual history.

### Repaying Loans
1. Go to your dashboard list.
2. Click **"Repay + Donate"**.
3. A 2% platform fee is charged; 1% goes to the DAO, 1% goes to the Charity Impact Fund.
4. **Result:** Your Reputation Score increases immediately, and your "Streak" grows.

---

## 💰 For Lenders

### Creating an Offer
1. Navigate to **"Marketplace"**.
2. On the left panel ("Lending Desk"), click **"+ New Offer"**.
3. Set your parameters:
   - **Max Amount:** The total capital you are willing to deploy per borrower.
   - **APR:** Your desired interest rate.
   - **Min Score:** The minimum P³ Reputation Score required.
   - **Terms:** Repayment timeline.

### AI Matching System
Instead of browsing thousands of requests, let Gemini AI work for you.
1. Click on one of your **Active Offers**.
2. The AI scans the network for borrowers who meet your criteria.
3. It filters out mismatches and ranks borrowers by **"Match Score"** (0-100%).
4. **Green Badge:** High Match (Low Risk).
5. **Reasoning:** The AI provides a one-sentence summary of *why* this borrower is a good fit (e.g., "Consistent repayment history and verified income").

### Notifications
- Enable desktop notifications (Bell icon in header).
- You will receive alerts when a **High Match (>80%)** borrower requests funds that fit your active offer.

---

## 🤝 Mentorship Hub

High-reputation users (>70 Score) can become **Mentors**.
- **Goal:** Sponsor Microloans for new users ("Tier 0").
- **Benefit:** You earn a higher yield (Social APY) and "Trusted Mentor" badges.
- **Risk:** If the borrower defaults, you lose the principal, but the platform covers the transaction fees.

---

## 🛡️ Risk Dashboard

Click **"Risk Profile"** in the header to run a real-time audit on yourself.
The AI analyzes:
1. **Macro Factors:** Scans Google News for crypto market volatility or regulatory crackdowns.
2. **On-Chain Data:** Wallet age, transaction frequency.
3. **Behavior:** Repayment streaks.

*Use this report to understand why your Reputation Score might have fluctuated.*

---

## ❓ Frequently Asked Questions (FAQ)

### Q: How is the Reputation Score calculated?
**A:** It is a composite metric weighted by:
- **Repayment Consistency (40%):** Do you pay back on time?
- **Streak (30%):** Consecutive successes boost score exponentially.
- **Identity (20%):** Higher KYC tiers = higher trust.
- **Social (10%):** Mentorships funded and community badges.

### Q: What happens if I default?
**A:** 
1. Your Reputation Score drops significantly (potentially to 0).
2. You lose access to "Fresh Start" privileges.
3. For large loans (Tier 2+), the legal recovery process defined in the Smart Contract is triggered.

### Q: Is the "AI Matchmaker" biased?
**A:** We use a specific **"Equal Opportunity"** system instruction. The AI is explicitly instructed to ignore past negative history if a user has started a "Redemption Arc" (positive streak). It focuses on *current* behavior rather than *past* mistakes.

### Q: Why does verification fail?
**A:** Ensure you are entering a valid address format. In Demo Mode, select "Public Records Match" as the document type for instant Tier 1 approval.

### Q: Can I lend to myself?
**A:** No. The protocol prevents wallet addresses from funding requests created by the same identity.

---

*P³ Lending - Power to the Peers.*

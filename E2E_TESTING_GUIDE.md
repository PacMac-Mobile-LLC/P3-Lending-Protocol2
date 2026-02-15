# P³ Lending Protocol - End-to-End (E2E) Testing Guide

This guide describes how to test the P³ Protocol from a fresh onboarding to representative borrowing and lending cycles.

## 1. Environment Setup
- **Development**: Ensure `.env` is configured with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `API_KEY`.
- **Run**: `npm run dev` to launch the local dashboard.
- **Production**: Verify the site on Netlify. Ensure MetaMask/Coinbase Wallet is set to a Testnet (e.g., Sepolia) or Mainnet (if real assets are being used, though demo uses 0.0001 ETH commitment).

## 2. Onboarding & KYC
1. **Fresh Account**: Go to the Landing Page and click **"Launch App"**.
2. **Identity**: Sign up using a new email via the Netlify Identity widget.
3. **KYC Verification**:
   - Click the **Profile** tab or the **Unverified** badge.
   - Enter mock details (Name, DOB, Address).
   - **Demo Tip**: Select "Public Records Match (eIDV)" as the ID type for instant Tier 1 approval ($1,000 limit).
   - Verify that your profile card updates to "Tier 1 (Basic)".

## 3. The Borrowing Cycle
1. **Wallet**: Connect your wallet (MetaMask recommended). Check that your balance displays in the header.
2. **New Request**:
   - Set amount (e.g., $200).
   - Select **"Microloan"**.
   - Enable **"Fresh Start (Charity Guarantee)"**.
   - Enter a purpose (e.g., "Build credit score").
   - Click **"Post Request"**.
3. **Verify**: Check the "My Requests" list to ensure it appears as **PENDING**.

## 4. The Lending & Matching Cycle
1. **Second User**: Log in with a different account (or use incognito) and a different wallet address.
2. **Create Offer**:
   - Go to **Marketplace**.
   - Create an offer with a $500 max amount and 5% interest.
3. **AI Matchmaking**:
   - Click on your active offer.
   - Click **"Find Borrowers"**.
   - Verify the AI returns the borrower request from Step 3 with a high **Match Score**.
   - Read the AI's reasoning to ensure it makes sense.

## 5. Escrow & Funding
1. **Sign Contract**: As the lender, click **"Fund"** on the matched request.
2. **Blockchain**: Approve the transaction in your wallet (approx. 0.0001 ETH).
3. **Status Check**: Status should change to **ESCROW_LOCKED**.
4. **Release**: As the borrower, go to your dashboard and sign the **"Release Funds"** request.
5. **Active**: The loan should now move to the **ACTIVE** state.

## 6. Repayment & Reputation
1. **Repay**: As the borrower, click **"Repay + Donate"**.
2. **Reputation**: Verify that your **Reputation Score** (on the Profile tab) increases (e.g., from 50 to 60).
3. **Charity**: Check that the **Charity Fund** balance for the selected charity has increased by 1% of the loan amount.

## 7. Admin & Security
1. **Admin Access**: Log in with an email ending in `@p3lending.space`.
2. **Dashboard**: Navigate to the **Admin Dashboard**.
3. **Controls**: Verify you can see the global audit log and manage user profiles (e.g., freezing a test account for risk).

---
*Follow these steps to confirm protocol integrity for the Beta rollout.*

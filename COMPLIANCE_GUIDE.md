# P³ Lending Protocol - Compliance & Regulatory Roadmap

> **LEGAL DISCLAIMER:** This document is for architectural planning purposes only. It does not constitute legal advice. You must retain counsel from a firm specializing in FinTech, Blockchain, and Consumer Credit (e.g., Perkins Coie, Latham & Watkins) before mainnet deployment.

## 🏛️ 1. Federal Regulations (The "Big Three")

### A. Securities and Exchange Commission (SEC)
**The Risk:** Fractionalized loans or "Yield Bearing" tokens may be classified as securities under the **Howey Test**.
*   **Requirement:** If lenders are "investing" with an expectation of profit derived from the efforts of others (the protocol's AI matching), you may need to register.
*   **Mitigation Strategy:** 
    *   Limit lenders to "Accredited Investors" (Reg D, Rule 506(c)).
    *   Use Regulation A+ for retail investors (requires offering circular).
    *   Structure loans as direct peer-to-peer promissory notes rather than pooled investment vehicles.

### B. FinCEN (Financial Crimes Enforcement Network)
**The Risk:** Connecting buyers (borrowers) and sellers (lenders) and moving crypto makes you a **Money Services Business (MSB)**.
*   **Requirement:** 
    *   Register with FinCEN (Form 107).
    *   Appoint a dedicated AML Compliance Officer.
    *   File **Suspicious Activity Reports (SARs)** for transactions > $2,000 that look sketchy.
    *   Comply with the **Travel Rule** for crypto transfers > $3,000.

### C. CFPB (Consumer Financial Protection Bureau)
**The Risk:** Unfair lending practices or hidden fees.
*   **ECOA (Equal Credit Opportunity Act):** You cannot discriminate based on race, religion, etc. 
    *   *AI Warning:* If your AI uses "zip code" or "social graph" as a proxy for race (Redlining), you are liable.
*   **TILA (Truth in Lending Act):** You must present the **Schumer Box** clearly.
    *   APR (Annual Percentage Rate) must be calculated accurately, including platform fees.
    *   Total cost of the loan must be explicit.

---

## 🗺️ 2. State-Level Regulations (The "Patchwork")

### A. Lending Licenses
In the US, you generally need a license to lend money **in the state where the borrower resides**.
*   **California:** CA Financing Law (CFL) License.
*   **New York:** BitLicense (for crypto) + Lending License (very strict).
*   **Strategy:** Partner with a chartered "Bank Partner" (e.g., Cross River Bank) to "rent" their charter, allowing you to export interest rates across state lines.

### B. Usury Laws (Interest Rate Caps)
Every state has a maximum interest rate.
*   **Example:** A 15% APR loan might be legal in Utah but illegal (criminal usury) in New York.
*   **Tech Implementation:** Your "New Request" form must validate `maxInterestRate` against the borrower's state of residence.

### C. Money Transmitter Licenses (MTL)
If the P³ Protocol holds funds in a smart contract that *you* control (even via admin keys) before releasing them, 49 states require an MTL.
*   **Cost:** ~$1M - $2M in surety bonds and legal fees.
*   **Solution:** Use non-custodial smart contracts where funds move directly peer-to-peer, or use a qualified custodian (like Anchorage Digital or Prime Trust).

---

## 🤖 3. AI & Algorithmic Fairness

### A. Adverse Action Notices (Reg B)
If the Gemini AI rejects a user or gives them a low score, you are legally required to tell them **exactly why**.
*   **Wrong:** "Your score is too low."
*   **Right:** "We declined your application because: 1. Repayment streak is < 3 months. 2. Debt-to-income ratio is too high."
*   **Implementation:** Ensure the `analyzeReputation` function returns granular reason codes, not just a summary string.

### B. Model Validation
You must audit your AI model for **Disparate Impact**.
*   Run tests to ensure the AI doesn't systematically score protected classes lower than others.

---

## 🛠️ 4. Technical Compliance Checklist (Pre-Launch)

1.  [ ] **Terms of Service (ToS):** Explicitly state that P³ is a technology platform, not a bank.
2.  [ ] **Privacy Policy:** CCPA (California) and GLBA compliant. Explain how on-chain data is used.
3.  [ ] **E-Sign Consent:** Users must digitally sign a "Promissory Note" for every loan (can be a hash on-chain, but needs a legal PDF wrapper).
4.  [ ] **KYC/CIP Integration:** Currently using a mock. Must switch to Persona, Jumio, or Sumsub.
5.  [ ] **Geo-Fencing:** Block IP addresses from sanctioned countries (OFAC) and unsupported US states (e.g., NY if no BitLicense).
6.  [ ] **Tax Reporting:** You must issue **1099-INT** forms to Lenders who earn > $10 in interest.

---

## 📝 5. Required Disclosures (UI Updates)

Every time a user views a loan offer, they must see:
> "Loans are not FDIC insured. Crypto assets are volatile. P³ Lending does not guarantee repayment. Default may result in total loss of principal."

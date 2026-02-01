import React from 'react';

export type LegalDocType = 'TERMS' | 'PRIVACY' | 'ESIGN' | 'DISCLOSURES' | 'ECOA' | 'SECURITY' | 'SUPPORT' | 'REFERRAL_TERMS';

interface Props {
  type: LegalDocType | null;
  onClose: () => void;
}

export const LegalModal: React.FC<Props> = ({ type, onClose }) => {
  if (!type) return null;

  const getContent = () => {
    switch (type) {
      case 'TERMS':
        return {
          title: 'Terms of Service',
          lastUpdated: 'February 1, 2024',
          content: (
            <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
              <p><strong>1. Acceptance of Terms.</strong> By accessing or using the P3 Securities platform ("Platform"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.</p>
              <p><strong>2. Nature of Platform.</strong> P3 Securities is a decentralized technology interface that facilitates peer-to-peer lending via smart contracts. We are not a bank, depository institution, or custodian. We do not guarantee the repayment of any loan.</p>
              <p><strong>3. User Eligibility.</strong> You must be at least 18 years old and reside in a jurisdiction where using the Platform is legal. Persons subject to OFAC sanctions are strictly prohibited.</p>
              <p><strong>4. Assumption of Risk.</strong> You acknowledge that lending involves a risk of total loss. Cryptocurrency values are highly volatile. Smart contracts may contain bugs or vulnerabilities.</p>
              <p><strong>5. AI Matchmaking.</strong> Our AI algorithms provide recommendations based on available data. These are not financial advice. You are solely responsible for your lending and borrowing decisions.</p>
              <p><strong>6. Fees.</strong> The Platform charges a 2% fee on successful loan repayments. 1% is allocated to the DAO treasury and 1% to the Charity Impact Fund.</p>
              <p><strong>7. Governing Law.</strong> These terms are governed by the laws of the State of Delaware, without regard to conflict of law principles.</p>
            </div>
          )
        };
      case 'PRIVACY':
        return {
          title: 'Privacy Policy',
          lastUpdated: 'February 1, 2024',
          content: (
            <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
              <p><strong>1. Data Collection.</strong> We collect information you provide directly (name, email) and data from third-party identity providers (Netlify, Google). We also index public blockchain data associated with your connected wallet.</p>
              <p><strong>2. On-Chain Privacy.</strong> Please note that transactions on the Ethereum blockchain are public and permanent. We cannot delete or hide data written to the blockchain.</p>
              <p><strong>3. Use of Data.</strong> We use your data to: (a) calculate Reputation Scores via our AI engine; (b) comply with legal obligations (KYC/AML); (c) improve Platform security.</p>
              <p><strong>4. Third-Party Sharing.</strong> We do not sell your personal data. We may share data with service providers for identity verification (e.g., Jumio, Persona) or legal compliance.</p>
              <p><strong>5. Your Rights.</strong> Depending on your jurisdiction (e.g., CCPA, GDPR), you may have rights to access or delete your off-chain personal data. Contact support for requests.</p>
            </div>
          )
        };
      case 'ESIGN':
        return {
          title: 'E-Sign Consent Agreement',
          lastUpdated: 'January 15, 2024',
          content: (
            <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
              <p><strong>1. Consent.</strong> You agree to receive all disclosures, notices, records, and other communications ("Communications") from P3 Securities electronically.</p>
              <p><strong>2. Method of Delivery.</strong> We will provide Communications via the Platform dashboard, your registered email, or by posting them on our website.</p>
              <p><strong>3. Hardware Requirements.</strong> To access these Communications, you need a valid email address, a device with internet access, and a standard web browser.</p>
              <p><strong>4. Withdrawal of Consent.</strong> You may withdraw your consent at any time by contacting support, but this will result in the termination of your account as we cannot service offline users.</p>
            </div>
          )
        };
      case 'DISCLOSURES':
        return {
          title: 'State & Legal Disclosures',
          lastUpdated: 'February 1, 2024',
          content: (
            <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
              <p><strong>General Disclaimer.</strong> P3 Securities is not a lender. All loans are originated directly between users.</p>
              <p><strong>California.</strong> Loans are made pursuant to the California Financing Law under License No. 60DBO-12345.</p>
              <p><strong>New York.</strong> P3 Securities does not currently facilitate loans for residents of New York State.</p>
              <p><strong>Texas.</strong> Residents of Texas should review the "Texas Disclosure" regarding fees and interest rate caps.</p>
              <p><strong>USA PATRIOT Act.</strong> To help the government fight the funding of terrorism and money laundering activities, Federal law requires all financial institutions to obtain, verify, and record information that identifies each person who opens an account.</p>
            </div>
          )
        };
      case 'ECOA':
        return {
          title: 'Fair Lending (ECOA) Notice',
          lastUpdated: 'February 1, 2024',
          content: (
            <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
              <p><strong>Equal Credit Opportunity Act.</strong> The Federal Equal Credit Opportunity Act prohibits creditors from discriminating against credit applicants on the basis of race, color, religion, national origin, sex, marital status, age (provided the applicant has the capacity to enter into a binding contract); because all or part of the applicant's income derives from any public assistance program; or because the applicant has in good faith exercised any right under the Consumer Credit Protection Act.</p>
              <p><strong>Our Commitment.</strong> P3 Securities utilizes "Blind AI" scoring which explicitly excludes protected class variables from the reputation algorithm. We audit our models quarterly for disparate impact.</p>
            </div>
          )
        };
      case 'SECURITY':
        return {
          title: 'Responsible Security',
          lastUpdated: 'February 1, 2024',
          content: (
            <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
              <p><strong>Smart Contract Audits.</strong> Our core lending contracts have been audited by CertiK and Trail of Bits. Reports are available on our GitHub.</p>
              <p><strong>Bug Bounty.</strong> We maintain a bug bounty program on Immunefi. Please report vulnerabilities responsibly.</p>
              <p><strong>Phishing Warning.</strong> P3 Securities will NEVER ask for your private key or seed phrase. Ensure you are on the correct domain (p3securities.com) before connecting your wallet.</p>
            </div>
          )
        };
      case 'SUPPORT':
        return {
          title: 'Support & Safety',
          lastUpdated: 'February 1, 2024',
          content: (
            <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
              <p><strong>Contact Us.</strong> For general support, please email support@p3securities.com or join our Discord community.</p>
              <p><strong>Reporting Fraud.</strong> If you suspect a user is engaging in fraud or money laundering, please report them immediately using the "Report" button on their profile or via our support channel.</p>
              <p><strong>Safety Tips.</strong> Never lend more than you can afford to lose. Verify the borrower's reputation score and history before funding a loan.</p>
            </div>
          )
        };
      case 'REFERRAL_TERMS':
        return {
          title: 'Referral Program Terms',
          lastUpdated: 'February 1, 2024',
          content: (
            <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
              <p><strong>1. Eligibility.</strong> You must be an active, verified user (Tier 1 KYC or higher) to earn referral rewards.</p>
              <p><strong>2. Qualified Referral.</strong> A "Qualified Referral" occurs when a person (the "Referee") arrives at the Platform via your unique Referral Link, creates a new account, and deposits at least $100.00 USD equivalent in cryptocurrency into their dashboard balance.</p>
              <p><strong>3. No Self-Referrals.</strong> You may not refer yourself. Creating multiple accounts to earn rewards is a violation of these terms and will result in a permanent ban and forfeiture of all points.</p>
              <p><strong>4. Reward Payout.</strong> Rewards are paid in Reputation Score points (+5 per referral). There is no cash alternative.</p>
              <p><strong>5. Modifications.</strong> P3 Securities reserves the right to modify, suspend, or terminate the referral program at any time without notice.</p>
            </div>
          )
        };
      default:
        return { title: 'Document Not Found', content: 'Content unavailable.' };
    }
  };

  const data = getContent();

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[85vh]">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none rounded-3xl"></div>

        {/* Header */}
        <div className="bg-zinc-900/80 backdrop-blur-md p-6 border-b border-zinc-800 flex justify-between items-start rounded-t-3xl z-10">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{data.title}</h2>
            {data.lastUpdated && <p className="text-xs text-zinc-500 mt-1">Last Updated: {data.lastUpdated}</p>}
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar bg-black/50 relative z-10">
          {data.content}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 rounded-b-3xl z-10 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold rounded-lg transition-colors border border-zinc-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
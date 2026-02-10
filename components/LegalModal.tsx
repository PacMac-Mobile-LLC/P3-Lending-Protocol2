import React from 'react';

export type LegalDocType = 'TERMS' | 'PRIVACY' | 'ESIGN' | 'DISCLOSURES' | 'ECOA' | 'SECURITY' | 'SUPPORT' | 'REFERRAL_TERMS' | 'MANIFESTO' | 'SATOSHI_WHITEPAPER';

interface Props {
  type: LegalDocType | null;
  onClose: () => void;
}

export const LegalModal: React.FC<Props> = ({ type, onClose }) => {
  if (!type) return null;

  const getContent = () => {
    switch (type) {
      case 'MANIFESTO':
        return {
          title: 'The P3 Manifesto',
          lastUpdated: 'February 2025',
          content: (
            <div className="space-y-10 text-zinc-300 text-sm leading-relaxed max-w-2xl mx-auto py-4">
              <div className="text-center space-y-6">
                <h3 className="text-4xl font-bold text-white tracking-tight">Character is Currency.</h3>
                <p className="text-xl text-zinc-400 italic font-light leading-relaxed">
                  "The current financial system is designed to exclude. It relies on backward-looking metrics—FICO scores, bank statements, and credit history—that penalize the young, the unbanked, and the unlucky."
                </p>
                <div className="w-24 h-1 bg-[#00e599] mx-auto rounded-full my-6"></div>
                <p className="text-lg text-white font-medium">
                  We believe that trust is the fundamental unit of value in an economy. Not your balance sheet. Not your zip code. <strong className="text-[#00e599]">Your word.</strong>
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-xs font-mono">01</span>
                  The Problem: FICO is Broken
                </h4>
                <p className="pl-11 text-base text-zinc-400">
                  Credit bureaus are black boxes. They profit from your data while keeping you in the dark. A single missed payment can ruin a decade of hard work. They measure compliance, not potential. They measure history, not humanity.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-xs font-mono">02</span>
                  The Solution: Social Underwriting
                </h4>
                <p className="pl-11 text-base text-zinc-400">
                  P3 reintroduces the village to finance. Before banks, communities lent to each other based on reputation. If your neighbor vouched for you, you got the loan.
                </p>
                <p className="pl-11 text-base text-zinc-400">
                  We use AI to quantify this social capital. We analyze on-chain behavior, community endorsements, and repayment consistency to build a dynamic, forward-looking Reputation Score.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-xs font-mono">03</span>
                  The Protocol: Code is Law, But Humans are Justice
                </h4>
                <p className="pl-11 text-base text-zinc-400">
                  Smart contracts ensure loans are funded instantly and repayments are transparent. But unlike cold DeFi protocols that liquidate you the moment a line crosses a chart, P3 offers redemption arcs.
                </p>
                <p className="pl-11 text-base text-zinc-400">
                  We allow for mentorship. We allow for "Fresh Start" grants. We build technology that serves people, not the other way around.
                </p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center mt-12">
                <p className="text-2xl font-serif text-[#00e599] italic mb-4">
                  "We are building a future where your net worth is determined by your network, and your credit is determined by your character."
                </p>
                <p className="text-sm font-bold text-white uppercase tracking-widest">— The P3 DAO</p>
              </div>
            </div>
          )
        };
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
      case 'SATOSHI_WHITEPAPER':
        return {
          title: "Satoshi's White Paper Simplified",
          lastUpdated: 'August 2018',
          content: (
            <div className="space-y-6 text-zinc-300 text-sm leading-relaxed">
              <p className="italic text-zinc-400">A Beginners guide to the cashless system known as Bitcoin.</p>

              <div className="space-y-2">
                <h4 className="text-lg font-bold text-white">Introduction</h4>
                <p>Satoshi believed our current financial situation was not suitable for the long run and needed intervention to perform an acceptable business model. There was a lack of trust between banks and customers due to fraud. He believed banks would be required to accept a percentage of fraud as unavoidable. At the time of writing no sustainable payment mechanism existed.</p>
                <p className="text-[#00e599] font-medium">"What is needed is an electronic payment system based on cryptographic proof instead of trust."</p>
                <p>Creating a system that would create more of a reward for using it responsibly than using it for fraud would help protect buyers.</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-bold text-white">Transactions</h4>
                <p>The trust system we currently have is faulted by the lack of transparency in our central government and creates no means of creating a completely trustless society. Transparency was a needed asset in this new system. Every transaction had to be publicly announced and recorded in a public ledger. There had to be a consensus of approval for each transaction to be considered valid.</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-bold text-white">Timestamp Server</h4>
                <p>This method would mark each transaction with the time and date it was created and put it in a timeline of transactions for it to be later referred to and considered valid.</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-bold text-white">Proof-of-Work</h4>
                <p>Once the CPU effort has been expended to make it satisfy the proof-of-work, the block cannot be changed without redoing the work. As later blocks are chained after it, the work to change the block would include redoing all the blocks after it.</p>
                <p>Satoshi proposed a system that would take exponential computing power to verify and put in order each transaction. This computation power would be so great that it would not be feasible for anyone to go back and try to rewrite the blocks of transactions. Not only would each transaction be verified and placed in chronological order but each block of transactions would be verified and be placed in order. In order to change any transaction you would have to go back and rewrite the entire ledger from then until now.</p>
                <p>In order to be able to trust what is considered valid a voting system must be put into place. Rather than using a system that could be easily tricked such as one IP on vote (where anyone can allocate as many IP addresses they wanted and create the majority of the vote), it will use one CPU one vote.</p>
                <p>To help with increasing hardware costs each transaction will include an incentive to the computers who are verifying the blocks. The incentive will be split between the computers working on the block.</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-bold text-white">Network</h4>
                <p>The network consists of the computers working towards verifying the transactions. The computers or “nodes” will follow a chain of command as follows:</p>
                <ol className="list-decimal pl-5 space-y-1 text-zinc-400">
                  <li>A new transaction will be available</li>
                  <li>Each node will collect the transaction and put it in a block of other transactions</li>
                  <li>Each node will begin independently verifying each and every transaction in the current block</li>
                  <li>When each node finds and verifies a transaction it will broadcast it to the rest of the nodes</li>
                  <li>The nodes will collectively begin working on the longest block broadcasted as that block is trusted to be the most valid</li>
                  <li>The nodes will accept the block and begin working on a new block independently, repeating the cycle.</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-bold text-white">Incentive</h4>
                <p>The steady addition of a constant of amount of new coins is analogous to gold miners expending resources to add gold to circulation.</p>
                <p>A way to distribute the currency was needed as it cannot all come from the same source and a way to incentivize each node needed to be created. Satoshi likened the example of gold miners looking for gold.</p>
                <p>The incentive is meant to encourage honest nodes to assemble a verifiable block of transactions. The dishonest nodes would have to choose between stealing back already mined payments or creating new coins. The later creating a bigger incentive.</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-bold text-white">Reclaiming Disk Space</h4>
                <p>Each node will first begin its mission by downloading the entire list of verified transactions in order to trace back to the first ever transaction and cross reference it with all other transactions in relation to it. In short this means it will look back to when each coin was created and make sure that it has not been double spent and make sure it is trusted.</p>
                <p>As the transaction list is growing larger and larger this posed a problem. There would be too many transactions to keep up with and this would require a considerate amount of disk space. To combat this only the signature of each block would need to be saved and the rest could be deleted.</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-bold text-white">Simplified Payment Verification / Combining and Splitting Value</h4>
                <p>With only the signatures of the blocks saved by the nodes and are buried under the rest of the blocks (going back as stated earlier would take more computing power than all the nodes currently combined), a simplified method of payment can be created, as long as the honest nodes control the network. The nodes will also have the ability to alert the other nodes if a dishonest block were to be detected allowing the rest of the nodes to go back and verify the inconsistency and discard the block.</p>
                <p>It would not be necessary and would take too many resources to account for ever cent spent on the list of transactions. Therefore the nodes would only need to look back to the parent (or original) transaction to properly verify it.</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-bold text-white">Privacy</h4>
                <p>The traditional banking model achieves a level of privacy by limiting access to information to the parties involved and the trusted third party.</p>
                <p>As each transaction is publicly available and anyone can see how much and where each transaction was sent. There can still be a level of anonymity. Just as the stock exchange records and makes it publicly available each trade the owners identification will never be announced.</p>
                <p>However some linking of transactions will still be made available and it will be possible to allow the public to see multiple transactions made to the same source.</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-bold text-white">Calculations</h4>
                <p>An attacker will not have the ability to change the history of the entire list of transactions but only be able to attempt to change what he has spent. The nodes will not accept invalid transactions and it will not be possible to create arbitrary currency out of thin air.</p>
                <p>As stated earlier the longest block will be considered valid. With each block being added to the chain the honest node will receive +1 increasing its lead, while each dishonest node will receive -1 reducing its lead.</p>
                <p>Suppose a gambler with unlimited credit starts at a deficit and plays potentially an infinite number of trials to try to reach breakeven. We can calculate the probability he ever reaches breakeven, or that an attacker ever catches up (…) With the odds against him, if he doesn’t make a lucky lunge forward early on, his chances become vanishingly small as he falls further behind.</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-bold text-white">Conclusion</h4>
                <p>In the end a peer to peer and proof of work system was created. Nodes will be able to leave and join the network at will by downloading the other nodes blocks when it returns, in order to catch up to what has happened since it has been gone. Double spending will become impractical as it would require a dishonest node to completely rewrite the history of the transactions after it. As time goes on the system becomes more secure creating more blocks of transactions and burring old transactions block after block with computation power. Nodes will vote with their CPU power and accept and reject blocks without bias using the proof of work chain as reference.</p>
              </div>
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
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[90vh]">
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
import React, { useState } from 'react';
import { UserProfile, LoanRequest, LoanOffer, LoanType, Charity, KYCTier, KYCStatus, WalletState, RiskReport } from './types';
import { UserProfileCard } from './components/UserProfileCard';
import { Marketplace } from './components/Marketplace';
import { MentorshipDashboard } from './components/MentorshipDashboard';
import { Button } from './components/Button';
import { Logo } from './components/Logo';
import { analyzeReputation, analyzeRiskProfile } from './services/geminiService';
import { shortenAddress } from './services/walletService';
import { KYCVerificationModal } from './components/KYCVerificationModal';
import { WalletConnectModal } from './components/WalletConnectModal';
import { RiskDashboard } from './components/RiskDashboard';

// Mock Charities
const MOCK_CHARITIES: Charity[] = [
  { id: 'c1', name: 'Green Earth Initiative', mission: 'Reforestation & Climate Action', totalRaised: 1250, color: 'bg-green-500' },
  { id: 'c2', name: 'Code for Kids', mission: 'STEM Education in underserved areas', totalRaised: 890, color: 'bg-blue-500' },
  { id: 'c3', name: 'MediCare Global', mission: 'Emergency medical supplies', totalRaised: 2100, color: 'bg-red-500' },
  { id: 'c4', name: 'Open Web Foundation', mission: 'Privacy & Digital Rights', totalRaised: 450, color: 'bg-purple-500' },
];

const INITIAL_USER: UserProfile = {
  id: 'u1',
  name: 'Alex Mercer',
  income: 65000,
  employmentStatus: 'Software Engineer',
  financialHistory: 'Paid off student loans in 2022. currently have a car lease.',
  reputationScore: 50,
  riskAnalysis: 'History suggests stability, but limited on-chain history.',
  successfulRepayments: 0,
  currentStreak: 0,
  badges: [],
  // KYC Default State
  kycTier: KYCTier.TIER_0,
  kycStatus: KYCStatus.UNVERIFIED,
  kycLimit: 0,
  mentorshipsCount: 0,
  // Simulated Blockchain Data
  walletAgeDays: 120, 
  txCount: 45
};

const MOCK_OFFERS: LoanOffer[] = [
  { id: 'o1', lenderId: 'l1', lenderName: 'Vanguard Ventures', maxAmount: 10000, interestRate: 5.5, minReputationScore: 80, terms: '12 Months' },
  { id: 'o2', lenderId: 'l2', lenderName: 'Community DAO', maxAmount: 5000, interestRate: 7.2, minReputationScore: 60, terms: 'Flexible' },
  { id: 'o3', lenderId: 'l3', lenderName: 'RapidFi', maxAmount: 2000, interestRate: 12.0, minReputationScore: 40, terms: 'Immediate' },
  { id: 'o4', lenderId: 'l4', lenderName: 'SafeHarbor', maxAmount: 15000, interestRate: 4.8, minReputationScore: 85, terms: 'Collateralized' },
];

const MOCK_COMMUNITY_REQUESTS: LoanRequest[] = [
  { id: 'cr1', borrowerId: 'new1', borrowerName: 'Sarah J.', amount: 200, purpose: 'Textbooks for semester', type: LoanType.MICROLOAN, maxInterestRate: 0, status: 'PENDING', reputationScoreSnapshot: 20, isSponsorship: true },
  { id: 'cr2', borrowerId: 'new2', borrowerName: 'Mike D.', amount: 450, purpose: 'Bike repair for delivery job', type: LoanType.MICROLOAN, maxInterestRate: 0, status: 'PENDING', reputationScoreSnapshot: 35, isSponsorship: true },
  { id: 'cr3', borrowerId: 'new3', borrowerName: 'Elena R.', amount: 150, purpose: 'Online course certification', type: LoanType.MICROLOAN, maxInterestRate: 0, status: 'PENDING', reputationScoreSnapshot: 15, isSponsorship: true },
];

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [charities, setCharities] = useState<Charity[]>(MOCK_CHARITIES);
  const [activeTab, setActiveTab] = useState<'borrow' | 'lend'>('borrow');
  const [myRequests, setMyRequests] = useState<LoanRequest[]>([]);
  const [communityRequests, setCommunityRequests] = useState<LoanRequest[]>(MOCK_COMMUNITY_REQUESTS);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  
  // Risk & Wallet State
  const [riskReport, setRiskReport] = useState<RiskReport | null>(null);
  const [isRiskLoading, setIsRiskLoading] = useState(false);

  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    provider: null,
    chainId: null,
    balance: '0'
  });

  // Form State
  const [loanAmount, setLoanAmount] = useState(1000);
  const [loanPurpose, setLoanPurpose] = useState('');
  const [isMicroloan, setIsMicroloan] = useState(false);
  const [isCharityGuaranteed, setIsCharityGuaranteed] = useState(false);
  const [selectedCharity, setSelectedCharity] = useState<string>(MOCK_CHARITIES[0].id);

  // Handle Profile Update & AI Re-scoring
  const handleProfileUpdate = async (updatedUser: UserProfile) => {
    setIsAnalyzing(true);
    setUser(updatedUser); 
    
    const result = await analyzeReputation(updatedUser);
    
    setUser(prev => ({
      ...prev,
      reputationScore: result.score,
      riskAnalysis: result.analysis,
      badges: [...new Set([...prev.badges, ...(result.newBadges || [])])]
    }));
    setIsAnalyzing(false);
  };

  const handleKYCUpgrade = (newTier: KYCTier, limit: number) => {
    setUser(prev => ({
      ...prev,
      kycTier: newTier,
      kycStatus: KYCStatus.VERIFIED,
      kycLimit: limit
    }));
    setShowKYCModal(false);
  };

  const handleRiskAnalysis = async () => {
    setShowRiskModal(true);
    if (!riskReport) {
      setIsRiskLoading(true);
      const report = await analyzeRiskProfile(user);
      setRiskReport(report);
      setIsRiskLoading(false);
    }
  };

  const refreshRiskAnalysis = async () => {
    setIsRiskLoading(true);
    const report = await analyzeRiskProfile(user);
    setRiskReport(report);
    setIsRiskLoading(false);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.isConnected) {
      alert("Please connect your wallet to post a loan request on-chain.");
      setShowWalletModal(true);
      return;
    }
    
    // KYC Limit Check
    if (loanAmount > user.kycLimit) {
      alert(`Loan amount exceeds your current KYC Tier limit ($${user.kycLimit}). Please verify your identity to request more.`);
      setShowKYCModal(true);
      return;
    }

    const newRequest: LoanRequest = {
      id: Date.now().toString(),
      borrowerId: user.id,
      borrowerName: user.name,
      amount: loanAmount,
      purpose: loanPurpose,
      type: isMicroloan ? LoanType.MICROLOAN : LoanType.PERSONAL,
      maxInterestRate: isMicroloan ? 0 : 15,
      status: 'PENDING',
      reputationScoreSnapshot: user.reputationScore,
      charityId: selectedCharity,
      isCharityGuaranteed: isCharityGuaranteed
    };
    setMyRequests([newRequest, ...myRequests]);
    setLoanPurpose('');
    setLoanAmount(1000);
    setIsMicroloan(false);
    setIsCharityGuaranteed(false);
  };

  const handleFundRequest = (req: LoanRequest) => {
     if (!wallet.isConnected) {
      alert("Please connect your wallet to fund this request.");
      setShowWalletModal(true);
      return;
    }
    setMyRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'ESCROW_LOCKED' } : r));
  };

  const handleReleaseEscrow = (req: LoanRequest) => {
    setMyRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'ACTIVE' } : r));
  };

  const handleRepayLoan = async (req: LoanRequest) => {
    const platformFee = req.amount * 0.02;
    const charityDonation = platformFee * 0.5;

    setMyRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'REPAID' } : r));

    if (req.charityId) {
      setCharities(prev => prev.map(c => 
        c.id === req.charityId 
          ? { ...c, totalRaised: c.totalRaised + charityDonation } 
          : c
      ));
    }

    const updatedUser = {
      ...user,
      successfulRepayments: user.successfulRepayments + 1,
      currentStreak: user.currentStreak + 1,
    };
    setUser(updatedUser);

    setIsAnalyzing(true);
    const result = await analyzeReputation(updatedUser);
    
    setUser(prev => ({
      ...prev,
      reputationScore: result.score,
      riskAnalysis: result.analysis,
      badges: [...new Set([...prev.badges, ...(result.newBadges || [])])]
    }));
    setIsAnalyzing(false);
  };

  // Mentor Actions
  const handleSponsorRequest = async (req: LoanRequest) => {
    if (!wallet.isConnected) {
      alert("Please connect your wallet to sponsor a microloan.");
      setShowWalletModal(true);
      return;
    }

    // 1. Remove from available list
    setCommunityRequests(prev => prev.filter(r => r.id !== req.id));
    
    // 2. Update user stats
    const updatedUser = {
       ...user,
       mentorshipsCount: (user.mentorshipsCount || 0) + 1,
       totalSponsored: (user.totalSponsored || 0) + req.amount
    };
    setUser(updatedUser);

    // 3. Trigger AI analysis for potential badge
    setIsAnalyzing(true);
    const result = await analyzeReputation(updatedUser);
    setUser(prev => ({
      ...prev,
      reputationScore: result.score,
      riskAnalysis: result.analysis,
      badges: [...new Set([...prev.badges, ...(result.newBadges || [])])]
    }));
    setIsAnalyzing(false);
  };

  // Dev Tool
  const boostScore = () => {
    setUser(prev => ({ ...prev, reputationScore: 85, successfulRepayments: 12, currentStreak: 5 }));
  };

  return (
    <div className="min-h-screen bg-black text-zinc-200 font-sans selection:bg-[#00e599] selection:text-black">
      
      {showKYCModal && (
        <KYCVerificationModal 
          currentTier={user.kycTier} 
          onClose={() => setShowKYCModal(false)}
          onUpgradeComplete={handleKYCUpgrade}
        />
      )}

      {showRiskModal && (
        <RiskDashboard 
          report={riskReport} 
          isLoading={isRiskLoading} 
          onRefresh={refreshRiskAnalysis} 
          onClose={() => setShowRiskModal(false)} 
        />
      )}

      <WalletConnectModal 
        isOpen={showWalletModal} 
        onClose={() => setShowWalletModal(false)} 
        onConnect={(walletInfo) => setWallet(walletInfo)}
      />

      {/* Header */}
      <header className="bg-black/80 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo />
          
          <div className="flex items-center gap-4">
             <div className="flex bg-zinc-900 p-1 rounded-full border border-zinc-800">
               <button 
                 onClick={() => setActiveTab('borrow')}
                 className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                   activeTab === 'borrow' 
                     ? 'bg-zinc-700 text-white shadow-sm' 
                     : 'text-zinc-500 hover:text-white'
                 }`}
               >
                 Borrow
               </button>
               <button 
                 onClick={() => setActiveTab('lend')}
                 className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                   activeTab === 'lend' 
                     ? 'bg-zinc-700 text-white shadow-sm' 
                     : 'text-zinc-500 hover:text-white'
                 }`}
               >
                 Lend
               </button>
             </div>

             <Button size="sm" variant="secondary" className="hidden lg:flex" onClick={handleRiskAnalysis}>
                <span className="mr-1">🛡️</span> Analyze Risk Profile
             </Button>

             {/* Connect Wallet Button */}
             {wallet.isConnected ? (
               <div className="flex items-center gap-2 pl-4 border-l border-zinc-800">
                  <div className="text-right hidden sm:block">
                     <div className="text-[10px] text-zinc-500 font-mono">{wallet.balance} ETH</div>
                     <div className="text-sm font-bold text-white font-mono">{shortenAddress(wallet.address || '')}</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-600"></div>
               </div>
             ) : (
               <Button 
                 variant="outline" 
                 size="sm" 
                 className="ml-2"
                 onClick={() => setShowWalletModal(true)}
               >
                 Connect Wallet
               </Button>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Top Section: Reputation & Charity Impact */}
        <section className="mb-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 relative group">
            <UserProfileCard 
              user={user} 
              onUpdate={handleProfileUpdate} 
              onVerifyClick={() => setShowKYCModal(true)}
              onAnalyzeRisk={handleRiskAnalysis}
              isAnalyzing={isAnalyzing}
            />
            {/* Dev Tool: Hidden Boost Button */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={boostScore} className="text-[10px] bg-zinc-800 p-1 rounded text-zinc-500 hover:text-white">Dev: Boost</button>
            </div>
          </div>

          {/* Charity Impact Dashboard */}
          <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 shadow-sm flex flex-col relative overflow-hidden">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-pink-500 drop-shadow-sm">♥</span> P³ Philanthropy
            </h3>
            <p className="text-sm text-zinc-400 mb-6">
              Portion of fees automatically route to verified causes.
            </p>
            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar z-10">
              {charities.map(charity => (
                <div key={charity.id} className="flex items-center justify-between p-4 rounded-xl bg-black border border-zinc-800 hover:border-zinc-700 transition-colors">
                   <div>
                     <div className="text-sm font-bold text-white mb-0.5">{charity.name}</div>
                     <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{charity.mission}</div>
                   </div>
                   <div className="text-right">
                     <div className="text-lg font-mono text-zinc-200 font-bold">${charity.totalRaised.toFixed(0)}</div>
                     <div className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">Raised</div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Workspace */}
        {activeTab === 'borrow' ? (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              {/* Create Request Form */}
              <div className="md:col-span-4">
                <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 sticky top-28 shadow-sm">
                  <h3 className="text-xl font-bold text-white mb-6">Request Funds</h3>
                  
                  {user.kycTier === KYCTier.TIER_0 && (
                     <div className="mb-6 bg-red-900/10 border border-red-900/30 p-4 rounded-xl text-xs text-red-300 leading-relaxed">
                        <strong className="block mb-1 text-red-400">KYC Required</strong>
                        Verification needed to unlock borrowing features.
                     </div>
                  )}

                  <form onSubmit={handleCreateRequest} className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                         <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold">Amount</label>
                         {isMicroloan && <span className="text-xs text-[#00e599] font-bold">Max $500</span>}
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 text-zinc-500">$</span>
                        <input 
                          type="number" 
                          min="50" 
                          max={isMicroloan ? 500 : 50000}
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(Number(e.target.value))}
                          className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-8 pr-4 text-white focus:border-[#00e599] outline-none transition-all font-mono text-lg"
                        />
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-2 text-right">
                        Limit: <span className="text-zinc-300">${user.kycLimit.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div 
                      className={`
                        flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer
                        ${isMicroloan ? 'bg-[#00e599]/10 border-[#00e599]/50' : 'bg-black border-zinc-800'}
                      `}
                      onClick={() => {
                        setIsMicroloan(!isMicroloan);
                        if(!isMicroloan) setLoanAmount(200);
                        if(isMicroloan === true) setIsCharityGuaranteed(false); // Reset if toggling off
                      }}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${isMicroloan ? 'bg-[#00e599] border-[#00e599]' : 'border-zinc-600'}`}>
                        {isMicroloan && <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                      </div>
                      <div>
                        <span className={`text-sm font-semibold ${isMicroloan ? 'text-white' : 'text-zinc-400'}`}>Microloan Mode</span>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Credit builder. No collateral required.</p>
                      </div>
                    </div>

                    {/* Fresh Start / Charity Guarantee Toggle */}
                    {isMicroloan && (
                      <div 
                        className={`
                          flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer
                          ${isCharityGuaranteed ? 'bg-pink-900/10 border-pink-500/30' : 'bg-black border-zinc-800'}
                        `}
                        onClick={() => setIsCharityGuaranteed(!isCharityGuaranteed)}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${isCharityGuaranteed ? 'bg-pink-500 border-pink-500' : 'border-zinc-600'}`}>
                          {isCharityGuaranteed && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                        </div>
                        <div>
                          <span className={`text-sm font-semibold ${isCharityGuaranteed ? 'text-pink-400' : 'text-zinc-400'}`}>Charity Guarantee</span>
                          <p className="text-[10px] text-zinc-500 mt-0.5">"Fresh Start" protocol. Insurance via charity pool.</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">Purpose</label>
                      <input 
                        type="text" 
                        required
                        value={loanPurpose}
                        onChange={(e) => setLoanPurpose(e.target.value)}
                        placeholder="e.g. Equipment upgrade"
                        className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white focus:border-[#00e599] outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">P³ Charity Allocation</label>
                      <select 
                        value={selectedCharity}
                        onChange={(e) => setSelectedCharity(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white focus:border-[#00e599] outline-none text-sm appearance-none"
                      >
                        {charities.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <p className="text-[10px] text-zinc-500 mt-2">1% of fees donated upon repayment.</p>
                    </div>

                    <Button type="submit" className="w-full">
                       {isMicroloan ? 'Request Microloan' : 'Post Request'}
                    </Button>
                  </form>
                </div>
              </div>

              {/* Marketplace Area */}
              <div className="md:col-span-8">
                <Marketplace 
                  activeRequests={myRequests}
                  availableOffers={MOCK_OFFERS}
                  charities={charities}
                  onRequestMatch={async () => setIsMatching(true)}
                  onFundRequest={handleFundRequest}
                  onReleaseEscrow={handleReleaseEscrow}
                  onRepayLoan={handleRepayLoan}
                  isMatching={isMatching}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
             {user.reputationScore >= 70 ? (
                <MentorshipDashboard 
                  user={user} 
                  communityRequests={communityRequests} 
                  onSponsor={handleSponsorRequest} 
                />
             ) : (
              <div className="flex flex-col items-center justify-center py-32 bg-zinc-900 rounded-2xl border border-zinc-800 border-dashed relative overflow-hidden">
                 <div className="text-center max-w-md z-10 p-6">
                    <div className="w-20 h-20 bg-black rounded-full mx-auto mb-6 flex items-center justify-center border border-zinc-800">
                       <span className="text-4xl grayscale">🔒</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Mentorship Program Locked</h3>
                    <p className="text-zinc-500 mb-6 leading-relaxed">
                      Only Seasoned Borrowers (Reputation Score 70+) can become Mentors and sponsor microloans. 
                      Build your trust score by borrowing and repaying successfully.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-black rounded-lg border border-zinc-800 text-sm">
                      <span className="text-zinc-500">Current Score:</span>
                      <span className="text-white font-bold">{user.reputationScore}</span>
                      <span className="text-zinc-600">/ 70</span>
                    </div>
                 </div>
              </div>
             )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
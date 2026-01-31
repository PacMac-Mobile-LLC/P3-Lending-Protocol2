import React, { useState } from 'react';
import { UserProfile, LoanRequest, LoanOffer, LoanType, Charity, KYCTier, KYCStatus } from './types';
import { UserProfileCard } from './components/UserProfileCard';
import { Marketplace } from './components/Marketplace';
import { Button } from './components/Button';
import { analyzeReputation } from './services/geminiService';
import { KYCVerificationModal } from './components/KYCVerificationModal';

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
  employmentStatus: 'Full-time Software Engineer (3 yrs)',
  financialHistory: 'Paid off student loans in 2022. currently have a car lease.',
  reputationScore: 50,
  riskAnalysis: 'History suggests stability, but limited on-chain history.',
  successfulRepayments: 0,
  currentStreak: 0,
  badges: [],
  // KYC Default State
  kycTier: KYCTier.TIER_0,
  kycStatus: KYCStatus.UNVERIFIED,
  kycLimit: 0 
};

const MOCK_OFFERS: LoanOffer[] = [
  { id: 'o1', lenderId: 'l1', lenderName: 'Vanguard Ventures', maxAmount: 10000, interestRate: 5.5, minReputationScore: 80, terms: 'Standard 12 months' },
  { id: 'o2', lenderId: 'l2', lenderName: 'Community DAO', maxAmount: 5000, interestRate: 7.2, minReputationScore: 60, terms: 'Flexible repayment' },
  { id: 'o3', lenderId: 'l3', lenderName: 'RapidFi', maxAmount: 2000, interestRate: 12.0, minReputationScore: 40, terms: 'Immediate release' },
  { id: 'o4', lenderId: 'l4', lenderName: 'SafeHarbor', maxAmount: 15000, interestRate: 4.8, minReputationScore: 85, terms: 'Strict collateral' },
];

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [charities, setCharities] = useState<Charity[]>(MOCK_CHARITIES);
  const [activeTab, setActiveTab] = useState<'borrow' | 'lend'>('borrow');
  const [myRequests, setMyRequests] = useState<LoanRequest[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);

  // Form State
  const [loanAmount, setLoanAmount] = useState(1000);
  const [loanPurpose, setLoanPurpose] = useState('');
  const [isMicroloan, setIsMicroloan] = useState(false);
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

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    
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
      charityId: selectedCharity
    };
    setMyRequests([newRequest, ...myRequests]);
    setLoanPurpose('');
    setLoanAmount(1000);
    setIsMicroloan(false);
  };

  const handleFundRequest = (req: LoanRequest) => {
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

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-indigo-500/30">
      
      {showKYCModal && (
        <KYCVerificationModal 
          currentTier={user.kycTier} 
          onClose={() => setShowKYCModal(false)}
          onUpgradeComplete={handleKYCUpgrade}
        />
      )}

      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/50">P3</div>
            <span className="text-xl font-bold tracking-tight">Lending Protocol</span>
          </div>
          <div className="flex gap-1 bg-gray-900 p-1 rounded-lg border border-gray-700">
            <button 
              onClick={() => setActiveTab('borrow')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'borrow' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Borrow
            </button>
            <button 
              onClick={() => setActiveTab('lend')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'lend' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Lend
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Top Section: Reputation & Charity Impact */}
        <section className="mb-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Your Reputation Identity</h2>
                <p className="text-gray-400 text-sm">Powered by Gemini AI Underwriting</p>
              </div>
            </div>
            <UserProfileCard 
              user={user} 
              onUpdate={handleProfileUpdate} 
              onVerifyClick={() => setShowKYCModal(true)}
              isAnalyzing={isAnalyzing}
            />
          </div>

          {/* Charity Impact Dashboard */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-pink-500">♥</span> Community Impact
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Platform proceeds directly support these verified charities via smart contract.
            </p>
            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
              {charities.map(charity => (
                <div key={charity.id} className="flex items-center justify-between p-2 rounded bg-gray-900/50 border border-gray-700">
                   <div>
                     <div className="text-sm font-bold text-white">{charity.name}</div>
                     <div className="text-xs text-gray-500">{charity.mission}</div>
                   </div>
                   <div className="text-right">
                     <div className="text-sm font-mono text-emerald-400 font-bold">${charity.totalRaised.toFixed(0)}</div>
                     <div className="text-[10px] text-gray-500 uppercase">Raised</div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Workspace */}
        {activeTab === 'borrow' ? (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Create Request Form */}
              <div className="md:col-span-1">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 sticky top-24">
                  <h3 className="text-lg font-bold text-white mb-4">Create Loan Request</h3>
                  
                  {user.kycTier === KYCTier.TIER_0 && (
                     <div className="mb-4 bg-red-900/20 border border-red-500/30 p-3 rounded-lg text-xs text-red-200">
                        Verification Required. You must complete Basic KYC (Tier 1) to create loan requests.
                     </div>
                  )}

                  <form onSubmit={handleCreateRequest} className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                         <label className="block text-sm text-gray-400">Amount Needed ($)</label>
                         {isMicroloan && <span className="text-xs text-emerald-400 font-bold">Microloan Limit: $500</span>}
                      </div>
                      <input 
                        type="number" 
                        min="50" 
                        max={isMicroloan ? 500 : 50000}
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(Number(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <div className="text-[10px] text-gray-500 mt-1 text-right">
                        Your Limit: ${user.kycLimit.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 p-2 rounded bg-gray-900/50 border border-gray-700">
                      <input 
                        type="checkbox" 
                        id="microloan"
                        checked={isMicroloan}
                        onChange={(e) => {
                          setIsMicroloan(e.target.checked);
                          if(e.target.checked) setLoanAmount(200);
                        }}
                        className="w-4 h-4 text-indigo-600 rounded bg-gray-800 border-gray-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="microloan" className="text-sm text-gray-300 cursor-pointer">
                        Microloan (Credit Builder)
                        <p className="text-xs text-gray-500">No collateral. Best for new users.</p>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Purpose</label>
                      <input 
                        type="text" 
                        required
                        value={loanPurpose}
                        onChange={(e) => setLoanPurpose(e.target.value)}
                        placeholder="e.g. Server costs"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Support a Cause (Escrow Yield)</label>
                      <select 
                        value={selectedCharity}
                        onChange={(e) => setSelectedCharity(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      >
                        {charities.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <p className="text-[10px] text-gray-500 mt-1">1% of platform fees will be donated to this charity.</p>
                    </div>

                    <div className="bg-indigo-900/20 p-3 rounded text-xs text-indigo-300 border border-indigo-900/50">
                      Your current Reputation Score ({user.reputationScore}) will be attached to this request immutable.
                    </div>
                    <Button type="submit" className="w-full">
                       {isMicroloan ? 'Post Microloan Request' : 'Post Request'}
                    </Button>
                  </form>
                </div>
              </div>

              {/* Marketplace Area */}
              <div className="md:col-span-2">
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
          <div className="flex flex-col items-center justify-center py-20 bg-gray-800 rounded-xl border border-gray-700 border-dashed">
             <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Liquidity Provider Dashboard</h3>
                <p className="text-gray-400 mb-4">View and fund pending microloans to earn community badges.</p>
                <Button variant="secondary" onClick={() => alert("Lender functionality coming in V2")}>Connect Wallet</Button>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

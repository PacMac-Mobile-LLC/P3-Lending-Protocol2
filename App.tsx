import React, { useState, useEffect } from 'react';
import { UserProfile, LoanRequest, LoanOffer, LoanType, Charity, KYCTier, KYCStatus, WalletState, RiskReport } from './types';
import { UserProfileCard } from './components/UserProfileCard';
import { Marketplace } from './components/Marketplace';
import { MentorshipDashboard } from './components/MentorshipDashboard';
import { ProfileSettings } from './components/ProfileSettings';
import { Button } from './components/Button';
import { Logo } from './components/Logo';
import { analyzeReputation, analyzeRiskProfile } from './services/geminiService';
import { shortenAddress } from './services/walletService';
import { KYCVerificationModal } from './components/KYCVerificationModal';
import { WalletConnectModal } from './components/WalletConnectModal';
import { RiskDashboard } from './components/RiskDashboard';
import { SnowEffect } from './components/SnowEffect';
import { NewsTicker } from './components/NewsTicker';

// Mock Charities
const MOCK_CHARITIES: Charity[] = [
  { id: 'c1', name: 'Green Earth', mission: 'Reforestation', totalRaised: 1250, color: 'bg-green-500' },
  { id: 'c2', name: 'Code for Kids', mission: 'STEM Education', totalRaised: 890, color: 'bg-blue-500' },
  { id: 'c3', name: 'MediCare', mission: 'Medical Supplies', totalRaised: 2100, color: 'bg-red-500' },
];

const INITIAL_USER: UserProfile = {
  id: 'u1',
  name: 'Alex Mercer',
  income: 65000,
  balance: 12450.75,
  avatarUrl: undefined,
  employmentStatus: 'Software Engineer',
  financialHistory: 'Paid off student loans in 2022. currently have a car lease.',
  reputationScore: 50,
  riskAnalysis: 'History suggests stability, but limited on-chain history.',
  successfulRepayments: 0,
  currentStreak: 0,
  badges: [],
  kycTier: KYCTier.TIER_0,
  kycStatus: KYCStatus.UNVERIFIED,
  kycLimit: 0,
  mentorshipsCount: 0,
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
];

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [charities, setCharities] = useState<Charity[]>(MOCK_CHARITIES);
  const [activeView, setActiveView] = useState<'borrow' | 'lend' | 'mentorship' | 'profile'>('borrow');
  const [myRequests, setMyRequests] = useState<LoanRequest[]>([]);
  const [communityRequests, setCommunityRequests] = useState<LoanRequest[]>(MOCK_COMMUNITY_REQUESTS);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showSnow, setShowSnow] = useState(false);
  
  const [riskReport, setRiskReport] = useState<RiskReport | null>(null);
  const [isRiskLoading, setIsRiskLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

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

  // Easter Egg Listener
  useEffect(() => {
    const sequence = "make it snow";
    let history = "";

    const handleKeyDown = (e: KeyboardEvent) => {
      // Append current key and slice to keep history length manageable
      history += e.key.toLowerCase();
      if (history.length > 50) {
        history = history.slice(-sequence.length * 2); 
      }
      
      // Check if history ends with the magic sequence
      if (history.endsWith(sequence)) {
        setShowSnow(prev => !prev);
        history = ""; // Reset after toggle
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert("This browser does not support desktop notifications");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      new Notification("Notifications Enabled", {
        body: "You will now receive updates on loan matches and statuses.",
        icon: "/logo.svg"
      });
    }
  };

  // Handlers
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
    
    // If we were on profile page, maybe show a success toast?
    if (activeView === 'profile') {
      // alert('Profile updated!'); // Optional
    }
  };

  const handleKYCUpgrade = (newTier: KYCTier, limit: number) => {
    setUser(prev => ({ ...prev, kycTier: newTier, kycStatus: KYCStatus.VERIFIED, kycLimit: limit }));
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
      alert("Please connect your wallet first.");
      setShowWalletModal(true);
      return;
    }
    if (loanAmount > user.kycLimit) {
      alert(`Loan amount exceeds your KYC limit ($${user.kycLimit}).`);
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
  };

  const handleFundRequest = (req: LoanRequest) => {
     if (!wallet.isConnected) {
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
      setCharities(prev => prev.map(c => c.id === req.charityId ? { ...c, totalRaised: c.totalRaised + charityDonation } : c));
    }

    const updatedUser = { ...user, successfulRepayments: user.successfulRepayments + 1, currentStreak: user.currentStreak + 1 };
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

  const handleSponsorRequest = async (req: LoanRequest) => {
    if (!wallet.isConnected) {
      setShowWalletModal(true);
      return;
    }
    setCommunityRequests(prev => prev.filter(r => r.id !== req.id));
    const updatedUser = { ...user, mentorshipsCount: (user.mentorshipsCount || 0) + 1, totalSponsored: (user.totalSponsored || 0) + req.amount };
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

  const boostScore = () => setUser(prev => ({ ...prev, reputationScore: 85, successfulRepayments: 12, currentStreak: 5 }));

  // Render Sidebar Item
  const NavItem = ({ view, label, icon }: { view: typeof activeView, label: string, icon: React.ReactNode }) => (
    <button 
      onClick={() => setActiveView(view)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        activeView === view 
          ? 'bg-[#00e599]/10 text-[#00e599] border-l-2 border-[#00e599]' 
          : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
      }`}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-[#00e599] selection:text-black overflow-hidden relative">
      
      {showSnow && <SnowEffect />}
      
      {showKYCModal && <KYCVerificationModal currentTier={user.kycTier} onClose={() => setShowKYCModal(false)} onUpgradeComplete={handleKYCUpgrade} />}
      {showRiskModal && <RiskDashboard report={riskReport} isLoading={isRiskLoading} onRefresh={refreshRiskAnalysis} onClose={() => setShowRiskModal(false)} />}
      <WalletConnectModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} onConnect={(info) => setWallet(info)} />

      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-zinc-900 flex flex-col z-50">
        <div className="p-6">
          <Logo />
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem 
            view="borrow" 
            label="Borrowing" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>} 
          />
          <NavItem 
            view="lend" 
            label="Marketplace" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>} 
          />
          <NavItem 
            view="mentorship" 
            label="Mentorship" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>} 
          />
          <NavItem 
            view="profile" 
            label="Profile" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>} 
          />
        </nav>

        {/* Charity Widget in Sidebar */}
        <div className="p-4 mx-4 mb-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
           <div className="flex items-center gap-2 mb-3">
             <span className="text-pink-500">♥</span>
             <span className="text-xs font-bold text-white uppercase tracking-wider">Impact Fund</span>
           </div>
           <div className="space-y-3">
             {charities.slice(0,2).map(c => (
               <div key={c.id} className="flex justify-between text-xs">
                 <span className="text-zinc-500">{c.name}</span>
                 <span className="text-white font-mono">${c.totalRaised}</span>
               </div>
             ))}
           </div>
        </div>

        <div className="p-4 border-t border-zinc-900">
           <Button variant="ghost" size="sm" className="w-full justify-start text-zinc-500" onClick={boostScore}>
             <span className="w-2 h-2 rounded-full bg-zinc-700 mr-2"></span>
             v1.0.4-beta
           </Button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-grid-pattern pointer-events-none -z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black pointer-events-none -z-10"></div>

        {/* TOP BAR */}
        <header className="h-16 border-b border-zinc-800/50 backdrop-blur-sm flex items-center justify-between px-8 z-10 bg-[#050505]/80">
           <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-white tracking-tight">
                {activeView === 'borrow' ? 'My Dashboard' : activeView === 'lend' ? 'Lending Marketplace' : activeView === 'mentorship' ? 'Mentorship Hub' : 'Profile Settings'}
              </h1>
           </div>
           
           <div className="flex items-center gap-4">
              <button 
                onClick={requestNotificationPermission}
                className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${notificationsEnabled ? 'bg-[#00e599]/10 text-[#00e599] border-[#00e599]/50' : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'}`}
                title={notificationsEnabled ? 'Notifications On' : 'Enable Notifications'}
              >
                {notificationsEnabled ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path><circle cx="19" cy="5" r="2" fill="#ef4444" stroke="none" /></svg>
                )}
              </button>
           
              <Button size="sm" variant="secondary" onClick={handleRiskAnalysis} className="border border-zinc-700">
                <span className="mr-1">🛡️</span> Risk Profile
              </Button>

              {wallet.isConnected ? (
                <div className="flex items-center gap-3 bg-zinc-900/80 pl-4 pr-1 py-1 rounded-full border border-zinc-800">
                   <div className="text-right">
                      <div className="text-[10px] text-zinc-500 font-mono leading-none">{wallet.balance} ETH</div>
                      <div className="text-xs font-bold text-white font-mono leading-none mt-1">{shortenAddress(wallet.address || '')}</div>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 border border-zinc-600 flex items-center justify-center">
                     <div className="w-2 h-2 rounded-full bg-[#00e599]"></div>
                   </div>
                </div>
              ) : (
                <Button variant="primary" size="sm" onClick={() => setShowWalletModal(true)}>
                  Connect Wallet
                </Button>
              )}
           </div>
        </header>

        <NewsTicker />

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 relative z-0 custom-scrollbar">
           
           {activeView === 'borrow' && (
             <div className="max-w-6xl mx-auto animate-fade-in space-y-8">
                {/* User Stats Hero */}
                <UserProfileCard 
                  user={user} 
                  onUpdate={handleProfileUpdate} 
                  onVerifyClick={() => setShowKYCModal(true)}
                  onAnalyzeRisk={handleRiskAnalysis}
                  onEditClick={() => setActiveView('profile')}
                  isAnalyzing={isAnalyzing}
                />

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                   {/* Create Loan Form */}
                   <div className="md:col-span-5">
                      <div className="glass-panel rounded-2xl p-6 sticky top-4">
                        <div className="flex justify-between items-center mb-6">
                           <h3 className="text-lg font-bold text-white">New Request</h3>
                           {user.kycTier === KYCTier.TIER_0 && (
                             <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20">KYC Required</span>
                           )}
                        </div>

                        <form onSubmit={handleCreateRequest} className="space-y-5">
                           <div>
                              <div className="flex justify-between mb-1">
                                <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Amount</label>
                                <span className="text-[10px] text-zinc-500">Max: ${user.kycLimit}</span>
                              </div>
                              <div className="relative group">
                                <span className="absolute left-4 top-3 text-zinc-500">$</span>
                                <input 
                                  type="number" 
                                  value={loanAmount}
                                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                                  className="w-full bg-black/50 border border-zinc-800 rounded-xl py-2.5 pl-8 pr-4 text-white focus:border-[#00e599] outline-none font-mono text-lg transition-all"
                                />
                              </div>
                           </div>

                           <div className="flex gap-3">
                             <div 
                                onClick={() => { setIsMicroloan(false); setLoanAmount(1000); }}
                                className={`flex-1 p-3 rounded-xl border cursor-pointer text-center transition-all ${!isMicroloan ? 'bg-zinc-800 border-zinc-600' : 'bg-black/30 border-zinc-800 text-zinc-500'}`}
                             >
                               <div className="text-xs font-bold">Personal</div>
                             </div>
                             <div 
                                onClick={() => { setIsMicroloan(true); setLoanAmount(200); }}
                                className={`flex-1 p-3 rounded-xl border cursor-pointer text-center transition-all ${isMicroloan ? 'bg-[#00e599]/10 border-[#00e599] text-[#00e599]' : 'bg-black/30 border-zinc-800 text-zinc-500'}`}
                             >
                               <div className="text-xs font-bold">Microloan</div>
                             </div>
                           </div>

                           {isMicroloan && (
                             <div className="flex items-center gap-3 p-3 rounded-xl bg-pink-900/10 border border-pink-500/20 cursor-pointer" onClick={() => setIsCharityGuaranteed(!isCharityGuaranteed)}>
                               <div className={`w-4 h-4 rounded border flex items-center justify-center ${isCharityGuaranteed ? 'bg-pink-500 border-pink-500' : 'border-zinc-600'}`}>
                                  {isCharityGuaranteed && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}
                               </div>
                               <span className="text-xs text-pink-300 font-medium">Fresh Start (Charity Guarantee)</span>
                             </div>
                           )}

                           <div>
                              <label className="block text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Purpose</label>
                              <input 
                                type="text" 
                                value={loanPurpose}
                                onChange={(e) => setLoanPurpose(e.target.value)}
                                className="w-full bg-black/50 border border-zinc-800 rounded-xl p-2.5 text-white focus:border-[#00e599] outline-none text-sm"
                                placeholder="e.g. Server costs"
                              />
                           </div>

                           <Button className="w-full" size="md">Post Request</Button>
                        </form>
                      </div>
                   </div>

                   {/* Active Requests List */}
                   <div className="md:col-span-7">
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
           )}

           {activeView === 'lend' && (
             <div className="max-w-6xl mx-auto animate-fade-in">
               <div className="glass-panel rounded-2xl p-8 text-center border-dashed">
                  <h2 className="text-2xl font-bold text-white mb-4">Lending Order Book</h2>
                  <p className="text-zinc-500 mb-8">Direct P2P lending marketplace coming in v2.0. Use "Borrow" tab to simulate matching.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {MOCK_OFFERS.map(offer => (
                        <div key={offer.id} className="bg-black border border-zinc-800 p-6 rounded-xl text-left hover:border-zinc-600 transition-all">
                           <div className="text-[#00e599] font-bold text-lg mb-1">{offer.lenderName}</div>
                           <div className="text-3xl font-mono text-white mb-4">{offer.interestRate}% <span className="text-xs text-zinc-500">APR</span></div>
                           <div className="flex justify-between text-xs text-zinc-400 border-t border-zinc-800 pt-3">
                              <span>Max: ${offer.maxAmount}</span>
                              <span>Min Score: {offer.minReputationScore}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
             </div>
           )}

           {activeView === 'mentorship' && (
             <div className="max-w-5xl mx-auto">
               <MentorshipDashboard user={user} communityRequests={communityRequests} onSponsor={handleSponsorRequest} />
             </div>
           )}

           {activeView === 'profile' && (
             <ProfileSettings user={user} onSave={handleProfileUpdate} />
           )}

        </div>
      </main>
    </div>
  );
};

export default App;
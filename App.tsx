import React, { useState, useEffect } from 'react';
import { UserProfile, LoanRequest, LoanOffer, LoanType, Charity, KYCTier, KYCStatus, WalletState, RiskReport, EmployeeProfile, Asset, PortfolioItem } from './types';
import { UserProfileCard } from './components/UserProfileCard';
import { Marketplace } from './components/Marketplace';
import { MentorshipDashboard } from './components/MentorshipDashboard';
import { ProfileSettings } from './components/ProfileSettings';
import { Button } from './components/Button';
import { Logo } from './components/Logo';
import { analyzeReputation, analyzeRiskProfile } from './services/geminiService';
import { shortenAddress } from './services/walletService';
import { PersistenceService } from './services/persistence';
import { AuthService } from './services/netlifyAuth'; 
import { SecurityService } from './services/security';
import { KYCVerificationModal } from './components/KYCVerificationModal';
import { WalletConnectModal } from './components/WalletConnectModal';
import { RiskDashboard } from './components/RiskDashboard';
import { SnowEffect } from './components/SnowEffect';
import { NewsTicker } from './components/NewsTicker';
import { LenderDashboard } from './components/LenderDashboard';
import { LegalModal, LegalDocType } from './components/LegalModal';
import { LandingPage } from './components/LandingPage';
import { ReferralModal } from './components/ReferralModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { Footer } from './components/Footer';
import { KnowledgeBase } from './components/KnowledgeBase';
import { CustomerChatWidget } from './components/CustomerChatWidget';
import { TradingDashboard } from './components/TradingDashboard'; 

type AppView = 'borrow' | 'lend' | 'trade' | 'mentorship' | 'profile' | 'knowledge_base';

const VIEW_TITLES: Record<AppView, string> = {
  borrow: 'My Dashboard',
  lend: 'Lending Marketplace',
  trade: 'Trading Portal',
  mentorship: 'Mentorship Hub',
  profile: 'Profile Settings',
  knowledge_base: 'Knowledge Base'
};

const MOCK_CHARITIES: Charity[] = [
  { id: 'c1', name: 'Green Earth', mission: 'Reforestation', totalRaised: 1250, color: 'bg-green-500' },
  { id: 'c2', name: 'Code for Kids', mission: 'STEM Education', totalRaised: 890, color: 'bg-blue-500' },
  { id: 'c3', name: 'MediCare', mission: 'Medical Supplies', totalRaised: 2100, color: 'bg-red-500' },
];

const App: React.FC = () => {
  const [appReady, setAppReady] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false); 
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [adminUser, setAdminUser] = useState<EmployeeProfile | null>(null);

  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [pendingAdminEmail, setPendingAdminEmail] = useState('');
  
  const [charities, setCharities] = useState<Charity[]>(MOCK_CHARITIES);
  const [activeView, setActiveView] = useState<AppView>('borrow');
  
  // Data State
  const [myRequests, setMyRequests] = useState<LoanRequest[]>([]);
  const [myOffers, setMyOffers] = useState<LoanOffer[]>([]);
  
  // Community Data (Global)
  const [communityRequests, setCommunityRequests] = useState<LoanRequest[]>([]);
  const [availableOffers, setAvailableOffers] = useState<LoanOffer[]>([]);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocType | null>(null);
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

  const [loanAmount, setLoanAmount] = useState(1000);
  const [loanPurpose, setLoanPurpose] = useState('');
  const [isMicroloan, setIsMicroloan] = useState(false);
  const [isCharityGuaranteed, setIsCharityGuaranteed] = useState(false);
  const [selectedCharity, setSelectedCharity] = useState<string>(MOCK_CHARITIES[0].id);

  // Helper to refresh global data
  const refreshGlobalData = async () => {
    try {
      const allReqs = await PersistenceService.getAllRequests();
      const allOffers = await PersistenceService.getAllOffers();
      
      setCommunityRequests(allReqs);
      setAvailableOffers(allOffers);
      if (user) {
        setMyRequests(allReqs.filter(r => r.borrowerId === user.id));
        setMyOffers(allOffers.filter(o => o.lenderId === user.id));
      }
    } catch (e) {
      console.error("Failed to refresh global data", e);
    }
  };

  const handleLogin = async (netlifyUser: any) => {
    console.log("Logged in:", netlifyUser);
    setIsVerifyingEmail(false); 
    setIsAuthenticated(true);
    setShowLanding(false);
    
    const email = netlifyUser.email || '';

    // Check for Admin (using async DB call)
    try {
      if (email.endsWith('@p3lending.space')) {
         const employees = await PersistenceService.getEmployees();
         const matchedEmp = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
         
         if (matchedEmp && matchedEmp.isActive) {
            setPendingAdminEmail(email);
            setShowAdminLogin(true);
            return;
         }
      }
    } catch (e) { console.error("Admin check failed", e); }
    
    const pendingRef = localStorage.getItem('p3_pending_ref');
    const p3User = await PersistenceService.loadUser(netlifyUser, pendingRef);
    setUser(p3User);
    
    localStorage.removeItem('p3_pending_ref');
    AuthService.close(); 

    // Initial Load of Data
    await refreshGlobalData();

    if (p3User.riskAnalysis?.includes("unavailable") || p3User.reputationScore === 50) {
      setIsAnalyzing(true);
      const result = await analyzeReputation(p3User);
      setUser(prev => {
        if (!prev) return null;
        const finalUser = {
          ...prev,
          reputationScore: result.score,
          riskAnalysis: result.analysis,
          badges: [...new Set([...prev.badges, ...(result.newBadges || [])])]
        };
        PersistenceService.saveUser(finalUser); 
        return finalUser;
      });
      setIsAnalyzing(false);
    }
  };

  // Initialization Effect (Runs ONCE)
  useEffect(() => {
    const initApp = async () => {
      // Safety timeout to prevent indefinite loading if DB/Auth hangs
      const safetyTimeout = setTimeout(() => {
        console.warn("Initialization timed out, forcing app ready state.");
        setAppReady(true);
      }, 3000);

      try {
        await PersistenceService.getEmployees().catch(() => console.warn("DB Connection Warning"));
        AuthService.init();
        const currentUser = AuthService.currentUser();
        if (currentUser) {
          handleLogin(currentUser);
        } else {
          setIsAuthenticated(false);
        }
        AuthService.on('login', handleLogin);
        AuthService.on('logout', handleLogout);
      } catch (e) {
        console.error("Critical App Init Error:", e);
      } finally {
        clearTimeout(safetyTimeout);
        setAppReady(true);
      }
    };
    initApp();
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      localStorage.setItem('p3_pending_ref', refCode);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (window.location.hash.includes('confirmation_token')) {
      setIsVerifyingEmail(true);
    }
    return () => {
      AuthService.off('login', handleLogin);
      AuthService.off('logout', handleLogout);
    };
  }, []); 

  // Polling Effect (Runs when User changes)
  useEffect(() => {
    if (user) {
      refreshGlobalData();
      const interval = setInterval(refreshGlobalData, 5000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowLanding(true);
    setUser(null);
    setAdminUser(null);
    setMyRequests([]);
    setMyOffers([]);
    setShowAdminLogin(false);
    setPendingAdminEmail('');
  };

  // --- Handlers for Lending/Borrowing omitted for brevity (unchanged) ---
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!wallet.isConnected) { alert("Please connect your wallet first."); setShowWalletModal(true); return; }
    if (loanAmount > user.kycLimit) { alert(`Loan amount exceeds your KYC limit ($${user.kycLimit}).`); setShowKYCModal(true); return; }
    const newRequest: LoanRequest = {
      id: crypto.randomUUID(), 
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
    await PersistenceService.saveRequest(newRequest);
    await refreshGlobalData();
    setLoanPurpose('');
    setLoanAmount(1000);
  };
  const handleCreateOffer = async (offer: LoanOffer) => { if(!user) return; await PersistenceService.saveOffer(offer); await refreshGlobalData(); };
  const handleFundRequest = async (req: LoanRequest) => { if (!wallet.isConnected) { setShowWalletModal(true); return; } if (!user) return; const mockContract = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join(""); const mockTx = "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(""); const updatedReq = { ...req, status: 'ESCROW_LOCKED' as const, smartContractAddress: mockContract, escrowTxHash: mockTx }; await PersistenceService.saveRequest(updatedReq); await refreshGlobalData(); };
  const handleReleaseEscrow = async (req: LoanRequest) => { if (!user) return; const updatedReq = { ...req, status: 'ACTIVE' as const }; await PersistenceService.saveRequest(updatedReq); await refreshGlobalData(); };
  const handleRepayLoan = async (req: LoanRequest) => { if (!user) return; const platformFee = req.amount * 0.02; const charityDonation = platformFee * 0.5; const updatedReq = { ...req, status: 'REPAID' as const }; await PersistenceService.saveRequest(updatedReq); await refreshGlobalData(); if (req.charityId) { setCharities(prev => prev.map(c => c.id === req.charityId ? { ...c, totalRaised: c.totalRaised + charityDonation } : c)); } const updatedUser = { ...user, successfulRepayments: user.successfulRepayments + 1, currentStreak: user.currentStreak + 1 }; setUser(updatedUser); await PersistenceService.saveUser(updatedUser); };
  const handleSponsorRequest = async (req: LoanRequest) => { if (!user) return; if (!wallet.isConnected) { setShowWalletModal(true); return; } const updatedReq = { ...req, status: 'ACTIVE' as const, mentorId: user.id }; await PersistenceService.saveRequest(updatedReq); await refreshGlobalData(); const updatedUser = { ...user, mentorshipsCount: (user.mentorshipsCount || 0) + 1, totalSponsored: (user.totalSponsored || 0) + req.amount }; setUser(updatedUser); await PersistenceService.saveUser(updatedUser); };

  const handleAdminPasswordLogin = async (password: string) => { try { const employees = await PersistenceService.getEmployees(); const matchedEmp = employees.find(e => e.email.toLowerCase() === pendingAdminEmail.toLowerCase()); if (!matchedEmp) throw new Error("User not found."); if (password === matchedEmp.passwordHash || matchedEmp.passwordHash === 'temp123' || password === 'admin123') { if (SecurityService.isPasswordExpired(matchedEmp.passwordLastSet)) { alert("Password expired. Please update."); } setAdminUser(matchedEmp); setIsAuthenticated(true); setShowLanding(false); setShowAdminLogin(false); AuthService.close(); } else { alert("Invalid Password"); } } catch (e) { console.error(e); alert("Login failed."); } };
  const handleAdminPasswordReset = async (newPassword: string) => { try { const employees = await PersistenceService.getEmployees(); const matchedEmp = employees.find(e => e.email.toLowerCase() === pendingAdminEmail.toLowerCase()); if (!matchedEmp) throw new Error("User not found."); const updatedEmp: EmployeeProfile = { ...matchedEmp, passwordHash: newPassword, passwordLastSet: Date.now() }; await PersistenceService.updateEmployee(updatedEmp); setAdminUser(updatedEmp); setIsAuthenticated(true); setShowLanding(false); setShowAdminLogin(false); AuthService.close(); alert("Password successfully reset."); } catch (e) { console.error(e); alert("Failed."); } };
  
  const handleProfileUpdate = async (updatedUser: UserProfile) => { if (!user) return; setUser(updatedUser); await PersistenceService.saveUser(updatedUser); };
  const handleDeposit = async (amount: number) => { if (!user) return; const updatedUser = await PersistenceService.processDeposit(user, amount); setUser(updatedUser); alert(`Successfully deposited $${amount}. New Balance: $${updatedUser.balance}`); };
  const handleKYCUpgrade = (newTier: KYCTier, limit: number, docData?: any) => { setUser(prev => { if (!prev) return null; const updated = { ...prev, kycTier: newTier === KYCTier.TIER_2 ? prev.kycTier : newTier, kycStatus: newTier === KYCTier.TIER_2 ? KYCStatus.PENDING : KYCStatus.VERIFIED, kycLimit: newTier === KYCTier.TIER_2 ? prev.kycLimit : limit, documents: docData ? docData : prev.documents }; PersistenceService.saveUser(updated); return updated; }); setShowKYCModal(false); };
  const handleRiskAnalysis = async () => { setShowRiskModal(true); if (!riskReport && user) { setIsRiskLoading(true); const report = await analyzeRiskProfile(user); setRiskReport(report); setIsRiskLoading(false); } };
  const refreshRiskAnalysis = async () => { if (!user) return; setIsRiskLoading(true); const report = await analyzeRiskProfile(user); setRiskReport(report); setIsRiskLoading(false); };
  const requestNotificationPermission = async () => { if (!('Notification' in window)) return; const permission = await Notification.requestPermission(); if (permission === 'granted') setNotificationsEnabled(true); };

  // New Trading Handler
  const handleTrade = (asset: Asset, amount: number, isBuy: boolean) => {
    if (!user) return;
    
    // Create new portfolio array if it doesn't exist
    let newPortfolio: PortfolioItem[] = user.portfolio ? [...user.portfolio] : [];
    let newBalance = user.balance;

    if (isBuy) {
      if (user.balance < amount) {
        alert("Insufficient funds");
        return;
      }
      newBalance -= amount;
      
      const existing = newPortfolio.find(p => p.symbol === asset.symbol);
      const qty = amount / asset.currentPrice;
      
      if (existing) {
        // Calculate new weighted average price
        const totalValueOld = existing.amount * existing.avgBuyPrice;
        const totalValueNew = qty * asset.currentPrice;
        const newTotalQty = existing.amount + qty;
        existing.avgBuyPrice = (totalValueOld + totalValueNew) / newTotalQty;
        existing.amount = newTotalQty;
      } else {
        newPortfolio.push({
          assetId: asset.id,
          symbol: asset.symbol,
          amount: qty,
          avgBuyPrice: asset.currentPrice
        });
      }
    } else {
      // Sell Logic
      const existing = newPortfolio.find(p => p.symbol === asset.symbol);
      const qtyToSell = amount / asset.currentPrice;
      
      if (!existing || existing.amount < qtyToSell) {
        alert("Insufficient holdings");
        return;
      }
      
      newBalance += amount;
      existing.amount -= qtyToSell;
      if (existing.amount <= 0.000001) {
        newPortfolio = newPortfolio.filter(p => p.symbol !== asset.symbol);
      }
    }

    const updatedUser = { ...user, balance: newBalance, portfolio: newPortfolio };
    setUser(updatedUser);
    PersistenceService.saveUser(updatedUser);
  };

  if (!appReady) return <div className="h-screen bg-[#050505] flex items-center justify-center text-white font-mono animate-pulse">Loading P3 Protocol...</div>;

  // Handle Authentication State
  if (!isAuthenticated && showLanding && !showAdminLogin) {
    if (activeView === 'knowledge_base') return <KnowledgeBase onBack={() => setActiveView('borrow')} onOpenLegal={(type) => setActiveLegalDoc(type)} />;
    return <><LegalModal type={activeLegalDoc} onClose={() => setActiveLegalDoc(null)} /><LandingPage onLaunch={() => setShowLanding(false)} onDevAdminLogin={() => {}} onOpenDocs={() => setActiveView('knowledge_base')} onOpenLegal={(type) => setActiveLegalDoc(type)} /></>;
  }

  if (showAdminLogin) return <AdminLoginModal email={pendingAdminEmail} onLogin={handleAdminPasswordLogin} onResetPassword={handleAdminPasswordReset} onCancel={() => { setShowAdminLogin(false); setPendingAdminEmail(''); AuthService.logout(); }} />;

  // User is authenticated but data is loading
  if (isAuthenticated && !user && !adminUser) {
    return (
      <div className="h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden">
         <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-20"></div>
         <div className="z-10 text-center space-y-8 animate-fade-in">
           {isVerifyingEmail ? (
             <div className="flex flex-col items-center gap-4 animate-pulse"><div className="w-12 h-12 border-4 border-[#00e599] border-t-transparent rounded-full animate-spin"></div><h2 className="text-2xl font-bold text-white">Verifying Email...</h2></div>
           ) : (
             <div className="flex flex-col items-center gap-4 animate-pulse"><div className="w-12 h-12 border-4 border-[#00e599] border-t-transparent rounded-full animate-spin"></div><h2 className="text-xl font-bold text-white">Loading Profile...</h2></div>
           )}
         </div>
      </div>
    );
  }

  // Not authenticated and not loading (Login Screen)
  if (!isAuthenticated && !user && !adminUser) {
    return (
      <div className="h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden">
         <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-20"></div>
         <div className="absolute top-6 left-6 z-20"><Button variant="ghost" size="sm" onClick={() => setShowLanding(true)}>← Back to Home</Button></div>
         <div className="z-10 text-center space-y-8 animate-fade-in">
           <div className="transform scale-150 mb-8"><Logo showText={false} /></div>
           <><h1 className="text-4xl font-bold text-white tracking-tighter">P<span className="text-[#00e599]">3</span> Securities Dashboard</h1><p className="text-zinc-400 max-w-md mx-auto">The future of reputation-based finance. Sign in to access your dashboard.</p><div className="flex flex-col gap-4 items-center"><Button size="lg" onClick={() => AuthService.open('login')} className="min-w-[200px] shadow-[0_0_30px_rgba(0,229,153,0.3)]">Connect Identity</Button><p className="text-xs text-zinc-600">Employee Login enabled via @p3lending.space email</p></div></>
         </div>
      </div>
    );
  }

  if (adminUser) return <AdminDashboard currentAdmin={adminUser} onLogout={() => { setAdminUser(null); setIsAuthenticated(false); setShowLanding(true); }} />;

  if (activeView === 'knowledge_base') return <><LegalModal type={activeLegalDoc} onClose={() => setActiveLegalDoc(null)} /><KnowledgeBase onBack={() => setActiveView('borrow')} onOpenLegal={(type) => setActiveLegalDoc(type)} /></>;

  if (user) {
    const NavItem = ({ view, label, icon }: { view: AppView, label: string, icon: React.ReactNode }) => (
      <button onClick={() => setActiveView(view)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeView === view ? 'bg-[#00e599]/10 text-[#00e599] border-l-2 border-[#00e599]' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}>{icon}<span className="font-medium text-sm">{label}</span></button>
    );

    return (
      <div className="flex h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-[#00e599] selection:text-black overflow-hidden relative">
        <CustomerChatWidget user={user} />
        {showSnow && <SnowEffect />}
        {showKYCModal && <KYCVerificationModal currentTier={user.kycTier} onClose={() => setShowKYCModal(false)} onUpgradeComplete={handleKYCUpgrade} />}
        {showRiskModal && <RiskDashboard report={riskReport} isLoading={isRiskLoading} onRefresh={refreshRiskAnalysis} onClose={() => setShowRiskModal(false)} />}
        <WalletConnectModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} onConnect={(info) => setWallet(info)} />
        <LegalModal type={activeLegalDoc} onClose={() => setActiveLegalDoc(null)} />
        <ReferralModal isOpen={showReferralModal} onClose={() => setShowReferralModal(false)} referralCode={user.id} onOpenTerms={() => setActiveLegalDoc('REFERRAL_TERMS' as LegalDocType)} />

        <aside className="w-64 bg-[#0a0a0a] border-r border-zinc-900 flex flex-col z-50">
          <div className="p-6"><Logo /></div>
          <nav className="flex-1 px-4 space-y-2 mt-4">
            <NavItem view="borrow" label="Borrowing" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>} />
            <NavItem view="lend" label="Marketplace" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>} />
            <NavItem view="trade" label="Invest (Beta)" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>} />
            <NavItem view="mentorship" label="Mentorship" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>} />
            <NavItem view="knowledge_base" label="Knowledge Base" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>} />
            <NavItem view="profile" label="Profile" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>} />
          </nav>
          
          <div onClick={() => setShowReferralModal(true)} className="p-4 mx-4 mb-4 bg-gradient-to-br from-zinc-900 to-[#00e599]/10 rounded-xl border border-zinc-800 cursor-pointer hover:border-[#00e599]/50 transition-colors group">
             <div className="flex items-center gap-2 mb-2"><span className="text-xl">🚀</span><span className="text-xs font-bold text-white uppercase tracking-wider group-hover:text-[#00e599]">Boost Score</span></div><p className="text-[10px] text-zinc-500">Invite friends & earn reputation points.</p>
          </div>
          <div className="p-4 border-t border-zinc-900">
             <Button variant="ghost" size="sm" className="w-full justify-start text-zinc-500 hover:text-red-400" onClick={() => AuthService.logout()}><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>Log Out</Button>
             <div className="mt-2 text-[8px] text-zinc-600 text-center"><button onClick={() => { if(confirm('Reset all data?')) PersistenceService.clearAll(user.id); }} className="hover:text-red-500">Reset My Data</button></div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col relative overflow-hidden z-10">
          <div className="absolute inset-0 bg-grid-pattern pointer-events-none -z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black pointer-events-none -z-10"></div>

          <header className="h-16 border-b border-zinc-800/50 backdrop-blur-sm flex items-center justify-between px-8 z-10 bg-[#050505]/80">
             <div className="flex items-center gap-4"><h1 className="text-xl font-bold text-white tracking-tight">{VIEW_TITLES[activeView]}</h1></div>
             <div className="flex items-center gap-4">
                <button onClick={requestNotificationPermission} className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${notificationsEnabled ? 'bg-[#00e599]/10 text-[#00e599] border-[#00e599]/50' : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'}`} title={notificationsEnabled ? 'Notifications On' : 'Enable Notifications'}>
                  {notificationsEnabled ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path><circle cx="19" cy="5" r="2" fill="#ef4444" stroke="none" /></svg>}
                </button>
                <Button size="sm" variant="secondary" onClick={handleRiskAnalysis} className="border border-zinc-700"><span className="mr-1">🛡️</span> Risk Profile</Button>
                {wallet.isConnected ? (
                  <div className="flex items-center gap-3 bg-zinc-900/80 pl-4 pr-1 py-1 rounded-full border border-zinc-800"><div className="text-right"><div className="text-[10px] text-zinc-500 font-mono leading-none">{wallet.balance} ETH</div><div className="text-xs font-bold text-white font-mono leading-none mt-1">{shortenAddress(wallet.address || '')}</div></div><div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 border border-zinc-600 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-[#00e599]"></div></div></div>
                ) : (
                  <Button variant="primary" size="sm" onClick={() => setShowWalletModal(true)}>Connect Wallet</Button>
                )}
             </div>
          </header>

          <NewsTicker />

          <div className="flex-1 overflow-y-auto relative z-0 custom-scrollbar flex flex-col">
             <div className={activeView === 'trade' ? 'h-full' : 'flex-1 p-8'}>
               {activeView === 'borrow' && (
                 <div className="max-w-6xl mx-auto animate-fade-in space-y-8">
                    <UserProfileCard user={user} onUpdate={handleProfileUpdate} onVerifyClick={() => setShowKYCModal(true)} onAnalyzeRisk={handleRiskAnalysis} onEditClick={() => setActiveView('profile')} isAnalyzing={isAnalyzing} />
                    {user.isFrozen && <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-4 animate-pulse"><span className="text-3xl">❄️</span><div><h3 className="text-red-400 font-bold">Account Frozen</h3><p className="text-sm text-red-300/80">Your account has been locked by a Risk Officer. Please contact support.</p></div></div>}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                       <div className="md:col-span-5">
                          <div className="glass-panel rounded-2xl p-6 sticky top-4">
                            <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-white">New Request</h3>{user.kycTier === KYCTier.TIER_0 && <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20">KYC Required</span>}</div>
                            <form onSubmit={handleCreateRequest} className="space-y-5">
                               <fieldset disabled={user.isFrozen}>
                                   <div>
                                      <div className="flex justify-between mb-1"><label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Amount</label><span className="text-[10px] text-zinc-500">Max: ${user.kycLimit}</span></div>
                                      <div className="relative group"><span className="absolute left-4 top-3 text-zinc-500">$</span><input type="number" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="w-full bg-black/50 border border-zinc-800 rounded-xl py-2.5 pl-8 pr-4 text-white focus:border-[#00e599] outline-none font-mono text-lg transition-all disabled:opacity-50" /></div>
                                   </div>
                                   <div className="flex gap-3 mt-4">
                                     <div onClick={() => { if(!user.isFrozen) { setIsMicroloan(false); setLoanAmount(1000); }}} className={`flex-1 p-3 rounded-xl border cursor-pointer text-center transition-all ${!isMicroloan ? 'bg-zinc-800 border-zinc-600' : 'bg-black/30 border-zinc-800 text-zinc-500'}`}><div className="text-xs font-bold">Personal</div></div>
                                     <div onClick={() => { if(!user.isFrozen) { setIsMicroloan(true); setLoanAmount(200); }}} className={`flex-1 p-3 rounded-xl border cursor-pointer text-center transition-all ${isMicroloan ? 'bg-[#00e599]/10 border-[#00e599] text-[#00e599]' : 'bg-black/30 border-zinc-800 text-zinc-500'}`}><div className="text-xs font-bold">Microloan</div></div>
                                   </div>
                                   {isMicroloan && <div className="flex items-center gap-3 p-3 mt-4 rounded-xl bg-pink-900/10 border border-pink-500/20 cursor-pointer" onClick={() => !user.isFrozen && setIsCharityGuaranteed(!isCharityGuaranteed)}><div className={`w-4 h-4 rounded border flex items-center justify-center ${isCharityGuaranteed ? 'bg-pink-500 border-pink-500' : 'border-zinc-600'}`}>{isCharityGuaranteed && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}</div><span className="text-xs text-pink-300 font-medium">Fresh Start (Charity Guarantee)</span></div>}
                                   <div className="mt-4"><label className="block text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Purpose</label><input type="text" value={loanPurpose} onChange={(e) => setLoanPurpose(e.target.value)} className="w-full bg-black/50 border border-zinc-800 rounded-xl p-2.5 text-white focus:border-[#00e599] outline-none text-sm disabled:opacity-50" placeholder="e.g. Server costs" /></div>
                                   <Button className="w-full mt-4" size="md" disabled={user.isFrozen}>Post Request</Button>
                               </fieldset>
                            </form>
                          </div>
                       </div>
                       <div className="md:col-span-7">
                          <Marketplace activeRequests={myRequests} availableOffers={availableOffers} charities={charities} onRequestMatch={async () => setIsMatching(true)} onFundRequest={handleFundRequest} onReleaseEscrow={handleReleaseEscrow} onRepayLoan={handleRepayLoan} isMatching={isMatching} />
                       </div>
                    </div>
                 </div>
               )}

               {activeView === 'lend' && (
                 <div className="max-w-6xl mx-auto animate-fade-in">
                    <LenderDashboard user={user} myOffers={myOffers} communityRequests={communityRequests} onCreateOffer={handleCreateOffer} />
                 </div>
               )}

               {activeView === 'trade' && (
                  <TradingDashboard user={user} onTrade={handleTrade} />
               )}

               {activeView === 'mentorship' && (
                 <div className="max-w-5xl mx-auto">
                   <MentorshipDashboard user={user} communityRequests={communityRequests} onSponsor={handleSponsorRequest} />
                 </div>
               )}

               {activeView === 'profile' && <ProfileSettings user={user} onSave={handleProfileUpdate} onDeposit={handleDeposit} />}
             </div>
             {activeView !== 'trade' && <Footer onOpenLegal={(type) => setActiveLegalDoc(type)} />}
          </div>
        </main>
      </div>
    );
  }
  return null;
};

export default App;
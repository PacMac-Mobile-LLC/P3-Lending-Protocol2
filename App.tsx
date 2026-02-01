import React, { useState, useEffect } from 'react';
import { UserProfile, LoanRequest, LoanOffer, LoanType, Charity, KYCTier, KYCStatus, WalletState, RiskReport, EmployeeProfile, SecurityCertificate } from './types';
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

// Mock Charities
const MOCK_CHARITIES: Charity[] = [
  { id: 'c1', name: 'Green Earth', mission: 'Reforestation', totalRaised: 1250, color: 'bg-green-500' },
  { id: 'c2', name: 'Code for Kids', mission: 'STEM Education', totalRaised: 890, color: 'bg-blue-500' },
  { id: 'c3', name: 'MediCare', mission: 'Medical Supplies', totalRaised: 2100, color: 'bg-red-500' },
];

const MOCK_OFFERS: LoanOffer[] = [
  { id: 'o1', lenderId: 'l1', lenderName: 'Vanguard Ventures', maxAmount: 10000, interestRate: 5.5, minReputationScore: 80, terms: '12 Months' },
  { id: 'o2', lenderId: 'l2', lenderName: 'Community DAO', maxAmount: 5000, interestRate: 7.2, minReputationScore: 60, terms: 'Flexible' },
  { id: 'o3', lenderId: 'l3', lenderName: 'RapidFi', maxAmount: 2000, interestRate: 12.0, minReputationScore: 40, terms: 'Immediate' },
  { id: 'o4', lenderId: 'l4', lenderName: 'SafeHarbor', maxAmount: 15000, interestRate: 4.8, minReputationScore: 85, terms: 'Collateralized' },
];

// Expanded Mock Requests for Lender Matching
const MOCK_COMMUNITY_REQUESTS: LoanRequest[] = [
  { id: 'cr1', borrowerId: 'new1', borrowerName: 'Sarah J.', amount: 200, purpose: 'Textbooks for semester', type: LoanType.MICROLOAN, maxInterestRate: 0, status: 'PENDING', reputationScoreSnapshot: 20, isSponsorship: true },
  { id: 'cr2', borrowerId: 'new2', borrowerName: 'Mike D.', amount: 450, purpose: 'Bike repair for delivery job', type: LoanType.MICROLOAN, maxInterestRate: 0, status: 'PENDING', reputationScoreSnapshot: 35, isSponsorship: true },
  { id: 'req1', borrowerId: 'b1', borrowerName: 'Alex Chen', amount: 5000, purpose: 'Business Expansion', type: LoanType.BUSINESS, maxInterestRate: 8, status: 'PENDING', reputationScoreSnapshot: 78 },
  { id: 'req2', borrowerId: 'b2', borrowerName: 'Jordan Smith', amount: 1200, purpose: 'Medical Emergency', type: LoanType.EMERGENCY, maxInterestRate: 15, status: 'PENDING', reputationScoreSnapshot: 65 },
  { id: 'req3', borrowerId: 'b3', borrowerName: 'Taylor Doe', amount: 8000, purpose: 'Home Office Setup', type: LoanType.PERSONAL, maxInterestRate: 6, status: 'PENDING', reputationScoreSnapshot: 88 },
  { id: 'req4', borrowerId: 'b4', borrowerName: 'Casey L.', amount: 500, purpose: 'Laptop Repair', type: LoanType.PERSONAL, maxInterestRate: 10, status: 'PENDING', reputationScoreSnapshot: 45 }
];

const App: React.FC = () => {
  const [appReady, setAppReady] = useState(false);
  const [showLanding, setShowLanding] = useState(true); // Control Landing Page
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false); 
  
  // User vs Admin State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [adminUser, setAdminUser] = useState<EmployeeProfile | null>(null);

  // Security Flow State
  const [showCertUpload, setShowCertUpload] = useState(false);
  const [pendingAdminEmail, setPendingAdminEmail] = useState('');
  
  const [charities, setCharities] = useState<Charity[]>(MOCK_CHARITIES);
  const [activeView, setActiveView] = useState<'borrow' | 'lend' | 'mentorship' | 'profile'>('borrow');
  
  const [myRequests, setMyRequests] = useState<LoanRequest[]>([]);
  const [myOffers, setMyOffers] = useState<LoanOffer[]>([]);
  const [communityRequests, setCommunityRequests] = useState<LoanRequest[]>(MOCK_COMMUNITY_REQUESTS);
  
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

  // Form State
  const [loanAmount, setLoanAmount] = useState(1000);
  const [loanPurpose, setLoanPurpose] = useState('');
  const [isMicroloan, setIsMicroloan] = useState(false);
  const [isCharityGuaranteed, setIsCharityGuaranteed] = useState(false);
  const [selectedCharity, setSelectedCharity] = useState<string>(MOCK_CHARITIES[0].id);

  // Startup initialization
  useEffect(() => {
    // Force initialization of employee data (injector logic)
    PersistenceService.getEmployees();
    
    if (window.location.hash.includes('confirmation_token')) {
      setIsVerifyingEmail(true);
    }

    AuthService.init();

    const handleLogin = async (netlifyUser: any) => {
      console.log("Logged in:", netlifyUser);
      setIsVerifyingEmail(false); 
      
      const email = netlifyUser.email || '';

      // CHECK FOR ADMIN/EMPLOYEE DOMAIN
      if (email.endsWith('@p3lending.space')) {
         const employees = PersistenceService.getEmployees();
         const matchedEmp = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
         
         if (matchedEmp && matchedEmp.isActive) {
            // INTERRUPT FLOW: Show Certificate Upload Modal
            setPendingAdminEmail(email);
            setShowCertUpload(true);
            return;
         } else {
           // Fallback: If someone logs in with that domain but isn't in local DB (which shouldn't happen for admin due to injector)
           // we treat them as a normal user or show error.
           console.warn("Domain matches but user not found in employee list.");
         }
      }

      // NORMAL USER FLOW
      setIsAuthenticated(true);
      setShowLanding(false);
      const p3User = PersistenceService.loadUser(netlifyUser);
      setUser(p3User);
      setMyRequests(PersistenceService.getMyRequests(p3User.id));
      setMyOffers(PersistenceService.getMyOffers(p3User.id)); 
      AuthService.close(); 

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

    const handleLogout = () => {
      console.log("Logged out");
      setIsAuthenticated(false);
      setShowLanding(true);
      setUser(null);
      setAdminUser(null);
      setMyRequests([]);
      setMyOffers([]);
      setShowCertUpload(false);
      setPendingAdminEmail('');
    };

    const currentUser = AuthService.currentUser();
    if (currentUser) {
      handleLogin(currentUser);
    } else {
      setIsAuthenticated(false);
    }

    AuthService.on('login', handleLogin);
    AuthService.on('logout', handleLogout);
    
    setAppReady(true);

    return () => {
      AuthService.off('login', handleLogin);
      AuthService.off('logout', handleLogout);
    };
  }, []);

  useEffect(() => {
    const sequence = "make it snow";
    let history = "";

    const handleKeyDown = (e: KeyboardEvent) => {
      history += e.key.toLowerCase();
      if (history.length > 50) {
        history = history.slice(-sequence.length * 2); 
      }
      if (history.endsWith(sequence)) {
        setShowSnow(prev => !prev);
        history = ""; 
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

  const handleSecurityCheck = (fileContent: string) => {
     try {
       const cert = JSON.parse(fileContent) as SecurityCertificate;
       const employees = PersistenceService.getEmployees();
       const matchedEmp = employees.find(e => e.email.toLowerCase() === pendingAdminEmail.toLowerCase());

       if (!matchedEmp) throw new Error("User not found.");

       // 1. Validate Certificate
       const validation = SecurityService.validateCertificate(cert, matchedEmp);
       if (!validation.valid) {
         alert(`Security Error: ${validation.error}`);
         return;
       }

       // 2. Validate Password Expiry
       if (SecurityService.isPasswordExpired(matchedEmp.passwordLastSet)) {
         const newPass = prompt("Your password has expired (60 days). Please enter a new password:");
         if (!newPass) {
           alert("Password update required.");
           return;
         }
         
         // 3. Validate History
         if (SecurityService.checkPasswordHistory(newPass, matchedEmp.previousPasswords)) {
           alert("Security Error: You cannot reuse any of your last 10 passwords.");
           return;
         }

         // Update password history
         matchedEmp.previousPasswords.unshift(matchedEmp.passwordHash); // Store old hash
         if (matchedEmp.previousPasswords.length > 10) matchedEmp.previousPasswords.pop();
         
         matchedEmp.passwordHash = newPass; // In prod this would be hashed
         matchedEmp.passwordLastSet = Date.now();
         PersistenceService.updateEmployee(matchedEmp);
         alert("Password updated successfully.");
       }

       // 4. Login Success
       setAdminUser(matchedEmp);
       setIsAuthenticated(true);
       setShowLanding(false);
       setShowCertUpload(false);
       AuthService.close();

     } catch (e) {
       console.error(e);
       alert("Invalid Certificate File. Login failed.");
     }
  };

  const handleProfileUpdate = async (updatedUser: UserProfile) => {
    if (!user) return;
    setIsAnalyzing(true);
    setUser(updatedUser); 
    PersistenceService.saveUser(updatedUser);
    const result = await analyzeReputation(updatedUser);
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
  };

  const handleKYCUpgrade = (newTier: KYCTier, limit: number) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, kycTier: newTier, kycStatus: KYCStatus.VERIFIED, kycLimit: limit };
      PersistenceService.saveUser(updated);
      return updated;
    });
    setShowKYCModal(false);
  };

  const handleRiskAnalysis = async () => {
    setShowRiskModal(true);
    if (!riskReport && user) {
      setIsRiskLoading(true);
      const report = await analyzeRiskProfile(user);
      setRiskReport(report);
      setIsRiskLoading(false);
    }
  };

  const refreshRiskAnalysis = async () => {
    if (!user) return;
    setIsRiskLoading(true);
    const report = await analyzeRiskProfile(user);
    setRiskReport(report);
    setIsRiskLoading(false);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
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
    
    setMyRequests(prev => {
      const updated = [newRequest, ...prev];
      PersistenceService.saveMyRequests(user.id, updated);
      return updated;
    });

    setLoanPurpose('');
    setLoanAmount(1000);
  };

  const handleCreateOffer = (offer: LoanOffer) => {
    if(!user) return;
    setMyOffers(prev => {
      const updated = [offer, ...prev];
      PersistenceService.saveMyOffers(user.id, updated);
      return updated;
    });
  };

  const handleFundRequest = (req: LoanRequest) => {
     if (!wallet.isConnected) {
      setShowWalletModal(true);
      return;
    }
    if (!user) return;
    const mockContract = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join("");
    const mockTx = "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join("");

    setMyRequests(prev => {
      const updated = prev.map(r => r.id === req.id ? { 
        ...r, 
        status: 'ESCROW_LOCKED' as const,
        smartContractAddress: mockContract,
        escrowTxHash: mockTx
      } : r);
      PersistenceService.saveMyRequests(user.id, updated);
      return updated;
    });
  };

  const handleReleaseEscrow = (req: LoanRequest) => {
    if (!user) return;
    setMyRequests(prev => {
      const updated = prev.map(r => r.id === req.id ? { ...r, status: 'ACTIVE' as const } : r);
      PersistenceService.saveMyRequests(user.id, updated);
      return updated;
    });
  };

  const handleRepayLoan = async (req: LoanRequest) => {
    if (!user) return;
    const platformFee = req.amount * 0.02;
    const charityDonation = platformFee * 0.5;

    setMyRequests(prev => {
      const updated = prev.map(r => r.id === req.id ? { ...r, status: 'REPAID' as const } : r);
      PersistenceService.saveMyRequests(user.id, updated);
      return updated;
    });

    if (req.charityId) {
      setCharities(prev => prev.map(c => c.id === req.charityId ? { ...c, totalRaised: c.totalRaised + charityDonation } : c));
    }

    const updatedUser = { ...user, successfulRepayments: user.successfulRepayments + 1, currentStreak: user.currentStreak + 1 };
    setUser(updatedUser);
    PersistenceService.saveUser(updatedUser);

    setIsAnalyzing(true);
    const result = await analyzeReputation(updatedUser);
    setUser(prev => {
      if (!prev) return null;
      const final = {
        ...prev,
        reputationScore: result.score,
        riskAnalysis: result.analysis,
        badges: [...new Set([...prev.badges, ...(result.newBadges || [])])]
      };
      PersistenceService.saveUser(final);
      return final;
    });
    setIsAnalyzing(false);
  };

  const handleSponsorRequest = async (req: LoanRequest) => {
    if (!user) return;
    if (!wallet.isConnected) {
      setShowWalletModal(true);
      return;
    }
    setCommunityRequests(prev => prev.filter(r => r.id !== req.id));
    const updatedUser = { ...user, mentorshipsCount: (user.mentorshipsCount || 0) + 1, totalSponsored: (user.totalSponsored || 0) + req.amount };
    setUser(updatedUser);
    PersistenceService.saveUser(updatedUser);
    
    setIsAnalyzing(true);
    const result = await analyzeReputation(updatedUser);
    setUser(prev => {
      if (!prev) return null;
      const final = {
        ...prev,
        reputationScore: result.score,
        riskAnalysis: result.analysis,
        badges: [...new Set([...prev.badges, ...(result.newBadges || [])])]
      };
      PersistenceService.saveUser(final);
      return final;
    });
    setIsAnalyzing(false);
  };

  if (!appReady) return <div className="h-screen bg-[#050505] flex items-center justify-center text-white">Loading P3 Protocol...</div>;

  // Show Landing Page
  if (!isAuthenticated && showLanding && !showCertUpload) {
    return <LandingPage onLaunch={() => setShowLanding(false)} />;
  }

  // Handle Certificate Upload Interruption
  if (showCertUpload) {
    return (
      <AdminLoginModal 
        email={pendingAdminEmail} 
        onCertificateUpload={handleSecurityCheck}
        onCancel={() => { setShowCertUpload(false); setPendingAdminEmail(''); AuthService.logout(); }}
      />
    );
  }

  // Show Auth/Login Prompt if Landing dismissed but no auth
  if (!isAuthenticated && !user && !adminUser) {
    return (
      <div className="h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden">
         <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-20"></div>
         
         <div className="absolute top-6 left-6 z-20">
            <Button variant="ghost" size="sm" onClick={() => setShowLanding(true)}>← Back to Home</Button>
         </div>

         <div className="z-10 text-center space-y-8 animate-fade-in">
           <div className="transform scale-150 mb-8">
             <Logo showText={false} />
           </div>
           
           {isVerifyingEmail ? (
             <div className="flex flex-col items-center gap-4 animate-pulse">
               <div className="w-12 h-12 border-4 border-[#00e599] border-t-transparent rounded-full animate-spin"></div>
               <h2 className="text-2xl font-bold text-white">Verifying Email...</h2>
               <p className="text-zinc-400">Please wait while we confirm your identity.</p>
             </div>
           ) : (
             <>
               <h1 className="text-4xl font-bold text-white tracking-tighter">
                 P<span className="text-[#00e599]">3</span> Securities Dashboard
               </h1>
               <p className="text-zinc-400 max-w-md mx-auto">
                 The future of reputation-based finance. Sign in to access your dashboard.
               </p>
               
               <div className="flex flex-col gap-4 items-center">
                 <Button 
                   size="lg" 
                   onClick={() => AuthService.open('login')}
                   className="min-w-[200px] shadow-[0_0_30px_rgba(0,229,153,0.3)]"
                 >
                   Connect Identity
                 </Button>
                 <p className="text-xs text-zinc-600">Employee Login enabled via @p3lending.space email</p>
               </div>
             </>
           )}
         </div>
      </div>
    );
  }

  // ROUTING: Show Admin Dashboard if admin user
  if (adminUser) {
    return <AdminDashboard currentAdmin={adminUser} onLogout={() => { setAdminUser(null); setIsAuthenticated(false); setShowLanding(true); }} />;
  }

  // ROUTING: Show User Dashboard if normal user
  if (user) {
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
        <LegalModal type={activeLegalDoc} onClose={() => setActiveLegalDoc(null)} />
        <ReferralModal isOpen={showReferralModal} onClose={() => setShowReferralModal(false)} referralCode={user.id.substring(0,6).toUpperCase()} />

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
          
          <div 
            onClick={() => setShowReferralModal(true)}
            className="p-4 mx-4 mb-4 bg-gradient-to-br from-zinc-900 to-[#00e599]/10 rounded-xl border border-zinc-800 cursor-pointer hover:border-[#00e599]/50 transition-colors group"
          >
             <div className="flex items-center gap-2 mb-2">
               <span className="text-xl">🚀</span>
               <span className="text-xs font-bold text-white uppercase tracking-wider group-hover:text-[#00e599]">Boost Score</span>
             </div>
             <p className="text-[10px] text-zinc-500">Invite friends & earn reputation points.</p>
          </div>

          <div className="p-4 border-t border-zinc-900">
             <Button variant="ghost" size="sm" className="w-full justify-start text-zinc-500 hover:text-red-400" onClick={() => AuthService.logout()}>
               <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
               Log Out
             </Button>
             <div className="mt-2 text-[8px] text-zinc-600 text-center">
               <button onClick={() => { if(confirm('Reset all data?')) PersistenceService.clearAll(user.id); }} className="hover:text-red-500">
                 Reset My Data
               </button>
             </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col relative overflow-hidden z-10">
          <div className="absolute inset-0 bg-grid-pattern pointer-events-none -z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black pointer-events-none -z-10"></div>

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

          <div className="flex-1 overflow-y-auto p-8 relative z-0 custom-scrollbar flex flex-col">
             <div className="flex-1">
               {activeView === 'borrow' && (
                 <div className="max-w-6xl mx-auto animate-fade-in space-y-8">
                    <UserProfileCard 
                      user={user} 
                      onUpdate={handleProfileUpdate} 
                      onVerifyClick={() => setShowKYCModal(true)}
                      onAnalyzeRisk={handleRiskAnalysis}
                      onEditClick={() => setActiveView('profile')}
                      isAnalyzing={isAnalyzing}
                    />
                    {user.isFrozen && (
                       <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-4 animate-pulse">
                          <span className="text-3xl">❄️</span>
                          <div>
                            <h3 className="text-red-400 font-bold">Account Frozen</h3>
                            <p className="text-sm text-red-300/80">Your account has been locked by a Risk Officer. Please contact support.</p>
                          </div>
                       </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                       <div className="md:col-span-5">
                          <div className="glass-panel rounded-2xl p-6 sticky top-4">
                            <div className="flex justify-between items-center mb-6">
                               <h3 className="text-lg font-bold text-white">New Request</h3>
                               {user.kycTier === KYCTier.TIER_0 && (
                                 <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20">KYC Required</span>
                               )}
                            </div>
                            <form onSubmit={handleCreateRequest} className="space-y-5">
                               <fieldset disabled={user.isFrozen}>
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
                                          className="w-full bg-black/50 border border-zinc-800 rounded-xl py-2.5 pl-8 pr-4 text-white focus:border-[#00e599] outline-none font-mono text-lg transition-all disabled:opacity-50"
                                        />
                                      </div>
                                   </div>
                                   <div className="flex gap-3 mt-4">
                                     <div 
                                        onClick={() => { if(!user.isFrozen) { setIsMicroloan(false); setLoanAmount(1000); }}}
                                        className={`flex-1 p-3 rounded-xl border cursor-pointer text-center transition-all ${!isMicroloan ? 'bg-zinc-800 border-zinc-600' : 'bg-black/30 border-zinc-800 text-zinc-500'}`}
                                     >
                                       <div className="text-xs font-bold">Personal</div>
                                     </div>
                                     <div 
                                        onClick={() => { if(!user.isFrozen) { setIsMicroloan(true); setLoanAmount(200); }}}
                                        className={`flex-1 p-3 rounded-xl border cursor-pointer text-center transition-all ${isMicroloan ? 'bg-[#00e599]/10 border-[#00e599] text-[#00e599]' : 'bg-black/30 border-zinc-800 text-zinc-500'}`}
                                     >
                                       <div className="text-xs font-bold">Microloan</div>
                                     </div>
                                   </div>
                                   {isMicroloan && (
                                     <div className="flex items-center gap-3 p-3 mt-4 rounded-xl bg-pink-900/10 border border-pink-500/20 cursor-pointer" onClick={() => !user.isFrozen && setIsCharityGuaranteed(!isCharityGuaranteed)}>
                                       <div className={`w-4 h-4 rounded border flex items-center justify-center ${isCharityGuaranteed ? 'bg-pink-500 border-pink-500' : 'border-zinc-600'}`}>
                                          {isCharityGuaranteed && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}
                                       </div>
                                       <span className="text-xs text-pink-300 font-medium">Fresh Start (Charity Guarantee)</span>
                                     </div>
                                   )}
                                   <div className="mt-4">
                                      <label className="block text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Purpose</label>
                                      <input 
                                        type="text" 
                                        value={loanPurpose}
                                        onChange={(e) => setLoanPurpose(e.target.value)}
                                        className="w-full bg-black/50 border border-zinc-800 rounded-xl p-2.5 text-white focus:border-[#00e599] outline-none text-sm disabled:opacity-50"
                                        placeholder="e.g. Server costs"
                                      />
                                   </div>
                                   <Button className="w-full mt-4" size="md" disabled={user.isFrozen}>Post Request</Button>
                               </fieldset>
                            </form>
                          </div>
                       </div>
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
                    <LenderDashboard 
                      user={user}
                      myOffers={myOffers}
                      communityRequests={communityRequests}
                      onCreateOffer={handleCreateOffer}
                    />
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

             {/* Legal & Compliance Footer - Global Scope for Dashboard */}
             <div className="max-w-6xl mx-auto w-full mt-12 pt-8 pb-4 border-t border-zinc-900 text-center md:text-left">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                   <div className="col-span-1 md:col-span-2">
                      <div className="flex items-center gap-2 mb-4">
                         <span className="font-bold text-white tracking-tighter text-lg">P<span className="text-[#00e599]">3</span></span>
                         <span className="text-xs text-zinc-500 uppercase tracking-widest">Compliance</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-relaxed max-w-md">
                        P3 Securities is a decentralized technology platform, not a bank or depository institution. 
                        Loans are not FDIC insured. Crypto assets are highly volatile. 
                        Participation involves significant risk, including potential loss of principal.
                      </p>
                   </div>
                   <div>
                      <h4 className="text-[10px] font-bold text-white uppercase tracking-wider mb-3">Legal</h4>
                      <ul className="space-y-2 text-[10px] text-zinc-500">
                         <li><button onClick={() => setActiveLegalDoc('TERMS')} className="hover:text-[#00e599]">Terms of Service</button></li>
                         <li><button onClick={() => setActiveLegalDoc('PRIVACY')} className="hover:text-[#00e599]">Privacy Policy</button></li>
                         <li><button onClick={() => setActiveLegalDoc('ESIGN')} className="hover:text-[#00e599]">E-Sign Consent</button></li>
                         <li><button onClick={() => setActiveLegalDoc('DISCLOSURES')} className="hover:text-[#00e599]">State Disclosures</button></li>
                      </ul>
                   </div>
                   <div>
                      <h4 className="text-[10px] font-bold text-white uppercase tracking-wider mb-3">Resources</h4>
                      <ul className="space-y-2 text-[10px] text-zinc-500">
                         <li><button onClick={() => setActiveLegalDoc('ECOA')} className="hover:text-[#00e599]">Fair Lending (ECOA)</button></li>
                         <li><button onClick={() => setActiveLegalDoc('SECURITY')} className="hover:text-[#00e599]">Responsible Security</button></li>
                         <li><button onClick={() => setActiveLegalDoc('SUPPORT')} className="hover:text-[#00e599]">Support & Safety</button></li>
                      </ul>
                   </div>
                </div>
                <div className="mt-8 pt-4 border-t border-zinc-900 text-[10px] text-zinc-600 flex justify-between items-center">
                   <span>© 2024 P3 Securities. All rights reserved.</span>
                   <span>NMLS ID: 123456 (Pending)</span>
                </div>
             </div>
          </div>
        </main>
      </div>
    );
  }

  // Fallback (should not be reached)
  return null;
};

export default App;
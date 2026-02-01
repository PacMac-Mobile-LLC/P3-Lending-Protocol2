import { UserProfile, LoanRequest, LoanOffer, LoanType, KYCTier, KYCStatus, EmployeeProfile, ReferralData, InternalTicket, InternalChatMessage, Dispute } from '../types';
import { SecurityService } from './security';

// Dynamic Keys based on User ID
const getKeys = (userId: string) => ({
  USER: `p3_user_${userId}`,
});

// Global "Database" Keys (Simulating Backend)
const GLOBAL_KEYS = {
  EMPLOYEES: 'p3_admin_employees',
  TICKETS: 'p3_internal_tickets',
  CHAT: 'p3_internal_chat_history',
  REQUESTS: 'p3_global_requests',
  OFFERS: 'p3_global_offers',
  DISPUTES: 'p3_global_disputes'
};

// Fallback data if no local data exists
const INITIAL_USER_TEMPLATE: UserProfile = {
  id: 'guest',
  name: 'Guest User',
  income: 0,
  balance: 0,
  avatarUrl: undefined,
  employmentStatus: 'Unemployed',
  financialHistory: 'New account.',
  reputationScore: 50,
  riskAnalysis: 'Insufficient data for analysis.',
  successfulRepayments: 0,
  currentStreak: 0,
  badges: [],
  kycTier: KYCTier.TIER_0,
  kycStatus: KYCStatus.UNVERIFIED,
  kycLimit: 0,
  mentorshipsCount: 0,
  walletAgeDays: 0, 
  txCount: 0,
  referrals: []
};

// Root Admin - The only hardcoded seed allowed for system access
const SUPER_ADMIN: EmployeeProfile = {
  id: 'emp_super_admin',
  name: 'System Root',
  email: 'admin@p3lending.space',
  role: 'ADMIN',
  isActive: true,
  passwordHash: 'admin123',
  passwordLastSet: Date.now(),
  previousPasswords: [],
  certificateData: SecurityService.getMasterCertificate()
};

export const PersistenceService = {
  // --- User Profile ---
  loadUser: (netlifyUser: any, pendingReferralCode?: string | null): UserProfile => {
    try {
      if (!netlifyUser) return INITIAL_USER_TEMPLATE;

      const keys = getKeys(netlifyUser.id);
      const data = localStorage.getItem(keys.USER);

      if (data) {
        return JSON.parse(data);
      } else {
        // Create new profile based on Netlify Data
        const newUser: UserProfile = {
          ...INITIAL_USER_TEMPLATE,
          id: netlifyUser.id,
          name: netlifyUser.user_metadata?.full_name || netlifyUser.email.split('@')[0],
          avatarUrl: netlifyUser.user_metadata?.avatar_url || undefined,
          reputationScore: 50, 
        };

        // Handle Referral Logic
        if (pendingReferralCode && pendingReferralCode !== newUser.id) {
             PersistenceService.registerReferral(pendingReferralCode, newUser.id);
             newUser.referredBy = pendingReferralCode;
        }

        PersistenceService.saveUser(newUser);
        return newUser;
      }
    } catch (e) {
      console.error("Failed to load user", e);
      return INITIAL_USER_TEMPLATE;
    }
  },

  registerReferral: (referrerId: string, newUserId: string) => {
    try {
      const referrerKeys = getKeys(referrerId);
      const referrerData = localStorage.getItem(referrerKeys.USER);
      
      if (referrerData) {
        const referrerProfile: UserProfile = JSON.parse(referrerData);
        const newReferral: ReferralData = {
          userId: newUserId,
          date: new Date().toISOString(),
          status: 'PENDING',
          earnings: 0
        };

        if (!referrerProfile.referrals.some(r => r.userId === newUserId)) {
          referrerProfile.referrals.push(newReferral);
          localStorage.setItem(referrerKeys.USER, JSON.stringify(referrerProfile));
        }
      }
    } catch (e) {
      console.error("Failed to register referral", e);
    }
  },

  saveUser: (user: UserProfile) => {
    try {
      const keys = getKeys(user.id);
      localStorage.setItem(keys.USER, JSON.stringify(user));
    } catch (e) {
      console.error("Failed to save user", e);
    }
  },

  processDeposit: (user: UserProfile, amount: number): UserProfile => {
    const updatedUser = { ...user, balance: user.balance + amount };
    PersistenceService.saveUser(updatedUser);

    if (updatedUser.balance >= 100 && updatedUser.referredBy) {
      PersistenceService.completeReferral(updatedUser.referredBy, updatedUser.id);
    }

    return updatedUser;
  },

  completeReferral: (referrerId: string, refereeId: string) => {
    try {
      const keys = getKeys(referrerId);
      const data = localStorage.getItem(keys.USER);
      if (data) {
        const referrer: UserProfile = JSON.parse(data);
        const referralIndex = referrer.referrals.findIndex(r => r.userId === refereeId);
        
        if (referralIndex !== -1 && referrer.referrals[referralIndex].status === 'PENDING') {
          referrer.referrals[referralIndex].status = 'COMPLETED';
          referrer.referrals[referralIndex].earnings = 5;
          referrer.reputationScore = Math.min(100, referrer.reputationScore + 5);
          referrer.badges.push('Community Builder');
          referrer.badges = [...new Set(referrer.badges)];
          localStorage.setItem(keys.USER, JSON.stringify(referrer));
        }
      }
    } catch (e) {
      console.error("Failed to complete referral reward", e);
    }
  },

  getAllUsers: (): UserProfile[] => {
    const users: UserProfile[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('p3_user_')) {
        try {
          const userData = localStorage.getItem(key);
          if (userData) {
            users.push(JSON.parse(userData));
          }
        } catch (e) { console.error(e); }
      }
    }
    return users;
  },

  // --- Employees & Admin ---
  getEmployees: (): EmployeeProfile[] => {
    const data = localStorage.getItem(GLOBAL_KEYS.EMPLOYEES);
    let employees: EmployeeProfile[] = data ? JSON.parse(data) : [SUPER_ADMIN];
    
    // Ensure Super Admin exists
    const adminIndex = employees.findIndex(e => e.email === 'admin@p3lending.space');
    if (adminIndex === -1) {
      employees.push(SUPER_ADMIN);
      localStorage.setItem(GLOBAL_KEYS.EMPLOYEES, JSON.stringify(employees));
    }
    return employees;
  },

  addEmployee: (emp: EmployeeProfile) => {
    const current = PersistenceService.getEmployees();
    const updated = [...current, emp];
    localStorage.setItem(GLOBAL_KEYS.EMPLOYEES, JSON.stringify(updated));
    return updated;
  },

  updateEmployee: (emp: EmployeeProfile) => {
    const current = PersistenceService.getEmployees();
    const updated = current.map(e => e.id === emp.id ? emp : e);
    localStorage.setItem(GLOBAL_KEYS.EMPLOYEES, JSON.stringify(updated));
    return updated;
  },

  // --- Global Marketplace Data (Simulated Backend) ---
  
  // Requests
  getAllRequests: (): LoanRequest[] => {
    try {
      const data = localStorage.getItem(GLOBAL_KEYS.REQUESTS);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },

  saveRequest: (req: LoanRequest) => {
    const all = PersistenceService.getAllRequests();
    const existingIndex = all.findIndex(r => r.id === req.id);
    let updated;
    if (existingIndex >= 0) {
      updated = all.map(r => r.id === req.id ? req : r);
    } else {
      updated = [req, ...all];
    }
    localStorage.setItem(GLOBAL_KEYS.REQUESTS, JSON.stringify(updated));
    return updated;
  },

  // Offers
  getAllOffers: (): LoanOffer[] => {
    try {
      const data = localStorage.getItem(GLOBAL_KEYS.OFFERS);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },

  saveOffer: (offer: LoanOffer) => {
    const all = PersistenceService.getAllOffers();
    const existingIndex = all.findIndex(o => o.id === offer.id);
    let updated;
    if (existingIndex >= 0) {
      updated = all.map(o => o.id === offer.id ? offer : o);
    } else {
      updated = [offer, ...all];
    }
    localStorage.setItem(GLOBAL_KEYS.OFFERS, JSON.stringify(updated));
    return updated;
  },

  // Disputes
  getAllDisputes: (): Dispute[] => {
    try {
      const data = localStorage.getItem(GLOBAL_KEYS.DISPUTES);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },

  saveDispute: (dispute: Dispute) => {
    const all = PersistenceService.getAllDisputes();
    const existingIndex = all.findIndex(d => d.id === dispute.id);
    let updated;
    if (existingIndex >= 0) {
      updated = all.map(d => d.id === dispute.id ? dispute : d);
    } else {
      updated = [dispute, ...all];
    }
    localStorage.setItem(GLOBAL_KEYS.DISPUTES, JSON.stringify(updated));
    return updated;
  },

  // --- Internal Tools ---
  getInternalTickets: (): InternalTicket[] => {
    const data = localStorage.getItem(GLOBAL_KEYS.TICKETS);
    return data ? JSON.parse(data) : [];
  },
  
  addInternalTicket: (ticket: InternalTicket) => {
    const current = PersistenceService.getInternalTickets();
    const updated = [ticket, ...current];
    localStorage.setItem(GLOBAL_KEYS.TICKETS, JSON.stringify(updated));
    return updated;
  },

  resolveInternalTicket: (ticketId: string) => {
    const current = PersistenceService.getInternalTickets();
    const updated = current.map(t => t.id === ticketId ? { ...t, status: 'RESOLVED' as const } : t);
    localStorage.setItem(GLOBAL_KEYS.TICKETS, JSON.stringify(updated));
    return updated;
  },

  getChatHistory: (): InternalChatMessage[] => {
    try {
      const data = localStorage.getItem(GLOBAL_KEYS.CHAT);
      if (!data) {
        const welcome: InternalChatMessage = {
          id: 'msg_welcome',
          senderId: 'emp_super_admin',
          senderName: 'System Root',
          role: 'ADMIN',
          message: 'System Initialized. Encrypted Channel Active.',
          timestamp: Date.now()
        };
        PersistenceService.addChatMessage(welcome);
        return [welcome];
      }
      return JSON.parse(data);
    } catch (e) { return []; }
  },

  addChatMessage: (msg: InternalChatMessage) => {
    const current = PersistenceService.getChatHistory();
    const updated = [...current, msg].slice(-200); // Keep last 200
    localStorage.setItem(GLOBAL_KEYS.CHAT, JSON.stringify(updated));
    return updated;
  },

  // --- Helpers for Filtering ---
  getMyRequests: (userId: string): LoanRequest[] => {
    return PersistenceService.getAllRequests().filter(r => r.borrowerId === userId);
  },

  getMyOffers: (userId: string): LoanOffer[] => {
    return PersistenceService.getAllOffers().filter(o => o.lenderId === userId);
  },

  // --- Reset ---
  clearAll: (userId: string) => {
    const keys = getKeys(userId);
    localStorage.removeItem(keys.USER);
    // Note: We do NOT clear global requests/offers to preserve system integrity for other users
    window.location.reload();
  }
};
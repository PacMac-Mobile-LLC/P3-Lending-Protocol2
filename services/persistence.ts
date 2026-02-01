import { UserProfile, LoanRequest, LoanOffer, LoanType, KYCTier, KYCStatus, EmployeeProfile, ReferralData, InternalTicket, InternalChatMessage } from '../types';
import { SecurityService } from './security';

// We now generate keys dynamically based on the User ID
const getKeys = (userId: string) => ({
  USER: `p3_user_${userId}`,
  MY_REQUESTS: `p3_my_requests_${userId}`,
  MY_OFFERS: `p3_my_offers_${userId}`, 
});

const EMPLOYEES_KEY = 'p3_admin_employees';
const INTERNAL_TICKETS_KEY = 'p3_internal_tickets';
const INTERNAL_CHAT_KEY = 'p3_internal_chat_history';

// Fallback data if no local data exists
const INITIAL_USER_TEMPLATE: UserProfile = {
  id: 'guest',
  name: 'Guest User',
  income: 65000,
  balance: 0,
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
  txCount: 45,
  referrals: []
};

// Only the Super Admin initially
const SUPER_ADMIN: EmployeeProfile = {
  id: 'emp_super_admin',
  name: 'System Root',
  email: 'admin@p3lending.space',
  role: 'ADMIN',
  isActive: true,
  passwordHash: 'admin123',
  passwordLastSet: Date.now(), // Fresh password
  previousPasswords: [],
  // Pre-install the Master Certificate so validation works immediately
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
          // Reset reputation for new users
          reputationScore: 50, 
        };

        // Handle Referral Logic for NEW users only
        if (pendingReferralCode) {
           // We expect referral code to be the User ID of the referrer
           // Prevent self-referral
           if (pendingReferralCode !== newUser.id) {
             PersistenceService.registerReferral(pendingReferralCode, newUser.id);
             newUser.referredBy = pendingReferralCode;
           }
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
      // Load the Referrer
      const referrerKeys = getKeys(referrerId);
      const referrerData = localStorage.getItem(referrerKeys.USER);
      
      if (referrerData) {
        const referrerProfile: UserProfile = JSON.parse(referrerData);
        
        // Add pending referral
        const newReferral: ReferralData = {
          userId: newUserId,
          date: new Date().toISOString(),
          status: 'PENDING',
          earnings: 0
        };

        // Avoid duplicates
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
      console.error("Failed to save user (likely QuotaExceeded for image)", e);
      alert("Storage limit reached. Try using a smaller profile image.");
    }
  },

  // --- Financial Actions ---
  processDeposit: (user: UserProfile, amount: number): UserProfile => {
    const updatedUser = { ...user, balance: user.balance + amount };
    PersistenceService.saveUser(updatedUser);

    // CHECK REFERRAL CONVERSION
    // If balance >= 100 and they were referred by someone, trigger reward
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
          // Update Status
          referrer.referrals[referralIndex].status = 'COMPLETED';
          referrer.referrals[referralIndex].earnings = 5; // +5 Reputation Points
          
          // Apply Reward
          referrer.reputationScore = Math.min(100, referrer.reputationScore + 5);
          referrer.badges.push('Community Builder');
          
          // Dedupe badges
          referrer.badges = [...new Set(referrer.badges)];

          localStorage.setItem(keys.USER, JSON.stringify(referrer));
          
          // Optional: Notify the user in the UI somehow (omitted for brevity, handled by reactive state updates if online)
        }
      }
    } catch (e) {
      console.error("Failed to complete referral reward", e);
    }
  },

  // --- Admin Methods ---
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
        } catch (e) {
          console.error("Failed to parse user", key);
        }
      }
    }
    return users;
  },

  getEmployees: (): EmployeeProfile[] => {
    const data = localStorage.getItem(EMPLOYEES_KEY);
    let employees: EmployeeProfile[] = data ? JSON.parse(data) : [SUPER_ADMIN];
    
    // Self-Healing: Ensure Super Admin always exists and has a cert
    const adminIndex = employees.findIndex(e => e.email === 'admin@p3lending.space');
    if (adminIndex === -1) {
      employees.push(SUPER_ADMIN);
      localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
    } else if (!employees[adminIndex].certificateData) {
      // Fix missing cert for admin if it somehow got corrupted
      employees[adminIndex].certificateData = SUPER_ADMIN.certificateData;
      localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
    }

    return employees;
  },

  addEmployee: (emp: EmployeeProfile) => {
    const current = PersistenceService.getEmployees();
    const updated = [...current, emp];
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updated));
    return updated;
  },

  updateEmployee: (emp: EmployeeProfile) => {
    const current = PersistenceService.getEmployees();
    const updated = current.map(e => e.id === emp.id ? emp : e);
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updated));
    return updated;
  },

  // --- Internal Knowledge Base / Tickets ---
  getInternalTickets: (): InternalTicket[] => {
    const data = localStorage.getItem(INTERNAL_TICKETS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  addInternalTicket: (ticket: InternalTicket) => {
    const current = PersistenceService.getInternalTickets();
    const updated = [ticket, ...current]; // Newest first
    localStorage.setItem(INTERNAL_TICKETS_KEY, JSON.stringify(updated));
    return updated;
  },

  resolveInternalTicket: (ticketId: string) => {
    const current = PersistenceService.getInternalTickets();
    const updated = current.map(t => t.id === ticketId ? { ...t, status: 'RESOLVED' as const } : t);
    localStorage.setItem(INTERNAL_TICKETS_KEY, JSON.stringify(updated));
    return updated;
  },

  // --- Internal Chat ---
  getChatHistory: (): InternalChatMessage[] => {
    try {
      const data = localStorage.getItem(INTERNAL_CHAT_KEY);
      // Pre-seed with a welcome message if empty
      if (!data) {
        const welcome: InternalChatMessage = {
          id: 'msg_welcome',
          senderId: 'emp_super_admin',
          senderName: 'System Root',
          role: 'ADMIN',
          message: 'Welcome to the P3 Internal Channel. All logs are encrypted.',
          timestamp: Date.now()
        };
        PersistenceService.addChatMessage(welcome);
        return [welcome];
      }
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  },

  addChatMessage: (msg: InternalChatMessage) => {
    const current = PersistenceService.getChatHistory();
    // Keep last 100 messages
    const updated = [...current, msg].slice(-100); 
    localStorage.setItem(INTERNAL_CHAT_KEY, JSON.stringify(updated));
    return updated;
  },

  // --- Loan Requests ---
  getMyRequests: (userId: string): LoanRequest[] => {
    try {
      const keys = getKeys(userId);
      const data = localStorage.getItem(keys.MY_REQUESTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveMyRequests: (userId: string, requests: LoanRequest[]) => {
    const keys = getKeys(userId);
    localStorage.setItem(keys.MY_REQUESTS, JSON.stringify(requests));
  },

  addRequest: (userId: string, req: LoanRequest) => {
    const current = PersistenceService.getMyRequests(userId);
    const updated = [req, ...current];
    PersistenceService.saveMyRequests(userId, updated);
    return updated;
  },

  updateRequest: (userId: string, updatedReq: LoanRequest) => {
    const current = PersistenceService.getMyRequests(userId);
    const updated = current.map(r => r.id === updatedReq.id ? updatedReq : r);
    PersistenceService.saveMyRequests(userId, updated);
    return updated;
  },

  // --- Loan Offers (Lender Side) ---
  getMyOffers: (userId: string): LoanOffer[] => {
    try {
      const keys = getKeys(userId);
      const data = localStorage.getItem(keys.MY_OFFERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveMyOffers: (userId: string, offers: LoanOffer[]) => {
    const keys = getKeys(userId);
    localStorage.setItem(keys.MY_OFFERS, JSON.stringify(offers));
  },

  // --- Reset ---
  clearAll: (userId: string) => {
    const keys = getKeys(userId);
    localStorage.removeItem(keys.USER);
    localStorage.removeItem(keys.MY_REQUESTS);
    localStorage.removeItem(keys.MY_OFFERS);
    window.location.reload();
  }
};
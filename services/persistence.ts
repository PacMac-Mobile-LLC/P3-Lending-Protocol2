import { UserProfile, LoanRequest, LoanOffer, LoanType, KYCTier, KYCStatus, EmployeeProfile } from '../types';

// We now generate keys dynamically based on the User ID
const getKeys = (userId: string) => ({
  USER: `p3_user_${userId}`,
  MY_REQUESTS: `p3_my_requests_${userId}`,
  MY_OFFERS: `p3_my_offers_${userId}`, 
});

const EMPLOYEES_KEY = 'p3_admin_employees';

// Fallback data if no local data exists
const INITIAL_USER_TEMPLATE: UserProfile = {
  id: 'guest',
  name: 'Guest User',
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

const MOCK_EMPLOYEES: EmployeeProfile[] = [
  { id: 'emp1', name: 'Matt H.', email: 'matt@p3securities.com', role: 'ADMIN', isActive: true },
  { id: 'emp2', name: 'Sarah Risk', email: 'sarah@p3securities.com', role: 'RISK_OFFICER', isActive: true },
  { id: 'emp3', name: 'Support Bot', email: 'support@p3securities.com', role: 'SUPPORT', isActive: true }
];

export const PersistenceService = {
  // --- User Profile ---
  loadUser: (netlifyUser: any): UserProfile => {
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
        PersistenceService.saveUser(newUser);
        return newUser;
      }
    } catch (e) {
      console.error("Failed to load user", e);
      return INITIAL_USER_TEMPLATE;
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
    // Add dummy users if list is empty for demo purposes
    if (users.length === 0) {
      return [
        { ...INITIAL_USER_TEMPLATE, id: 'demo1', name: 'Alice Chains', reputationScore: 85, kycTier: KYCTier.TIER_2 },
        { ...INITIAL_USER_TEMPLATE, id: 'demo2', name: 'Bob Builder', reputationScore: 45, kycTier: KYCTier.TIER_1, isFrozen: true },
        { ...INITIAL_USER_TEMPLATE, id: 'demo3', name: 'Charlie Crypto', reputationScore: 92, kycTier: KYCTier.TIER_3 }
      ];
    }
    return users;
  },

  getEmployees: (): EmployeeProfile[] => {
    const data = localStorage.getItem(EMPLOYEES_KEY);
    return data ? JSON.parse(data) : MOCK_EMPLOYEES;
  },

  addEmployee: (emp: EmployeeProfile) => {
    const current = PersistenceService.getEmployees();
    const updated = [...current, emp];
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updated));
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
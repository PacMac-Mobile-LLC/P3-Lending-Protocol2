import { UserProfile, LoanRequest, LoanType, KYCTier, KYCStatus } from '../types';

const KEYS = {
  USER: 'p3_user_v1',
  MY_REQUESTS: 'p3_my_requests_v1',
  THEME: 'p3_theme'
};

// Fallback data if no local data exists
const INITIAL_USER_TEMPLATE: UserProfile = {
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

export const PersistenceService = {
  // --- User Profile ---
  getUser: (): UserProfile => {
    try {
      const data = localStorage.getItem(KEYS.USER);
      return data ? JSON.parse(data) : INITIAL_USER_TEMPLATE;
    } catch (e) {
      console.error("Failed to load user", e);
      return INITIAL_USER_TEMPLATE;
    }
  },

  saveUser: (user: UserProfile) => {
    try {
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.error("Failed to save user (likely QuotaExceeded for image)", e);
      alert("Storage limit reached. Try using a smaller profile image.");
    }
  },

  // --- Loan Requests ---
  getMyRequests: (): LoanRequest[] => {
    try {
      const data = localStorage.getItem(KEYS.MY_REQUESTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveMyRequests: (requests: LoanRequest[]) => {
    localStorage.setItem(KEYS.MY_REQUESTS, JSON.stringify(requests));
  },

  addRequest: (req: LoanRequest) => {
    const current = PersistenceService.getMyRequests();
    const updated = [req, ...current];
    PersistenceService.saveMyRequests(updated);
    return updated;
  },

  updateRequest: (updatedReq: LoanRequest) => {
    const current = PersistenceService.getMyRequests();
    const updated = current.map(r => r.id === updatedReq.id ? updatedReq : r);
    PersistenceService.saveMyRequests(updated);
    return updated;
  },

  // --- Reset ---
  clearAll: () => {
    localStorage.removeItem(KEYS.USER);
    localStorage.removeItem(KEYS.MY_REQUESTS);
    window.location.reload();
  }
};

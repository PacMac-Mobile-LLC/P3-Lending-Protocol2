export enum LoanType {
  PERSONAL = 'Personal',
  BUSINESS = 'Business',
  EMERGENCY = 'Emergency',
  EDUCATION = 'Education',
  MICROLOAN = 'Microloan (Credit Builder)'
}

export type LoanStatus = 'PENDING' | 'MATCHED' | 'ESCROW_LOCKED' | 'ACTIVE' | 'REPAID';

export enum KYCTier {
  TIER_0 = 'Tier 0 (Unverified)',
  TIER_1 = 'Tier 1 (Basic)',
  TIER_2 = 'Tier 2 (Verified)',
  TIER_3 = 'Tier 3 (Enhanced)'
}

export enum KYCStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export interface Charity {
  id: string;
  name: string;
  mission: string;
  totalRaised: number;
  color: string;
}

export interface UserProfile {
  id: string;
  name: string;
  income: number;
  employmentStatus: string;
  financialHistory: string; 
  reputationScore: number; 
  riskAnalysis?: string;
  successfulRepayments: number;
  currentStreak: number;
  badges: string[];
  
  // KYC / AML Data
  kycTier: KYCTier;
  kycStatus: KYCStatus;
  kycLimit: number; // Max loan amount allowed
}

export interface LoanRequest {
  id: string;
  borrowerId: string;
  borrowerName: string;
  amount: number;
  purpose: string;
  type: LoanType;
  maxInterestRate: number;
  status: LoanStatus;
  reputationScoreSnapshot: number;
  charityId?: string;
}

export interface LoanOffer {
  id: string;
  lenderId: string;
  lenderName: string;
  maxAmount: number;
  interestRate: number;
  minReputationScore: number;
  terms: string;
}

export interface MatchResult {
  offerId: string;
  requestId: string;
  matchScore: number;
  reasoning: string;
}


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
  avatarUrl?: string; // New field for Profile Pic
  income: number;
  balance: number; // Platform balance
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

  // Mentorship Stats
  mentorshipsCount?: number;
  totalSponsored?: number;
  
  // Blockchain Data (Simulated for Risk Engine)
  walletAgeDays?: number;
  txCount?: number;
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
  isSponsorship?: boolean; // If true, this is a microloan funded by a mentor
  mentorId?: string;
  isCharityGuaranteed?: boolean; // Fresh Start protocol
  
  // Smart Contract Escrow Data
  smartContractAddress?: string;
  escrowTxHash?: string;
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

// Wallet Integrations
export type WalletProvider = 'METAMASK' | 'WALLETCONNECT' | 'COINBASE' | null;

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  provider: WalletProvider;
  chainId: number | null;
  balance: string; // Formatted ETH balance
}

// Risk Analysis
export interface RiskFactor {
  category: 'MACRO' | 'ON-CHAIN' | 'BEHAVIORAL';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  sourceUrl?: string; // If sourced from Google Search
}

export interface RiskReport {
  compositeScore: number; // 0 (Safe) to 100 (High Risk)
  macroScore: number; // External market conditions
  walletScore: number; // Internal history
  factors: RiskFactor[];
  summary: string;
  timestamp: string;
}


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

export interface ReferralData {
  userId: string;
  date: string;
  status: 'PENDING' | 'COMPLETED'; // PENDING = Signed up, COMPLETED = Added > $100
  earnings: number;
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
  documents?: {
    idType: string;
    idFile?: string; // Base64 or URL
    faceFile?: string; // Base64 or URL
    submittedAt: number;
  };
  isFrozen?: boolean; // Admin action
  adminNotes?: string;

  // Mentorship Stats
  mentorshipsCount?: number;
  totalSponsored?: number;
  
  // Referral System
  referredBy?: string; // ID of the user who referred this profile
  referrals: ReferralData[]; // List of people I have referred
  
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
  status?: 'ACTIVE' | 'PAUSED'; // Added status
}

export interface MatchResult {
  offerId: string;
  requestId: string; // The ID of the item being matched against
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

// Admin / Employee Types
export type AdminRole = 'SUPPORT' | 'RISK_OFFICER' | 'ADMIN';

export interface SecurityCertificate {
  issuedTo: string;
  issuedAt: number;
  expiresAt: number;
  signature: string; // Mock signature
}

export interface EmployeeProfile {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  lastLogin?: string;
  
  // Security Features
  passwordHash: string; // Simulated hash
  passwordLastSet: number; // Timestamp
  previousPasswords: string[]; // History of last 10
  certificateData?: SecurityCertificate; // The active cert required
}

// Arbitration
export type DisputeStatus = 'OPEN' | 'RESOLVED' | 'DISMISSED';

export interface Dispute {
  id: string;
  reporterId: string;
  reporterName: string;
  accusedId: string;
  accusedName: string;
  reason: string;
  evidence?: string;
  status: DisputeStatus;
  createdAt: number;
  resolution?: string;
}

// Internal Knowledge Base
export interface InternalTicket {
  id: string;
  authorId: string;
  authorName: string;
  subject: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'RESOLVED';
  createdAt: number;
}

export type ChatType = 'INTERNAL' | 'CUSTOMER_SUPPORT';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  role: AdminRole | 'CUSTOMER';
  message: string;
  timestamp: number;
  type: ChatType;
  threadId?: string; // For grouping customer support tickets
}

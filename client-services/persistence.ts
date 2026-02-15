import { UserProfile, LoanRequest, LoanOffer, EmployeeProfile, ReferralData, InternalTicket, ChatMessage, Dispute, KYCTier, KYCStatus, WaitlistEntry } from '../types';
import { supabase } from '../supabaseClient';

// INITIAL TEMPLATE REMAINING FOR FALLBACK
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

const BASE_WAITLIST_COUNT = 4291;

// NOTE: All methods are now ASYNC because they hit the database.
export const PersistenceService = {
  
  // --- Waitlist Management ---

  addToWaitlist: async (name: string, email: string) => {
    try {
      // Check if exists first to prevent unique constraint errors if not handled by DB
      const existing = await PersistenceService.getWaitlistPosition(email);
      if (existing) return; // Already in list

      await supabase.from('waitlist').insert({
        name,
        email,
        status: 'PENDING',
        created_at: new Date().toISOString()
      });
    } catch (e) {
      console.error("Failed to add to waitlist", e);
    }
  },

  getWaitlist: async (): Promise<WaitlistEntry[]> => {
    // Return oldest first to visualize the "Line"
    const { data } = await supabase.from('waitlist').select('*').order('created_at', { ascending: true });
    return data ? data.map((r: any) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      status: r.status,
      created_at: r.created_at
    })) : [];
  },

  // Returns the user's specific position and name if found
  getWaitlistPosition: async (email: string): Promise<{ position: number; name: string } | null> => {
    try {
      // Fetch all emails/names ordered by date to calculate rank
      const { data } = await supabase
        .from('waitlist')
        .select('email, name')
        .order('created_at', { ascending: true });

      if (!data) return null;

      const index = data.findIndex((e: any) => e.email.toLowerCase() === email.trim().toLowerCase());
      if (index === -1) return null;

      return {
        position: BASE_WAITLIST_COUNT + index + 1,
        name: data[index].name
      };
    } catch (e) {
      console.error("Error fetching position", e);
      return null;
    }
  },

  getWaitlistCount: async (): Promise<number> => {
    try {
      const { count } = await supabase.from('waitlist').select('*', { count: 'exact', head: true });
      return BASE_WAITLIST_COUNT + (count || 0);
    } catch (e) {
      return BASE_WAITLIST_COUNT;
    }
  },

  updateWaitlistStatus: async (id: string, status: 'INVITED' | 'ONBOARDED') => {
    await supabase.from('waitlist').update({ status }).eq('id', id);
  },

  inviteWaitlistBatch: async (count: number) => {
    // 1. Fetch the IDs of the oldest 'PENDING' users
    const { data: pendingUsers } = await supabase
      .from('waitlist')
      .select('id')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: true })
      .limit(count);

    if (!pendingUsers || pendingUsers.length === 0) return;

    const idsToUpdate = pendingUsers.map((u: any) => u.id);

    // 2. Update status to INVITED
    await supabase
      .from('waitlist')
      .update({ status: 'INVITED' })
      .in('id', idsToUpdate);
  },

  // --- User Profile ---
  
  loadUser: async (netlifyUser: any, pendingReferralCode?: string | null): Promise<UserProfile> => {
    if (!netlifyUser) return INITIAL_USER_TEMPLATE;

    try {
      // 1. Try to fetch existing user
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', netlifyUser.id)
        .single();

      if (data) {
        // User exists, return parsed data
        return { ...data.data, id: data.id, email: data.email }; // Flatten jsonb
      } else {
        // 2. Create New User
        const newUser: UserProfile = {
          ...INITIAL_USER_TEMPLATE,
          id: netlifyUser.id,
          name: netlifyUser.user_metadata?.full_name || netlifyUser.email.split('@')[0],
          avatarUrl: netlifyUser.user_metadata?.avatar_url || undefined,
        };

        // Handle Referral
        if (pendingReferralCode && pendingReferralCode !== newUser.id) {
           await PersistenceService.registerReferral(pendingReferralCode, newUser.id);
           newUser.referredBy = pendingReferralCode;
        }

        // Insert into DB
        await supabase.from('users').insert({
          id: newUser.id,
          email: netlifyUser.email,
          data: newUser 
        });

        // If they were on waitlist, update status to ONBOARDED
        try {
          const { data: waitlistData } = await supabase.from('waitlist').select('*').eq('email', netlifyUser.email).single();
          if (waitlistData) {
            await PersistenceService.updateWaitlistStatus(waitlistData.id, 'ONBOARDED');
          }
        } catch (ignore) {}

        return newUser;
      }
    } catch (e) {
      console.error("DB Load Error", e);
      return INITIAL_USER_TEMPLATE;
    }
  },

  saveUser: async (user: UserProfile) => {
    // Separate ID from data blob to avoid duplication
    const { id, ...userData } = user;
    await supabase
      .from('users')
      .upsert({ id: id, data: user });
  },

  getAllUsers: async (): Promise<UserProfile[]> => {
    const { data } = await supabase.from('users').select('*');
    return data ? data.map((r: any) => r.data) : [];
  },

  registerReferral: async (referrerId: string, newUserId: string) => {
    // Fetch Referrer
    const { data } = await supabase.from('users').select('*').eq('id', referrerId).single();
    if (data) {
      const profile = data.data as UserProfile;
      const newReferral: ReferralData = {
        userId: newUserId,
        date: new Date().toISOString(),
        status: 'PENDING',
        earnings: 0
      };
      
      if (!profile.referrals.some(r => r.userId === newUserId)) {
        profile.referrals.push(newReferral);
        await PersistenceService.saveUser(profile);
      }
    }
  },

  // --- Employees ---

  getEmployees: async (): Promise<EmployeeProfile[]> => {
    const { data } = await supabase.from('employees').select('*');
    if (!data) return [];
    
    return data.map((e: any) => ({
      ...e.data,
      id: e.id,
      email: e.email,
      role: e.role,
      passwordHash: e.password_hash,
      isActive: e.is_active
    }));
  },

  addEmployee: async (employee: EmployeeProfile): Promise<EmployeeProfile[]> => {
    await supabase.from('employees').upsert({
      id: employee.id,
      email: employee.email,
      role: employee.role,
      password_hash: employee.passwordHash,
      is_active: employee.isActive,
      data: employee
    });
    return PersistenceService.getEmployees();
  },

  updateEmployee: async (employee: EmployeeProfile): Promise<EmployeeProfile[]> => {
    await supabase.from('employees').upsert({
      id: employee.id,
      email: employee.email,
      role: employee.role,
      password_hash: employee.passwordHash,
      is_active: employee.isActive,
      data: employee
    });
    return PersistenceService.getEmployees();
  },

  // --- Internal Tickets ---

  getInternalTickets: async (): Promise<InternalTicket[]> => {
    const { data } = await supabase.from('internal_tickets').select('*').order('created_at', { ascending: false });
    return data ? data.map((r: any) => r.data) : [];
  },

  addInternalTicket: async (ticket: InternalTicket): Promise<InternalTicket[]> => {
    await supabase.from('internal_tickets').insert({
      id: ticket.id,
      status: ticket.status,
      data: ticket
    });
    return PersistenceService.getInternalTickets();
  },

  resolveInternalTicket: async (id: string): Promise<InternalTicket[]> => {
    const { data } = await supabase.from('internal_tickets').select('*').eq('id', id).single();
    if (data) {
      const ticket = data.data as InternalTicket;
      ticket.status = 'RESOLVED';
      await supabase.from('internal_tickets').update({
        status: 'RESOLVED',
        data: ticket
      }).eq('id', id);
    }
    return PersistenceService.getInternalTickets();
  },

  // --- Marketplace ---

  getAllRequests: async (): Promise<LoanRequest[]> => {
    const { data } = await supabase.from('loan_requests').select('*').order('created_at', { ascending: false });
    return data ? data.map((r: any) => r.data) : [];
  },

  saveRequest: async (req: LoanRequest) => {
    await supabase.from('loan_requests').upsert({
      id: req.id,
      borrower_id: req.borrowerId,
      status: req.status,
      amount: req.amount,
      data: req
    });
  },

  getAllOffers: async (): Promise<LoanOffer[]> => {
    const { data } = await supabase.from('loan_offers').select('*').order('created_at', { ascending: false });
    return data ? data.map((r: any) => r.data) : [];
  },

  saveOffer: async (offer: LoanOffer) => {
    await supabase.from('loan_offers').upsert({
      id: offer.id,
      lender_id: offer.lenderId,
      status: offer.status || 'ACTIVE',
      data: offer
    });
  },

  // --- Chat & Realtime ---

  getChatHistory: async (): Promise<ChatMessage[]> => {
    const { data } = await supabase.from('chats').select('*').order('created_at', { ascending: false }).limit(200);
    return data ? data.map((r: any) => r.data).reverse() : [];
  },

  addChatMessage: async (msg: ChatMessage) => {
    await supabase.from('chats').insert({
      id: msg.id,
      thread_id: msg.threadId,
      sender_id: msg.senderId,
      message: msg.message,
      type: msg.type,
      data: msg
    });
  },

  // --- Disputes ---

  getAllDisputes: async (): Promise<Dispute[]> => {
    const { data } = await supabase.from('disputes').select('*');
    return data ? data.map((r: any) => r.data) : [];
  },

  saveDispute: async (dispute: Dispute) => {
    await supabase.from('disputes').upsert({
      id: dispute.id,
      status: dispute.status,
      data: dispute
    });
  },

  // --- Helpers ---
  
  processDeposit: async (user: UserProfile, amount: number): Promise<UserProfile> => {
    const updatedUser = { ...user, balance: user.balance + amount };
    await PersistenceService.saveUser(updatedUser);
    
    if (updatedUser.balance >= 100 && updatedUser.referredBy) {
      await PersistenceService.completeReferral(updatedUser.referredBy, updatedUser.id);
    }
    return updatedUser;
  },

  completeReferral: async (referrerId: string, refereeId: string) => {
    const { data } = await supabase.from('users').select('*').eq('id', referrerId).single();
    if (data) {
      const profile = data.data as UserProfile;
      const refIdx = profile.referrals.findIndex(r => r.userId === refereeId);
      if (refIdx !== -1 && profile.referrals[refIdx].status === 'PENDING') {
        profile.referrals[refIdx].status = 'COMPLETED';
        profile.referrals[refIdx].earnings = 5;
        profile.reputationScore = Math.min(100, profile.reputationScore + 5);
        await PersistenceService.saveUser(profile);
      }
    }
  },

  // Clear data (local only for session, cannot delete from DB via this button for safety)
  clearAll: (userId: string) => {
    localStorage.clear();
    window.location.reload();
  }
};
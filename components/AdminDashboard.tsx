import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { Button } from './Button';
import { UserProfile, EmployeeProfile, AdminRole, KYCTier, KYCStatus, Dispute, InternalTicket, WaitlistEntry } from '../types';
import { PersistenceService } from '../services/persistence';
import { SecurityService } from '../services/security';
import { ScoreGauge } from './ScoreGauge';
import { AdminChatWidget } from './AdminChatWidget';

// Extend window definition for Tawk.to
declare global {
  interface Window {
    Tawk_API?: any;
  }
}

interface Props {
  currentAdmin: EmployeeProfile;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ currentAdmin, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USERS' | 'WAITLIST' | 'KYC' | 'DISPUTES' | 'TEAM' | 'KNOWLEDGE'>('OVERVIEW');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [internalTickets, setInternalTickets] = useState<InternalTicket[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Waitlist Batch Logic
  const [batchSize, setBatchSize] = useState(10);
  const [isRollingOut, setIsRollingOut] = useState(false);

  // User Management State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Employee Onboarding State
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmpData, setNewEmpData] = useState({ name: '', email: '', role: 'SUPPORT' as AdminRole });

  // Ticket Creation State
  const [newTicket, setNewTicket] = useState({ subject: '', description: '', priority: 'LOW' as 'LOW' | 'MEDIUM' | 'HIGH' });

  useEffect(() => {
    // Load data
    const loadData = async () => {
      try {
        const u = await PersistenceService.getAllUsers();
        setUsers(u || []);
        
        const e = await PersistenceService.getEmployees();
        setEmployees(e || []);
        
        const t = await PersistenceService.getInternalTickets();
        setInternalTickets(t || []);
        
        const d = await PersistenceService.getAllDisputes();
        setDisputes(d || []);

        const w = await PersistenceService.getWaitlist();
        setWaitlist(w || []);
      } catch (err) {
        console.error("Admin dashboard failed to load data", err);
      }
    };
    loadData();

    // Hide Tawk.to when in Admin Mode
    if (window.Tawk_API && window.Tawk_API.hideWidget) {
      window.Tawk_API.hideWidget();
    }
    return () => {
      // Show again when leaving admin mode
      if (window.Tawk_API && window.Tawk_API.showWidget) {
        window.Tawk_API.showWidget();
      }
    };
  }, []);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEmp: EmployeeProfile = {
      id: `emp_${Date.now()}`,
      name: newEmpData.name,
      email: newEmpData.email,
      role: newEmpData.role,
      isActive: true,
      lastLogin: 'Never',
      passwordHash: 'temp123', // Temp password
      passwordLastSet: 0, // Forces immediate reset
      previousPasswords: []
    };
    const updated = await PersistenceService.addEmployee(newEmp);
    setEmployees(updated);
    setShowAddEmployee(false);
    setNewEmpData({ name: '', email: '', role: 'SUPPORT' });
  };

  const handleIssueCertificate = (emp: EmployeeProfile) => {
    if (confirm(`Issue new 1-Year Security Certificate for ${emp.name}? This will invalidate previous keys.`)) {
      const cert = SecurityService.generateCertificate(emp.email);
      const updatedEmp = { ...emp, certificateData: cert };
      // Note: This would be async in real app
      PersistenceService.updateEmployee(updatedEmp).then(updatedList => setEmployees(updatedList));
      
      // Trigger Download
      SecurityService.downloadCertificate(cert);
      alert(`Certificate downloaded for ${emp.name}. They must install this file on their device to log in.`);
    }
  };

  const handleResetPasswordLink = (emp: EmployeeProfile) => {
    alert(`Password reset link sent to ${emp.email}.\n\n(Simulation: Next login will require a password change)`);
    const updatedEmp = { ...emp, passwordLastSet: 0 }; // 0 forces expiry check
    PersistenceService.updateEmployee(updatedEmp).then(updatedList => setEmployees(updatedList));
  };

  const handleFreezeAccount = async (userId: string) => {
    if (confirm("Are you sure you want to freeze this account? All funds will be locked.")) {
      const targetUser = users.find(u => u.id === userId);
      if (targetUser) {
        const updated = { ...targetUser, isFrozen: !targetUser.isFrozen };
        await PersistenceService.saveUser(updated);
        
        setUsers(prev => prev.map(u => u.id === userId ? updated : u));
        if (selectedUser?.id === userId) setSelectedUser(updated);
      }
    }
  };

  const handleAddAdminNote = async (userId: string) => {
    const note = prompt("Enter note for this user account:");
    if (note) {
      const targetUser = users.find(u => u.id === userId);
      if (targetUser) {
         const existing = targetUser.adminNotes ? targetUser.adminNotes + '\n' : '';
         const updated = { ...targetUser, adminNotes: `${existing}[${new Date().toLocaleDateString()} ${currentAdmin.name}]: ${note}` };
         await PersistenceService.saveUser(updated);
         
         setUsers(prev => prev.map(u => u.id === userId ? updated : u));
         if (selectedUser?.id === userId) setSelectedUser(updated);
      }
    }
  };

  // KYC Manual Action
  const handleKYCAction = async (userId: string, action: 'APPROVE' | 'REJECT') => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      const updated = {
        ...targetUser,
        kycStatus: action === 'APPROVE' ? KYCStatus.VERIFIED : KYCStatus.REJECTED,
        kycTier: action === 'APPROVE' ? KYCTier.TIER_2 : targetUser.kycTier, 
        kycLimit: action === 'APPROVE' ? 50000 : targetUser.kycLimit
      };
      await PersistenceService.saveUser(updated);
      
      setUsers(prev => prev.map(u => u.id === userId ? updated : u));
      if (selectedUser?.id === userId) setSelectedUser(updated);
      alert(`KYC ${action === 'APPROVE' ? 'Approved' : 'Rejected'} for User.`);
    }
  };

  // Dispute Action
  const handleResolveDispute = async (disputeId: string, resolution: string) => {
    const dispute = disputes.find(d => d.id === disputeId);
    if (dispute) {
      const updatedDispute = { ...dispute, status: 'RESOLVED' as const, resolution };
      await PersistenceService.saveDispute(updatedDispute);
      setDisputes(prev => prev.map(d => d.id === disputeId ? updatedDispute : d));
    }
  };

  const handleInviteWaitlist = async (id: string) => {
    await PersistenceService.updateWaitlistStatus(id, 'INVITED');
    // Simulation:
    alert("Invitation email sent (simulated). User marked as INVITED.");
    setWaitlist(prev => prev.map(w => w.id === id ? { ...w, status: 'INVITED' } : w));
  };

  const handleBatchRollout = async () => {
    if (confirm(`Are you sure you want to invite the next ${batchSize} users in the queue?`)) {
      setIsRollingOut(true);
      try {
        await PersistenceService.inviteWaitlistBatch(batchSize);
        // Refresh list
        const updated = await PersistenceService.getWaitlist();
        setWaitlist(updated);
        alert(`Successfully rolled out access to ${batchSize} users.`);
      } catch (e) {
        alert("Batch rollout failed.");
      } finally {
        setIsRollingOut(false);
      }
    }
  };

  // Internal Ticket Actions
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const ticket: InternalTicket = {
      id: `tick_${Date.now()}`,
      authorId: currentAdmin.id,
      authorName: currentAdmin.name,
      subject: newTicket.subject,
      description: newTicket.description,
      priority: newTicket.priority,
      status: 'OPEN',
      createdAt: Date.now()
    };
    const updated = await PersistenceService.addInternalTicket(ticket);
    setInternalTickets(updated);
    setNewTicket({ subject: '', description: '', priority: 'LOW' });
  };

  const handleResolveInternalTicket = async (id: string) => {
    const updated = await PersistenceService.resolveInternalTicket(id);
    setInternalTickets(updated);
  };

  const safeUsers = users || []; // Safety fallback
  const filteredUsers = safeUsers.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingKYCUsers = safeUsers.filter(u => u.kycStatus === KYCStatus.PENDING);
  const openDisputes = disputes.filter(d => d.status === 'OPEN');
  const openTickets = internalTickets.filter(t => t.status === 'OPEN');

  return (
    <div className="flex h-screen bg-[#050505] text-zinc-200 font-sans overflow-hidden">
      {/* Internal Chat Widget */}
      <AdminChatWidget currentUser={currentAdmin} isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Admin Sidebar */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-zinc-900 flex flex-col z-50">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <Logo showText={false} isAdmin={true} />
            <div>
              <span className="font-bold text-white tracking-tight">P3 Admin</span>
              <div className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{currentAdmin.role} ACCESS</div>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button 
            onClick={() => setActiveTab('OVERVIEW')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'OVERVIEW' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
          >
            <span>📊</span> Overview
          </button>
          <button 
            onClick={() => setActiveTab('WAITLIST')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${activeTab === 'WAITLIST' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
          >
             <div className="flex items-center gap-3">
              <span>⏳</span> Waitlist Queue
            </div>
            {waitlist.filter(w => w.status === 'PENDING').length > 0 && <span className="bg-[#00e599] text-black text-xs font-bold px-1.5 rounded-full">{waitlist.filter(w => w.status === 'PENDING').length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('USERS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'USERS' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
          >
            <span>👥</span> User Management
          </button>
          
          <button 
            onClick={() => setActiveTab('KYC')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${activeTab === 'KYC' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <span>🪪</span> KYC Queue
            </div>
            {pendingKYCUsers.length > 0 && <span className="bg-amber-500 text-black text-xs font-bold px-1.5 rounded-full">{pendingKYCUsers.length}</span>}
          </button>

          <button 
            onClick={() => setActiveTab('DISPUTES')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${activeTab === 'DISPUTES' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
          >
             <div className="flex items-center gap-3">
              <span>⚖️</span> Alerts & Disputes
            </div>
            {openDisputes.length > 0 && <span className="bg-red-500 text-white text-xs font-bold px-1.5 rounded-full">{openDisputes.length}</span>}
          </button>

          <button 
            onClick={() => setActiveTab('KNOWLEDGE')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${activeTab === 'KNOWLEDGE' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
          >
             <div className="flex items-center gap-3">
              <span>📚</span> Knowledge & Tickets
            </div>
            {openTickets.length > 0 && <span className="bg-blue-500 text-white text-xs font-bold px-1.5 rounded-full">{openTickets.length}</span>}
          </button>

          {currentAdmin.role === 'ADMIN' && (
            <button 
              onClick={() => setActiveTab('TEAM')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'TEAM' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
            >
              <span>🛡️</span> Team & Roles
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-zinc-900">
           <div className="flex items-center gap-3 mb-4 px-2">
             <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white">
               {currentAdmin.name.charAt(0)}
             </div>
             <div className="overflow-hidden">
               <div className="text-sm font-bold text-white truncate">{currentAdmin.name}</div>
               <div className="text-xs text-zinc-500 truncate">{currentAdmin.email}</div>
             </div>
           </div>
           <Button variant="ghost" size="sm" className="w-full justify-start text-red-400 hover:text-red-300" onClick={onLogout}>
             Log Out
           </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>

        {/* Top Bar */}
        <header className="h-16 border-b border-zinc-900 flex items-center justify-between px-8 bg-[#050505]">
          <h1 className="text-lg font-bold text-white">
            {activeTab === 'OVERVIEW' && 'Platform Overview'}
            {activeTab === 'WAITLIST' && 'Beta Waitlist Management'}
            {activeTab === 'USERS' && 'Customer Support'}
            {activeTab === 'KYC' && 'KYC Compliance Queue'}
            {activeTab === 'DISPUTES' && 'Arbitration Center'}
            {activeTab === 'KNOWLEDGE' && 'Employee Knowledge Base'}
            {activeTab === 'TEAM' && 'Employee Onboarding'}
          </h1>
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setIsChatOpen(!isChatOpen)}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${isChatOpen ? 'bg-[#00e599]/10 border-[#00e599]/50 text-[#00e599]' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'}`}
             >
                <div className="relative">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                   <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00e599] rounded-full border-2 border-[#050505]"></span>
                </div>
                <span className="text-xs font-bold">Team Chat</span>
             </button>
             <div className="text-xs text-zinc-500 font-mono">
               System Status: <span className="text-[#00e599]">OPERATIONAL</span> • <span className="text-red-500">ADMIN MODE</span>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                  <div className="text-zinc-500 text-xs uppercase font-bold tracking-wider mb-2">Total Users</div>
                  <div className="text-3xl font-bold text-white">{safeUsers.length}</div>
                </div>
                <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                  <div className="text-zinc-500 text-xs uppercase font-bold tracking-wider mb-2">Verified (Tier 2+)</div>
                  <div className="text-3xl font-bold text-[#00e599]">{safeUsers.filter(u => u.kycTier === KYCTier.TIER_2 || u.kycTier === KYCTier.TIER_3).length}</div>
                </div>
                <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                  <div className="text-zinc-500 text-xs uppercase font-bold tracking-wider mb-2">Waitlist</div>
                  <div className="text-3xl font-bold text-blue-400">{waitlist.filter(w => w.status === 'PENDING').length}</div>
                </div>
                <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                   <div className="text-zinc-500 text-xs uppercase font-bold tracking-wider mb-2">Platform Risk Score</div>
                   <div className="text-3xl font-bold text-amber-500">LOW</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'WAITLIST' && (
            <div className="animate-fade-in">
               <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">Waitlist Queue</h3>
                    <p className="text-xs text-zinc-500">Oldest sign-ups are at the top.</p>
                  </div>
                  <div className="flex items-center gap-3 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                    <span className="text-xs text-zinc-500 font-bold uppercase ml-2">Batch Rollout:</span>
                    <input 
                      type="number" 
                      min="1" 
                      max="1000" 
                      value={batchSize} 
                      onChange={(e) => setBatchSize(parseInt(e.target.value))}
                      className="w-16 bg-black border border-zinc-700 rounded px-2 py-1 text-white text-sm text-center focus:border-[#00e599] outline-none"
                    />
                    <Button size="sm" onClick={handleBatchRollout} isLoading={isRollingOut}>
                      Invite Next {batchSize}
                    </Button>
                  </div>
               </div>

               <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm text-zinc-400">
                   <thead className="bg-black text-white text-xs uppercase tracking-wider">
                     <tr><th className="p-4">Queue #</th><th className="p-4">Date</th><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr>
                   </thead>
                   <tbody>
                     {waitlist.length === 0 ? (
                       <tr><td colSpan={6} className="p-8 text-center text-zinc-500">No users in waitlist.</td></tr>
                     ) : (
                       waitlist.map((w, index) => (
                         <tr key={w.id} className="border-t border-zinc-800 hover:bg-black/40">
                           <td className="p-4 font-mono text-xs text-zinc-600">#{index + 1}</td>
                           <td className="p-4 font-mono text-xs">{new Date(w.created_at).toLocaleDateString()}</td>
                           <td className="p-4 text-white font-bold">{w.name}</td>
                           <td className="p-4">{w.email}</td>
                           <td className="p-4">
                             <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                               w.status === 'ONBOARDED' ? 'bg-green-500/20 text-green-500' :
                               w.status === 'INVITED' ? 'bg-blue-500/20 text-blue-500' :
                               'bg-zinc-800 text-zinc-400'
                             }`}>
                               {w.status}
                             </span>
                           </td>
                           <td className="p-4 text-right">
                             {w.status === 'PENDING' && (
                               <Button size="sm" onClick={() => handleInviteWaitlist(w.id)}>Invite</Button>
                             )}
                           </td>
                         </tr>
                       ))
                     )}
                   </tbody>
                </table>
              </div>
            </div>
          )}

          {(activeTab === 'USERS' || activeTab === 'KYC') && (
             <div className="flex h-full gap-6 animate-fade-in">
                {/* User List */}
                <div className="w-1/3 flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                   <div className="p-4 border-b border-zinc-800">
                     <input 
                       type="text" 
                       placeholder="Search users..." 
                       className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:border-[#00e599] outline-none"
                       value={searchTerm}
                       onChange={e => setSearchTerm(e.target.value)}
                     />
                   </div>
                   <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-zinc-800/50">
                     {(activeTab === 'KYC' ? pendingKYCUsers : filteredUsers).map(u => (
                       <div 
                         key={u.id}
                         onClick={() => setSelectedUser(u)}
                         className={`p-4 cursor-pointer hover:bg-black/50 transition-colors ${selectedUser?.id === u.id ? 'bg-black border-l-2 border-l-[#00e599]' : ''}`}
                       >
                         <div className="flex justify-between items-center">
                           <div className="overflow-hidden pr-2">
                             <div className="font-bold text-white truncate">{u.name}</div>
                             <div className="text-[10px] text-zinc-500 font-mono truncate">{u.id}</div>
                           </div>
                           <div className="text-xs">
                             {u.kycStatus}
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
                {/* User Details */}
                <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-6 overflow-y-auto custom-scrollbar">
                   {selectedUser ? (
                     <div className="space-y-8 animate-fade-in">
                       <div className="flex justify-between items-center">
                          <div className="flex items-center gap-6">
                             <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center border-4 border-zinc-800 relative">
                                <div className="w-20 h-20">
                                   <ScoreGauge score={selectedUser.reputationScore} />
                                </div>
                                {selectedUser.avatarUrl && <img src={selectedUser.avatarUrl} className="absolute inset-0 w-full h-full object-cover rounded-full opacity-50" />}
                             </div>
                             <div>
                               <h2 className="text-3xl font-bold text-white tracking-tight">{selectedUser.name}</h2>
                               <p className="text-zinc-500 font-mono text-xs mb-2">{selectedUser.id}</p>
                               <div className="flex gap-2">
                                  <span className="bg-zinc-800 px-2 py-0.5 rounded text-xs text-zinc-400 border border-zinc-700">{selectedUser.kycTier}</span>
                               </div>
                             </div>
                          </div>
                          <div className="flex gap-2">
                             {(currentAdmin.role === 'RISK_OFFICER' || currentAdmin.role === 'ADMIN') && (
                               <Button 
                                 size="sm" 
                                 variant={selectedUser.isFrozen ? "primary" : "danger"}
                                 className={selectedUser.isFrozen ? "bg-[#00e599] text-black border-none" : "bg-red-900/30 text-red-400 border-red-900"}
                                 onClick={() => handleFreezeAccount(selectedUser.id)}
                               >
                                 {selectedUser.isFrozen ? "Unfreeze Account" : "Freeze Account"}
                               </Button>
                             )}
                          </div>
                       </div>
                       
                       <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden p-4">
                          <div className="flex justify-between items-center mb-4">
                             <h3 className="font-bold text-white text-sm">KYC Status</h3>
                             <div className="flex gap-2">
                                <Button size="sm" className="bg-green-600 hover:bg-green-500 text-white" onClick={() => handleKYCAction(selectedUser.id, 'APPROVE')}>Approve</Button>
                                <Button size="sm" variant="danger" className="bg-red-900 hover:bg-red-800" onClick={() => handleKYCAction(selectedUser.id, 'REJECT')}>Reject</Button>
                             </div>
                          </div>
                          <pre className="text-xs text-zinc-500 overflow-x-auto bg-zinc-900 p-2 rounded">{JSON.stringify(selectedUser.documents, null, 2)}</pre>
                       </div>

                       <div>
                          <div className="flex justify-between items-center mb-2">
                             <h3 className="font-bold text-zinc-500 text-xs uppercase tracking-wide">Admin Notes</h3>
                             <Button size="sm" variant="ghost" onClick={() => handleAddAdminNote(selectedUser.id)}>+ Add Note</Button>
                          </div>
                          <div className="bg-black border border-zinc-800 rounded-lg p-4 min-h-[100px] text-sm text-zinc-400 whitespace-pre-wrap font-mono">
                             {selectedUser.adminNotes || "No notes on file."}
                          </div>
                       </div>
                     </div>
                   ) : (
                     <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                        <p>Select a user to view details.</p>
                     </div>
                   )}
                </div>
             </div>
          )}

          {activeTab === 'DISPUTES' && (
             <div className="space-y-6 animate-fade-in">
                <h3 className="text-xl font-bold text-white mb-6">Open Disputes</h3>
                <div className="grid grid-cols-1 gap-4">
                  {disputes.length === 0 ? (
                    <div className="text-zinc-500 text-center py-10">No active disputes.</div>
                  ) : disputes.map(dispute => (
                     <div key={dispute.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex justify-between items-start">
                        <div>
                           <div className="flex items-center gap-3 mb-2">
                              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${dispute.status === 'OPEN' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>{dispute.status}</span>
                              <span className="text-xs text-zinc-500">Created: {new Date(dispute.createdAt).toLocaleDateString()}</span>
                           </div>
                           <h4 className="text-white font-bold text-lg mb-1">{dispute.reason}</h4>
                           <p className="text-sm text-zinc-400">
                              Reporter: <span className="text-white">{dispute.reporterName}</span> vs Accused: <span className="text-white">{dispute.accusedName}</span>
                           </p>
                        </div>
                        <div className="flex gap-2">
                           {dispute.status === 'OPEN' && (
                              <Button size="sm" onClick={() => handleResolveDispute(dispute.id, 'Resolved by Admin')}>Resolve</Button>
                           )}
                        </div>
                     </div>
                  ))}
                </div>
             </div>
          )}

          {activeTab === 'KNOWLEDGE' && (
            <div className="grid grid-cols-12 gap-6 h-full animate-fade-in">
              <div className="col-span-4 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                 <div className="p-4 border-b border-zinc-800 bg-black/20">
                   <h3 className="font-bold text-white text-sm uppercase tracking-wide">SOPs</h3>
                 </div>
                 <div className="flex-1 p-4 space-y-4 text-zinc-400 text-sm">
                    <p>Standard Operating Procedures are available here.</p>
                 </div>
              </div>
              <div className="col-span-8 flex flex-col gap-6">
                 <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h3 className="font-bold text-white mb-4">Create Ticket</h3>
                    <form onSubmit={handleCreateTicket} className="flex gap-4">
                       <input 
                         required
                         type="text" 
                         placeholder="Subject" 
                         className="flex-1 bg-black border border-zinc-800 rounded p-2 text-white"
                         value={newTicket.subject}
                         onChange={e => setNewTicket({...newTicket, subject: e.target.value})}
                       />
                       <Button type="submit" size="sm">Create</Button>
                    </form>
                 </div>
                 <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden p-4 space-y-2">
                    {internalTickets.map(ticket => (
                       <div key={ticket.id} className="bg-black/40 border border-zinc-800 p-3 rounded flex justify-between">
                          <div>
                             <div className="text-white font-bold">{ticket.subject}</div>
                             <div className="text-xs text-zinc-500">{ticket.status}</div>
                          </div>
                          {ticket.status === 'OPEN' && <Button size="sm" onClick={() => handleResolveInternalTicket(ticket.id)}>Resolve</Button>}
                       </div>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'TEAM' && currentAdmin.role === 'ADMIN' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                 <h2 className="text-xl font-bold text-white">Employee Management</h2>
                 <Button onClick={() => setShowAddEmployee(true)}>+ Onboard Employee</Button>
              </div>
              {showAddEmployee && (
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                   <form onSubmit={handleAddEmployee} className="flex gap-4">
                      <input 
                        type="text" 
                        placeholder="Name" 
                        className="bg-black border border-zinc-800 rounded p-2 text-white"
                        value={newEmpData.name}
                        onChange={e => setNewEmpData({...newEmpData, name: e.target.value})}
                      />
                      <input 
                        type="email" 
                        placeholder="Email" 
                        className="bg-black border border-zinc-800 rounded p-2 text-white"
                        value={newEmpData.email}
                        onChange={e => setNewEmpData({...newEmpData, email: e.target.value})}
                      />
                      <Button type="submit">Create</Button>
                   </form>
                </div>
              )}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm text-zinc-400">
                   <thead className="bg-black text-white">
                     <tr><th className="p-4">Name</th><th className="p-4">Role</th><th className="p-4">Action</th></tr>
                   </thead>
                   <tbody>
                     {employees.map(emp => (
                       <tr key={emp.id} className="border-t border-zinc-800">
                         <td className="p-4">{emp.name}</td>
                         <td className="p-4">{emp.role}</td>
                         <td className="p-4"><Button size="sm" variant="ghost" onClick={() => handleResetPasswordLink(emp)}>Reset PW</Button></td>
                       </tr>
                     ))}
                   </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { Button } from './Button';
import { UserProfile, EmployeeProfile, AdminRole, KYCTier, KYCStatus, Dispute, InternalTicket } from '../types';
import { PersistenceService } from '../services/persistence';
import { SecurityService } from '../services/security';
import { ScoreGauge } from './ScoreGauge';

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

const MOCK_DISPUTES: Dispute[] = [
  { id: 'disp_1', reporterId: 'usr_8821', reporterName: 'Alex Mercer', accusedId: 'usr_9901', accusedName: 'BotNet 3000', reason: 'User is a bot, never replies', status: 'OPEN', createdAt: Date.now() - 86400000 },
  { id: 'disp_2', reporterId: 'usr_1234', reporterName: 'Sarah Connor', accusedId: 'usr_5555', accusedName: 'Skynet Inc', reason: 'Loan terms were changed after agreement', status: 'RESOLVED', createdAt: Date.now() - 172800000, resolution: 'Loan voided' }
];

export const AdminDashboard: React.FC<Props> = ({ currentAdmin, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USERS' | 'KYC' | 'DISPUTES' | 'TEAM' | 'KNOWLEDGE'>('OVERVIEW');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>(MOCK_DISPUTES);
  const [internalTickets, setInternalTickets] = useState<InternalTicket[]>([]);
  
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
    setUsers(PersistenceService.getAllUsers());
    setEmployees(PersistenceService.getEmployees());
    setInternalTickets(PersistenceService.getInternalTickets());

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

  const handleAddEmployee = (e: React.FormEvent) => {
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
    const updated = PersistenceService.addEmployee(newEmp);
    setEmployees(updated);
    setShowAddEmployee(false);
    setNewEmpData({ name: '', email: '', role: 'SUPPORT' });
  };

  const handleIssueCertificate = (emp: EmployeeProfile) => {
    if (confirm(`Issue new 1-Year Security Certificate for ${emp.name}? This will invalidate previous keys.`)) {
      const cert = SecurityService.generateCertificate(emp.email);
      const updatedEmp = { ...emp, certificateData: cert };
      const updatedList = PersistenceService.updateEmployee(updatedEmp);
      setEmployees(updatedList);
      
      // Trigger Download
      SecurityService.downloadCertificate(cert);
      alert(`Certificate downloaded for ${emp.name}. They must install this file on their device to log in.`);
    }
  };

  const handleResetPasswordLink = (emp: EmployeeProfile) => {
    // In a real app, this sends an email. Here we simulate it.
    alert(`Password reset link sent to ${emp.email}.\n\n(Simulation: Next login will require a password change)`);
    const updatedEmp = { ...emp, passwordLastSet: 0 }; // 0 forces expiry check
    const updatedList = PersistenceService.updateEmployee(updatedEmp);
    setEmployees(updatedList);
  };

  const handleFreezeAccount = (userId: string) => {
    if (confirm("Are you sure you want to freeze this account? All funds will be locked.")) {
      const updatedList = users.map(u => {
        if (u.id === userId) {
          const updated = { ...u, isFrozen: !u.isFrozen };
          PersistenceService.saveUser(updated);
          if (selectedUser?.id === userId) setSelectedUser(updated);
          return updated;
        }
        return u;
      });
      setUsers(updatedList);
    }
  };

  const handleAddAdminNote = (userId: string) => {
    const note = prompt("Enter note for this user account:");
    if (note) {
      const updatedList = users.map(u => {
        if (u.id === userId) {
           const existing = u.adminNotes ? u.adminNotes + '\n' : '';
           const updated = { ...u, adminNotes: `${existing}[${new Date().toLocaleDateString()} ${currentAdmin.name}]: ${note}` };
           PersistenceService.saveUser(updated);
           if (selectedUser?.id === userId) setSelectedUser(updated);
           return updated;
        }
        return u;
      });
      setUsers(updatedList);
    }
  };

  // KYC Manual Action
  const handleKYCAction = (userId: string, action: 'APPROVE' | 'REJECT') => {
    const updatedList = users.map(u => {
      if (u.id === userId) {
        const updated = {
          ...u,
          kycStatus: action === 'APPROVE' ? KYCStatus.VERIFIED : KYCStatus.REJECTED,
          kycTier: action === 'APPROVE' ? KYCTier.TIER_2 : u.kycTier, // Bump to Tier 2 on manual approval
          kycLimit: action === 'APPROVE' ? 50000 : u.kycLimit
        };
        PersistenceService.saveUser(updated);
        if (selectedUser?.id === userId) setSelectedUser(updated);
        return updated;
      }
      return u;
    });
    setUsers(updatedList);
    alert(`KYC ${action === 'APPROVE' ? 'Approved' : 'Rejected'} for User.`);
  };

  // Dispute Action
  const handleResolveDispute = (disputeId: string, resolution: string) => {
    setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status: 'RESOLVED', resolution } : d));
  };

  // Internal Ticket Actions
  const handleCreateTicket = (e: React.FormEvent) => {
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
    const updated = PersistenceService.addInternalTicket(ticket);
    setInternalTickets(updated);
    setNewTicket({ subject: '', description: '', priority: 'LOW' });
  };

  const handleResolveInternalTicket = (id: string) => {
    const updated = PersistenceService.resolveInternalTicket(id);
    setInternalTickets(updated);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingKYCUsers = users.filter(u => u.kycStatus === KYCStatus.PENDING);
  const openDisputes = disputes.filter(d => d.status === 'OPEN');
  const openTickets = internalTickets.filter(t => t.status === 'OPEN');

  return (
    <div className="flex h-screen bg-[#050505] text-zinc-200 font-sans overflow-hidden">
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
            {activeTab === 'USERS' && 'Customer Support'}
            {activeTab === 'KYC' && 'KYC Compliance Queue'}
            {activeTab === 'DISPUTES' && 'Arbitration Center'}
            {activeTab === 'KNOWLEDGE' && 'Employee Knowledge Base'}
            {activeTab === 'TEAM' && 'Employee Onboarding'}
          </h1>
          <div className="text-xs text-zinc-500 font-mono">
            System Status: <span className="text-[#00e599]">OPERATIONAL</span> • <span className="text-red-500">ADMIN MODE</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                  <div className="text-zinc-500 text-xs uppercase font-bold tracking-wider mb-2">Total Users</div>
                  <div className="text-3xl font-bold text-white">{users.length}</div>
                </div>
                <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                  <div className="text-zinc-500 text-xs uppercase font-bold tracking-wider mb-2">Verified (Tier 2+)</div>
                  <div className="text-3xl font-bold text-[#00e599]">{users.filter(u => u.kycTier === KYCTier.TIER_2 || u.kycTier === KYCTier.TIER_3).length}</div>
                </div>
                <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                  <div className="text-zinc-500 text-xs uppercase font-bold tracking-wider mb-2">Frozen Accounts</div>
                  <div className="text-3xl font-bold text-red-500">{users.filter(u => u.isFrozen).length}</div>
                </div>
                <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                   <div className="text-zinc-500 text-xs uppercase font-bold tracking-wider mb-2">Platform Risk Score</div>
                   <div className="text-3xl font-bold text-amber-500">LOW</div>
                </div>
              </div>
            </div>
          )}

          {/* USERS / KYC TABS - Shared Layout Logic */}
          {(activeTab === 'USERS' || activeTab === 'KYC') && (
             <div className="flex h-full gap-6 animate-fade-in">
                {/* User List */}
                <div className="w-1/3 flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                   <div className="p-4 border-b border-zinc-800">
                     <input 
                       type="text" 
                       placeholder="Search users by name, email, or ID..." 
                       className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:border-[#00e599] outline-none"
                       value={searchTerm}
                       onChange={e => setSearchTerm(e.target.value)}
                     />
                     <div className="flex gap-4 mt-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#00e599]"></div> Active</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Review</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Frozen</div>
                     </div>
                   </div>
                   <div className="bg-black/40 px-4 py-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex justify-between">
                      <span>User</span>
                      <div className="flex gap-8">
                         <span className="w-12 text-left">Status</span>
                         <span className="w-12 text-right">Rep</span>
                         <span className="w-12 text-right">KYC</span>
                         <span className="w-16 text-right">Balance</span>
                      </div>
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
                           <div className="flex gap-4 text-xs">
                             <div className="w-16 flex justify-start">
                                {u.isFrozen ? (
                                    <span className="text-[10px] border border-red-900 bg-red-900/20 text-red-500 px-1 rounded">FROZEN</span>
                                ) : u.kycStatus === 'PENDING' ? (
                                    <span className="text-[10px] border border-amber-900 bg-amber-900/20 text-amber-500 px-1 rounded">UNDER_REVIEW</span>
                                ) : (
                                    <span className="text-[10px] border border-green-900 bg-green-900/20 text-green-500 px-1 rounded">ACTIVE</span>
                                )}
                             </div>
                             <div className="w-12 text-right">
                               <span className={`flex items-center justify-end gap-1 ${u.reputationScore > 70 ? 'text-[#00e599]' : u.reputationScore < 40 ? 'text-red-500' : 'text-amber-500'}`}>
                                 <span className="w-1.5 h-1.5 rounded-full bg-current"></span> {u.reputationScore}
                               </span>
                             </div>
                             <div className="w-12 text-right text-[10px] font-mono text-zinc-400">
                                {u.kycStatus === 'VERIFIED' ? 'VERIFIED' : u.kycStatus === 'PENDING' ? 'PENDING' : 'UNVERIFIED'}
                             </div>
                             <div className="w-16 text-right font-mono text-white">
                               ${u.balance.toLocaleString()}
                             </div>
                           </div>
                         </div>
                       </div>
                     ))}
                     {activeTab === 'KYC' && pendingKYCUsers.length === 0 && (
                        <div className="p-8 text-center text-zinc-500 text-sm">No pending KYC applications.</div>
                     )}
                   </div>
                </div>

                {/* User Details Panel */}
                <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-6 overflow-y-auto custom-scrollbar">
                   {selectedUser ? (
                     <div className="space-y-8 animate-fade-in">
                       
                       {/* Header Profile */}
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
                                  <span className="bg-zinc-800 px-2 py-0.5 rounded text-xs text-zinc-400 border border-zinc-700">{selectedUser.employmentStatus}</span>
                               </div>
                             </div>
                          </div>
                          
                          <div className="flex gap-2">
                             <Button size="sm" variant="outline" className="text-xs">View Logs</Button>
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
                       
                       {/* KYC Review Section (Only visible if Pending or if manually checking) */}
                       <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden">
                          <div className="bg-zinc-900/50 p-4 border-b border-zinc-800 flex justify-between items-center">
                             <h3 className="font-bold text-white text-sm uppercase tracking-wide">KYC Review</h3>
                             <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-400">{selectedUser.kycTier}</span>
                          </div>
                          <div className="p-4 grid grid-cols-2 gap-8">
                             <div>
                                <div className="flex justify-between text-sm py-2 border-b border-zinc-800">
                                   <span className="text-zinc-500">Document Type</span>
                                   <span className="text-white">{selectedUser.documents?.idType || 'None'}</span>
                                </div>
                                <div className="flex justify-between text-sm py-2 border-b border-zinc-800">
                                   <span className="text-zinc-500">Face Match</span>
                                   <span className="text-[#00e599] font-bold">98.5% Confidence</span>
                                </div>
                                <div className="flex justify-between text-sm py-2 border-b border-zinc-800">
                                   <span className="text-zinc-500">Watchlist Hit</span>
                                   <span className="text-white">None</span>
                                </div>
                             </div>
                             <div className="flex flex-col gap-2 justify-center">
                                {selectedUser.documents?.idFile && (
                                   <div className="bg-zinc-900 p-2 rounded text-xs text-zinc-400 flex items-center gap-2">
                                     <span>📄</span> ID Document Uploaded
                                   </div>
                                )}
                                {selectedUser.documents?.faceFile && (
                                   <div className="bg-zinc-900 p-2 rounded text-xs text-zinc-400 flex items-center gap-2">
                                     <span>🤳</span> Face Scan Uploaded
                                   </div>
                                )}
                                <div className="flex gap-2 mt-2">
                                   <Button 
                                      size="sm" 
                                      className="flex-1 bg-green-600 hover:bg-green-500 text-white border-none"
                                      onClick={() => handleKYCAction(selectedUser.id, 'APPROVE')}
                                    >
                                      Approve
                                   </Button>
                                   <Button 
                                      size="sm" 
                                      variant="danger" 
                                      className="flex-1 bg-red-900 hover:bg-red-800 border-none"
                                      onClick={() => handleKYCAction(selectedUser.id, 'REJECT')}
                                    >
                                      Reject
                                   </Button>
                                </div>
                             </div>
                          </div>
                       </div>

                       {/* Admin Notes */}
                       <div>
                          <div className="flex justify-between items-center mb-2">
                             <h3 className="font-bold text-zinc-500 text-xs uppercase tracking-wide">AI Risk Narrative</h3>
                          </div>
                          <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-4 text-sm text-zinc-400 italic">
                             "{selectedUser.riskAnalysis || "No risk analysis available."}"
                          </div>
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
                        <span className="text-4xl mb-4 opacity-20">
                           <Logo showText={false} isAdmin={true} />
                        </span>
                        <p>Select a user to view details, manage KYC, or freeze assets.</p>
                     </div>
                   )}
                </div>
             </div>
          )}

          {/* DISPUTES TAB */}
          {activeTab === 'DISPUTES' && (
             <div className="space-y-6 animate-fade-in">
                <h3 className="text-xl font-bold text-white mb-6">Open Disputes</h3>
                <div className="grid grid-cols-1 gap-4">
                  {disputes.map(dispute => (
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
                           <Button size="sm" variant="outline">View Evidence</Button>
                           {dispute.status === 'OPEN' && (
                              <Button size="sm" onClick={() => handleResolveDispute(dispute.id, 'Resolved by Admin')}>Resolve</Button>
                           )}
                        </div>
                     </div>
                  ))}
                </div>
             </div>
          )}

          {/* KNOWLEDGE & TICKETS TAB */}
          {activeTab === 'KNOWLEDGE' && (
            <div className="grid grid-cols-12 gap-6 h-full animate-fade-in">
              
              {/* LEFT: SOPs */}
              <div className="col-span-4 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                 <div className="p-4 border-b border-zinc-800 bg-black/20">
                   <h3 className="font-bold text-white text-sm uppercase tracking-wide">Standard Operating Procedures</h3>
                 </div>
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                    <div className="bg-black/40 border border-zinc-800 p-4 rounded-lg">
                       <h4 className="text-white font-bold mb-2">1. KYC Verification</h4>
                       <p className="text-xs text-zinc-400 leading-relaxed">
                         Check Govt ID expiration date. Ensure face match confidence is &gt;90%. For Tier 3, request bank statements proving 3 months of income.
                       </p>
                    </div>
                    <div className="bg-black/40 border border-zinc-800 p-4 rounded-lg">
                       <h4 className="text-white font-bold mb-2">2. Handling Disputes</h4>
                       <p className="text-xs text-zinc-400 leading-relaxed">
                         Review transaction hash on Etherscan first. If funds moved but platform status didn't update, manually reconcile. If user is unresponsive for 48h, default judgment to reporter.
                       </p>
                    </div>
                    <div className="bg-black/40 border border-zinc-800 p-4 rounded-lg">
                       <h4 className="text-white font-bold mb-2">3. Account Freezing</h4>
                       <p className="text-xs text-zinc-400 leading-relaxed text-red-300">
                         <strong>CRITICAL:</strong> Only freeze accounts with explicit evidence of fraud, money laundering, or terrorist financing. Requires Risk Officer approval for &gt;24h freezes.
                       </p>
                    </div>
                 </div>
              </div>

              {/* RIGHT: Escalation Tickets */}
              <div className="col-span-8 flex flex-col gap-6">
                 {/* Create Ticket */}
                 <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h3 className="font-bold text-white mb-4">Internal Q&A / Escalation Desk</h3>
                    <form onSubmit={handleCreateTicket} className="flex gap-4 items-start">
                       <div className="flex-1 space-y-3">
                          <input 
                            required
                            type="text" 
                            placeholder="Subject / Question" 
                            className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white outline-none focus:border-[#00e599] text-sm"
                            value={newTicket.subject}
                            onChange={e => setNewTicket({...newTicket, subject: e.target.value})}
                          />
                          <textarea 
                            required
                            placeholder="Describe the issue or question..." 
                            className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white outline-none focus:border-[#00e599] text-sm min-h-[60px]"
                            value={newTicket.description}
                            onChange={e => setNewTicket({...newTicket, description: e.target.value})}
                          />
                       </div>
                       <div className="w-32 space-y-3">
                          <select 
                            className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white outline-none focus:border-[#00e599] text-sm"
                            value={newTicket.priority}
                            onChange={e => setNewTicket({...newTicket, priority: e.target.value as any})}
                          >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                          </select>
                          <Button type="submit" className="w-full text-xs" size="sm">Create Ticket</Button>
                       </div>
                    </form>
                 </div>

                 {/* Ticket List */}
                 <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-zinc-800 bg-black/20 flex justify-between">
                       <h3 className="font-bold text-white text-sm uppercase tracking-wide">Active Tickets</h3>
                       <span className="text-xs text-zinc-500">{internalTickets.length} Total</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                       {internalTickets.length === 0 ? (
                         <div className="text-center text-zinc-600 py-10">No active tickets.</div>
                       ) : (
                         internalTickets.map(ticket => (
                           <div key={ticket.id} className="bg-black/40 border border-zinc-800 rounded-lg p-4 flex justify-between items-start hover:border-zinc-700 transition-colors">
                              <div className="flex-1">
                                 <div className="flex items-center gap-3 mb-1">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${ticket.priority === 'HIGH' ? 'bg-red-500/20 text-red-500' : ticket.priority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                      {ticket.priority}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${ticket.status === 'OPEN' ? 'bg-green-500/20 text-green-500' : 'bg-zinc-700 text-zinc-400'}`}>
                                      {ticket.status}
                                    </span>
                                    <span className="text-[10px] text-zinc-500">
                                      {new Date(ticket.createdAt).toLocaleString()} by {ticket.authorName}
                                    </span>
                                 </div>
                                 <h4 className="text-white font-bold">{ticket.subject}</h4>
                                 <p className="text-sm text-zinc-400 mt-1">{ticket.description}</p>
                              </div>
                              {ticket.status === 'OPEN' && (
                                <Button size="sm" variant="outline" className="ml-4 h-8 text-xs" onClick={() => handleResolveInternalTicket(ticket.id)}>
                                  Resolve
                                </Button>
                              )}
                           </div>
                         ))
                       )}
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* TEAM TAB (C-Suite Only) */}
          {activeTab === 'TEAM' && currentAdmin.role === 'ADMIN' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                 <h2 className="text-xl font-bold text-white">Employee Management</h2>
                 <Button onClick={() => setShowAddEmployee(true)}>+ Onboard Employee</Button>
              </div>

              {showAddEmployee && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-lg">
                  <h3 className="font-bold text-white mb-4">New Employee Details</h3>
                  <form onSubmit={handleAddEmployee} className="space-y-4">
                     <div>
                       <label className="text-xs font-bold text-zinc-500 uppercase">Full Name</label>
                       <input 
                         required
                         type="text" 
                         className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white outline-none focus:border-[#00e599]"
                         value={newEmpData.name}
                         onChange={e => setNewEmpData({...newEmpData, name: e.target.value})}
                       />
                     </div>
                     <div>
                       <label className="text-xs font-bold text-zinc-500 uppercase">Corporate Email</label>
                       <input 
                         required
                         type="email" 
                         className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white outline-none focus:border-[#00e599]"
                         value={newEmpData.email}
                         onChange={e => setNewEmpData({...newEmpData, email: e.target.value})}
                       />
                     </div>
                     <div>
                       <label className="text-xs font-bold text-zinc-500 uppercase">Role Permission</label>
                       <select 
                         className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white outline-none focus:border-[#00e599]"
                         value={newEmpData.role}
                         onChange={e => setNewEmpData({...newEmpData, role: e.target.value as AdminRole})}
                       >
                         <option value="SUPPORT">Support (Read Only + Reset)</option>
                         <option value="RISK_OFFICER">Risk Officer (Freeze + Audit)</option>
                         <option value="ADMIN">Admin (C-Suite / Full Access)</option>
                       </select>
                     </div>
                     <div className="flex gap-3 pt-2">
                       <Button type="button" variant="ghost" onClick={() => setShowAddEmployee(false)}>Cancel</Button>
                       <Button type="submit">Create Account</Button>
                     </div>
                  </form>
                </div>
              )}

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                   <thead className="bg-black border-b border-zinc-800 text-zinc-500">
                     <tr>
                       <th className="p-4 uppercase text-xs font-bold tracking-wider">Name</th>
                       <th className="p-4 uppercase text-xs font-bold tracking-wider">Role</th>
                       <th className="p-4 uppercase text-xs font-bold tracking-wider">Security</th>
                       <th className="p-4 uppercase text-xs font-bold tracking-wider">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-zinc-800">
                     {employees.map(emp => (
                       <tr key={emp.id} className="hover:bg-black/50">
                         <td className="p-4 font-bold text-white">{emp.name}</td>
                         <td className="p-4">
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${emp.role === 'ADMIN' ? 'bg-[#00e599]/20 text-[#00e599]' : emp.role === 'RISK_OFFICER' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'}`}>
                             {emp.role.replace('_', ' ')}
                           </span>
                         </td>
                         <td className="p-4">
                           <div className="flex flex-col gap-1">
                             <div className="text-[10px] text-zinc-500 uppercase">
                               Certificate: {emp.certificateData ? <span className="text-[#00e599]">Active</span> : <span className="text-zinc-600">Legacy</span>}
                             </div>
                             <div className="text-[10px] text-zinc-500 uppercase">
                               Password Age: {Math.floor((Date.now() - emp.passwordLastSet) / (1000 * 60 * 60 * 24))} Days
                             </div>
                           </div>
                         </td>
                         <td className="p-4 flex gap-2">
                           <Button size="sm" variant="ghost" onClick={() => handleResetPasswordLink(emp)} className="text-xs text-red-400">
                             Reset Pw
                           </Button>
                         </td>
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
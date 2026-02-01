import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { Button } from './Button';
import { UserProfile, EmployeeProfile, AdminRole, KYCTier } from '../types';
import { PersistenceService } from '../services/persistence';
import { SecurityService } from '../services/security';
import { ScoreGauge } from './ScoreGauge';

interface Props {
  currentAdmin: EmployeeProfile;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ currentAdmin, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USERS' | 'TEAM'>('OVERVIEW');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  
  // User Management State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Employee Onboarding State
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmpData, setNewEmpData] = useState({ name: '', email: '', role: 'SUPPORT' as AdminRole });

  useEffect(() => {
    // Load data
    setUsers(PersistenceService.getAllUsers());
    setEmployees(PersistenceService.getEmployees());
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

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#050505] text-zinc-200 font-sans overflow-hidden">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-zinc-900 flex flex-col z-50">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <Logo showText={false} />
            <div>
              <span className="font-bold text-white tracking-tight">P3 Admin</span>
              <div className="text-[10px] text-[#00e599] font-bold uppercase tracking-wider">{currentAdmin.role} ACCESS</div>
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
            {activeTab === 'USERS' && 'Customer Support & Risk Console'}
            {activeTab === 'TEAM' && 'Employee Onboarding'}
          </h1>
          <div className="text-xs text-zinc-500 font-mono">
            System Status: <span className="text-[#00e599]">OPERATIONAL</span>
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

          {/* USERS TAB */}
          {activeTab === 'USERS' && (
             <div className="flex h-full gap-6 animate-fade-in">
                {/* User List */}
                <div className="w-1/3 flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                   <div className="p-4 border-b border-zinc-800">
                     <input 
                       type="text" 
                       placeholder="Search by name or ID..." 
                       className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:border-[#00e599] outline-none"
                       value={searchTerm}
                       onChange={e => setSearchTerm(e.target.value)}
                     />
                   </div>
                   <div className="flex-1 overflow-y-auto custom-scrollbar">
                     {filteredUsers.map(u => (
                       <div 
                         key={u.id}
                         onClick={() => setSelectedUser(u)}
                         className={`p-4 border-b border-zinc-800 cursor-pointer hover:bg-black/50 transition-colors ${selectedUser?.id === u.id ? 'bg-black border-l-2 border-l-[#00e599]' : ''}`}
                       >
                         <div className="flex justify-between items-start">
                           <div>
                             <div className="font-bold text-white">{u.name}</div>
                             <div className="text-xs text-zinc-500 font-mono">{u.id}</div>
                           </div>
                           {u.isFrozen && <span className="bg-red-500/20 text-red-500 text-[10px] px-2 py-0.5 rounded font-bold">FROZEN</span>}
                         </div>
                       </div>
                     ))}
                   </div>
                </div>

                {/* User Details Panel */}
                <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-6 overflow-y-auto custom-scrollbar">
                   {selectedUser ? (
                     <div className="space-y-8">
                       <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                             <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center border border-zinc-800">
                               <div className="w-12 h-12">
                                  <ScoreGauge score={selectedUser.reputationScore} />
                               </div>
                             </div>
                             <div>
                               <h2 className="text-2xl font-bold text-white">{selectedUser.name}</h2>
                               <div className="flex gap-2 mt-1">
                                  <span className="bg-zinc-800 px-2 py-0.5 rounded text-xs text-zinc-400">{selectedUser.kycTier}</span>
                                  <span className="bg-zinc-800 px-2 py-0.5 rounded text-xs text-zinc-400">{selectedUser.employmentStatus}</span>
                               </div>
                             </div>
                          </div>
                          <div className="flex gap-2">
                             {(currentAdmin.role === 'RISK_OFFICER' || currentAdmin.role === 'ADMIN') && (
                               <Button 
                                 size="sm" 
                                 variant={selectedUser.isFrozen ? "primary" : "danger"}
                                 onClick={() => handleFreezeAccount(selectedUser.id)}
                               >
                                 {selectedUser.isFrozen ? "Unfreeze Account" : "Freeze Account"}
                               </Button>
                             )}
                          </div>
                       </div>
                       
                       {/* Admin Notes */}
                       <div>
                          <div className="flex justify-between items-center mb-2">
                             <h3 className="font-bold text-white">Admin Notes</h3>
                             <Button size="sm" variant="ghost" onClick={() => handleAddAdminNote(selectedUser.id)}>+ Add Note</Button>
                          </div>
                          <div className="bg-black border border-zinc-800 rounded-lg p-4 min-h-[100px] text-sm text-zinc-400 whitespace-pre-wrap font-mono">
                             {selectedUser.adminNotes || "No notes on file."}
                          </div>
                       </div>
                     </div>
                   ) : (
                     <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                        <span className="text-4xl mb-4">👤</span>
                        <p>Select a user to view details.</p>
                     </div>
                   )}
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
                               Certificate: {emp.certificateData ? <span className="text-[#00e599]">Active</span> : <span className="text-red-500">Missing</span>}
                             </div>
                             <div className="text-[10px] text-zinc-500 uppercase">
                               Password Age: {Math.floor((Date.now() - emp.passwordLastSet) / (1000 * 60 * 60 * 24))} Days
                             </div>
                           </div>
                         </td>
                         <td className="p-4 flex gap-2">
                           <Button size="sm" variant="outline" onClick={() => handleIssueCertificate(emp)} className="text-xs">
                             Issue Key
                           </Button>
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
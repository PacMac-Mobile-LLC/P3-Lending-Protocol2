import React, { useState } from 'react';
import { Button } from './Button';
import { Logo } from './Logo';

interface Props {
  email: string;
  onLogin: (password: string) => void;
  onResetPassword: (newPassword: string) => void;
  onCancel: () => void;
}

export const AdminLoginModal: React.FC<Props> = ({ email, onLogin, onResetPassword, onCancel }) => {
  const [password, setPassword] = useState('');
  const [view, setView] = useState<'LOGIN' | 'RESET' | 'SETUP_PASSWORD' | 'SETUP_2FA'>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);
  
  // Setup state
  const [newPassword, setNewPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  const handleSendResetLink = async () => {
    setIsLoading(true);
    // Simulate sending email
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    // Move to password setup first
    setView('SETUP_PASSWORD');
  };

  const handlePasswordNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }
    setView('SETUP_2FA');
  };

  const handleVerifyAndComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length !== 6) {
      alert("Please enter a valid 6-digit code.");
      return;
    }
    
    setIsLoading(true);
    // Simulate verifying the TOTP code with backend
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    // Success: Set password and log in
    onResetPassword(newPassword);
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-[#0a0a0a] border border-red-900/30 rounded-2xl max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.1)] overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>

        <div className="p-8 relative z-10 text-center">
          <div className="flex justify-center mb-6">
            <Logo isAdmin={true} />
          </div>

          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Admin Console Access</h2>
          <p className="text-sm text-zinc-400 mb-6">
            <span className="font-mono text-red-400">{email}</span>
          </p>

          {view === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <input 
                  type="password" 
                  placeholder="Enter Password"
                  className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white focus:border-red-500 outline-none transition-colors"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoFocus
                />
              </div>
              <Button variant="danger" className="w-full bg-red-600 hover:bg-red-500 text-white border-none">
                Authenticate
              </Button>
              <div className="mt-4">
                <button 
                  type="button" 
                  onClick={() => setView('RESET')}
                  className="text-xs text-zinc-500 hover:text-white underline"
                >
                  Forgot Password / First Time Login?
                </button>
              </div>
            </form>
          )}

          {view === 'RESET' && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">
                We will send a security link to <strong>{email}</strong> to initiate the secure setup process.
              </p>
              <Button 
                onClick={handleSendResetLink} 
                isLoading={isLoading}
                className="w-full bg-zinc-800 hover:bg-zinc-700"
              >
                Send Reset Link
              </Button>
              <button 
                onClick={() => setView('LOGIN')}
                className="text-xs text-zinc-500 hover:text-white"
              >
                Back to Login
              </button>
            </div>
          )}

          {view === 'SETUP_PASSWORD' && (
            <form onSubmit={handlePasswordNext} className="space-y-4 animate-fade-in">
               <div className="bg-green-900/20 p-3 rounded-lg border border-green-900/50 mb-4">
                 <p className="text-xs text-green-400">✓ Identity Verified via Email Link</p>
               </div>
               <div className="text-left">
                 <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Step 1: Set Password</label>
                 <input 
                    type="password" 
                    placeholder="Create New Password"
                    className="w-full mt-2 bg-black border border-zinc-800 rounded-xl p-3 text-white focus:border-red-500 outline-none transition-colors"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    autoFocus
                  />
                  <p className="text-[10px] text-zinc-600 mt-2 ml-1">Must be at least 8 characters.</p>
               </div>
                
                <Button 
                  type="submit"
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border-none"
                >
                  Next: Setup 2FA →
                </Button>
            </form>
          )}

          {view === 'SETUP_2FA' && (
            <form onSubmit={handleVerifyAndComplete} className="space-y-6 animate-fade-in">
               <div className="text-left">
                 <label className="text-xs font-bold text-zinc-500 uppercase ml-1 block mb-3">Step 2: Google Authenticator</label>
                 
                 <div className="bg-white p-2 rounded-xl mx-auto w-fit mb-4">
                   {/* Mock QR Code for P3 Admin */}
                   <img 
                     src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/P3%20Admin:${email}?secret=JBSWY3DPEHPK3PXP&issuer=P3Lending`} 
                     alt="2FA QR Code" 
                     className="w-32 h-32"
                   />
                 </div>
                 
                 <p className="text-xs text-zinc-400 text-center mb-4">
                   Scan with Google Authenticator or Authy.<br/>
                   Secret Key: <span className="font-mono text-white bg-zinc-800 px-1 rounded">JBSW Y3DP EHPK 3PXP</span>
                 </p>

                 <input 
                    type="text" 
                    maxLength={6}
                    placeholder="Enter 6-digit Code"
                    className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white focus:border-red-500 outline-none transition-colors text-center font-mono tracking-[0.5em] text-lg"
                    value={totpCode}
                    onChange={e => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    autoFocus
                  />
               </div>
                
                <Button 
                  type="submit"
                  variant="danger" 
                  className="w-full bg-red-600 hover:bg-red-500 text-white border-none"
                  isLoading={isLoading}
                >
                  Verify & Complete Setup
                </Button>
            </form>
          )}

          <div className="mt-6 border-t border-zinc-900 pt-4">
            <Button variant="ghost" onClick={onCancel} className="w-full text-zinc-500 hover:text-white text-xs">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
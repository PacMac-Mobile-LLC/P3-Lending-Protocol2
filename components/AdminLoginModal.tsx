import React, { useState } from 'react';
import { Button } from './Button';
import { Logo } from './Logo';

interface Props {
  email: string;
  onLogin: (password: string) => void;
  onCancel: () => void;
}

export const AdminLoginModal: React.FC<Props> = ({ email, onLogin, onCancel }) => {
  const [password, setPassword] = useState('');
  const [view, setView] = useState<'LOGIN' | 'RESET' | 'NEW_PASSWORD'>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);
  
  // New password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  const handleSendResetLink = async () => {
    setIsLoading(true);
    // Simulate sending email
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    // For demo purposes, we move straight to "New Password" assuming they clicked the link in email
    setView('NEW_PASSWORD');
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In a real app, this would verify a token and update backend.
    // Here we just log them in with the new password immediately for the demo.
    setIsLoading(false);
    onLogin(newPassword);
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
                  Forgot Password?
                </button>
              </div>
            </form>
          )}

          {view === 'RESET' && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">
                We will send a password reset link to <strong>{email}</strong>.
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

          {view === 'NEW_PASSWORD' && (
            <form onSubmit={handleSetNewPassword} className="space-y-4">
               <div className="bg-green-900/20 p-3 rounded-lg border border-green-900/50 mb-4">
                 <p className="text-xs text-green-400">✓ Email verified via simulated link</p>
               </div>
               <input 
                  type="password" 
                  placeholder="New Password"
                  className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white focus:border-red-500 outline-none transition-colors"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                <input 
                  type="password" 
                  placeholder="Confirm Password"
                  className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white focus:border-red-500 outline-none transition-colors"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
                <Button 
                  type="submit"
                  variant="danger" 
                  className="w-full bg-red-600 hover:bg-red-500 text-white border-none"
                  isLoading={isLoading}
                >
                  Set Password & Login
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
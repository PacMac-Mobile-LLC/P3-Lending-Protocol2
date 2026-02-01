
import React, { useState } from 'react';
import { Button } from './Button';
import { SecurityService } from '../services/security';

interface Props {
  email: string;
  onCertificateUpload: (fileContent: string) => void;
  onCancel: () => void;
}

export const AdminLoginModal: React.FC<Props> = ({ email, onCertificateUpload, onCancel }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (file.type !== "application/json" && !file.name.endsWith('.p3key')) {
      alert("Invalid file type. Please upload a .p3key or .json certificate file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        onCertificateUpload(text);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadMasterKey = () => {
    const cert = SecurityService.getMasterCertificate();
    SecurityService.downloadCertificate(cert);
  };

  const isSuperUser = email.toLowerCase() === 'admin@p3lending.space';

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-[#0a0a0a] border border-[#00e599]/30 rounded-2xl max-w-md w-full shadow-[0_0_50px_rgba(0,229,153,0.1)] overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>

        <div className="p-8 relative z-10 text-center">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl mx-auto mb-6 flex items-center justify-center border border-[#00e599] shadow-[0_0_15px_rgba(0,229,153,0.2)]">
             <svg className="w-8 h-8 text-[#00e599]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>

          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Security Check Required</h2>
          <p className="text-sm text-zinc-400 mb-6">
            Admin access for <span className="text-[#00e599] font-mono">{email}</span> requires a valid digital key.
          </p>

          <div 
            className={`border-2 border-dashed rounded-xl p-8 mb-6 transition-all ${dragActive ? 'border-[#00e599] bg-[#00e599]/5' : 'border-zinc-800 bg-black/50'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <svg className="mx-auto h-10 w-10 text-zinc-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              <p className="text-xs text-zinc-400 mb-2">Drag and drop your <strong>.p3key</strong> file here</p>
              <div className="relative">
                <input type="file" className="hidden" id="cert-upload" onChange={handleChange} />
                <label htmlFor="cert-upload" className="text-[#00e599] text-xs font-bold cursor-pointer hover:underline">
                  or browse device
                </label>
              </div>
            </div>
          </div>
          
          {isSuperUser && (
            <div className="mb-6 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
               <div className="text-[10px] text-zinc-500 mb-2">SETUP / RECOVERY MODE</div>
               <button onClick={handleDownloadMasterKey} className="text-xs text-[#00e599] font-bold hover:underline flex items-center justify-center gap-2 w-full">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                 Download Master Key
               </button>
            </div>
          )}

          <Button variant="ghost" onClick={onCancel} className="w-full text-zinc-500 hover:text-white">
            Cancel Login
          </Button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { RiskReport, RiskFactor } from '../types';
import { Button } from './Button';

interface Props {
  report: RiskReport | null;
  isLoading: boolean;
  onRefresh: () => void;
  onClose: () => void;
}

export const RiskDashboard: React.FC<Props> = ({ report, isLoading, onRefresh, onClose }) => {
  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'HIGH': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'MEDIUM': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'LOW': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-slate-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-emerald-400';
    if (score < 60) return 'text-amber-400';
    return 'text-red-500';
  };

  if (!report && !isLoading) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-[#0f172a] border border-slate-700 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900/50 p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-2xl">🛡️</span> Risk Assessment Engine
            </h2>
            <p className="text-xs text-slate-400 mt-1">Real-time analysis of On-Chain History & Macro Market Events</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
               <div className="w-12 h-12 border-4 border-[#667eea] border-t-transparent rounded-full animate-spin"></div>
               <p className="text-slate-400 animate-pulse">Scanning Global News & Blockchain Data...</p>
            </div>
          ) : report ? (
            <div className="space-y-8">
              
              {/* Score Cards */}
              <div className="grid grid-cols-3 gap-4">
                 <div className="bg-slate-800/50 rounded-2xl p-4 text-center border border-slate-700">
                    <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Composite Risk</div>
                    <div className={`text-4xl font-bold ${getScoreColor(report.compositeScore)}`}>{report.compositeScore}</div>
                    <div className="text-[10px] text-slate-400 mt-1">/ 100</div>
                 </div>
                 <div className="bg-slate-800/50 rounded-2xl p-4 text-center border border-slate-700">
                    <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Macro (News)</div>
                    <div className={`text-2xl font-bold ${getScoreColor(report.macroScore)}`}>{report.macroScore}</div>
                 </div>
                 <div className="bg-slate-800/50 rounded-2xl p-4 text-center border border-slate-700">
                    <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">On-Chain</div>
                    <div className={`text-2xl font-bold ${getScoreColor(report.walletScore)}`}>{report.walletScore}</div>
                 </div>
              </div>

              {/* Narrative Summary */}
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                 <h4 className="text-blue-400 font-bold text-sm mb-2 uppercase tracking-wide">AI Analysis</h4>
                 <p className="text-sm text-slate-300 leading-relaxed">
                   {report.summary}
                 </p>
                 <div className="mt-2 text-[10px] text-slate-500 text-right">
                   Updated: {new Date(report.timestamp).toLocaleTimeString()}
                 </div>
              </div>

              {/* Risk Factors List */}
              <div>
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                   Active Risk Factors
                </h3>
                <div className="space-y-3">
                  {report.factors.map((factor, idx) => (
                    <div key={idx} className="flex gap-4 p-3 bg-slate-900/40 rounded-xl border border-slate-800 items-start hover:border-slate-700 transition-colors">
                       <div className={`px-2 py-1 rounded text-[10px] font-bold border uppercase tracking-wide ${getSeverityColor(factor.severity)}`}>
                         {factor.severity}
                       </div>
                       <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{factor.category}</span>
                            {factor.sourceUrl && (
                               <a href={factor.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:underline flex items-center gap-1">
                                 Source ↗
                               </a>
                            )}
                          </div>
                          <p className="text-sm text-slate-200 mt-1">{factor.description}</p>
                       </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex justify-end">
           <Button onClick={onRefresh} variant="secondary" size="sm" isLoading={isLoading}>
             Refresh Analysis
           </Button>
        </div>
      </div>
    </div>
  );
};

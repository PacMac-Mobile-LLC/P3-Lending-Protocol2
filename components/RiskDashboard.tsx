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
      case 'HIGH': return 'text-red-500 border-red-900 bg-red-900/20';
      case 'MEDIUM': return 'text-amber-500 border-amber-900 bg-amber-900/20';
      case 'LOW': return 'text-[#00e599] border-emerald-900 bg-emerald-900/20';
      default: return 'text-zinc-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-[#00e599]';
    if (score < 60) return 'text-amber-500';
    return 'text-red-500';
  };

  if (!report && !isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-black border border-zinc-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-zinc-900/50 p-6 border-b border-zinc-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-2xl">🛡️</span> Risk Assessment
            </h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-black">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
               <div className="w-12 h-12 border-4 border-[#00e599] border-t-transparent rounded-full animate-spin"></div>
               <p className="text-zinc-500 animate-pulse">Analyzing Risk Vectors...</p>
            </div>
          ) : report ? (
            <div className="space-y-8">
              
              {/* Score Cards */}
              <div className="grid grid-cols-3 gap-4">
                 <div className="bg-zinc-900 rounded-xl p-4 text-center border border-zinc-800">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-semibold">Composite Risk</div>
                    <div className={`text-4xl font-bold ${getScoreColor(report.compositeScore)}`}>{report.compositeScore}</div>
                    <div className="text-[10px] text-zinc-600 mt-1">/ 100</div>
                 </div>
                 <div className="bg-zinc-900 rounded-xl p-4 text-center border border-zinc-800">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-semibold">Macro (News)</div>
                    <div className={`text-2xl font-bold ${getScoreColor(report.macroScore)}`}>{report.macroScore}</div>
                 </div>
                 <div className="bg-zinc-900 rounded-xl p-4 text-center border border-zinc-800">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-semibold">On-Chain</div>
                    <div className={`text-2xl font-bold ${getScoreColor(report.walletScore)}`}>{report.walletScore}</div>
                 </div>
              </div>

              {/* Narrative Summary */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                 <h4 className="text-zinc-400 font-bold text-xs mb-2 uppercase tracking-wide">AI Analysis</h4>
                 <p className="text-sm text-zinc-300 leading-relaxed">
                   {report.summary}
                 </p>
                 <div className="mt-2 text-[10px] text-zinc-600 text-right">
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
                    <div key={idx} className="flex gap-4 p-3 bg-zinc-900 rounded-lg border border-zinc-800 items-start">
                       <div className={`px-2 py-1 rounded text-[10px] font-bold border uppercase tracking-wide ${getSeverityColor(factor.severity)}`}>
                         {factor.severity}
                       </div>
                       <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{factor.category}</span>
                            {factor.sourceUrl && (
                               <a href={factor.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:underline flex items-center gap-1">
                                 Source ↗
                               </a>
                            )}
                          </div>
                          <p className="text-sm text-zinc-300 mt-1">{factor.description}</p>
                       </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 flex justify-end">
           <Button onClick={onRefresh} variant="secondary" size="sm" isLoading={isLoading}>
             Refresh Analysis
           </Button>
        </div>
      </div>
    </div>
  );
};
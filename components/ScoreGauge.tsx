import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface ScoreGaugeProps {
  score: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
  const data = [{ name: 'Score', value: score, fill: '#00e599' }];

  const getScoreColor = (s: number) => {
    if (s >= 80) return '#00e599'; // Neon Green
    if (s >= 60) return '#fbbf24'; // Amber
    return '#ef4444'; // Red
  };

  return (
    <div className="relative w-full h-40 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="75%" 
          outerRadius="100%" 
          barSize={8} 
          data={data} 
          startAngle={180} 
          endAngle={0}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background={{ fill: '#27272a' }} // Zinc-800 background track
            dataKey="value"
            cornerRadius={4}
            fill={getScoreColor(score)}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-2 text-center mt-2">
        <span className="text-4xl font-bold text-white tracking-tighter">{score}</span>
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Reputation</p>
      </div>
    </div>
  );
};
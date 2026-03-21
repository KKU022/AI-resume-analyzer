'use client';

import { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type ScoreHistoryPoint = {
  month: string;
  score: number;
  avg: number;
};

type ScoreHistoryChartProps = {
  data: ScoreHistoryPoint[];
};

export default function ScoreHistoryChart({ data }: ScoreHistoryChartProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const syncTheme = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
    syncTheme();
    window.addEventListener('app-theme-change', syncTheme as EventListener);
    return () => window.removeEventListener('app-theme-change', syncTheme as EventListener);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center text-sm text-slate-600 dark:text-slate-500">
        No analysis history available yet.
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full px-3 pb-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 16, right: 20, left: 8, bottom: 8 }}>
          <CartesianGrid stroke={isDarkMode ? 'rgba(148, 163, 184, 0.15)' : 'rgba(71, 85, 105, 0.18)'} strokeDasharray="4 4" />
          <XAxis dataKey="month" tick={{ fill: isDarkMode ? '#94a3b8' : '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: isDarkMode ? '#94a3b8' : '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ stroke: 'rgba(99, 102, 241, 0.25)' }}
            contentStyle={{
              borderRadius: '12px',
              border: isDarkMode ? '1px solid rgba(148, 163, 184, 0.2)' : '1px solid rgba(148, 163, 184, 0.45)',
              backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.96)',
              color: isDarkMode ? '#e2e8f0' : '#0f172a',
            }}
          />
          <Legend wrapperStyle={{ color: isDarkMode ? '#cbd5e1' : '#334155', fontSize: 11 }} />
          <Line
            type="monotone"
            dataKey="avg"
            name="Industry"
            stroke="#6366F1"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="score"
            name="Personal"
            stroke="#22C55E"
            strokeWidth={2.5}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type SkillPoint = {
  name: string;
  level: number;
};

type SkillsBarChartProps = {
  data: SkillPoint[];
  colors?: string[];
};

export default function SkillsBarChart({ data, colors = [] }: SkillsBarChartProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const syncTheme = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
    syncTheme();
    window.addEventListener('app-theme-change', syncTheme as EventListener);
    return () => window.removeEventListener('app-theme-change', syncTheme as EventListener);
  }, []);

  const chartData = (data || []).slice(0, 8).map((item, index) => ({
    ...item,
    fill: colors[index % colors.length] || '#38BDF8',
  }));

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-sm text-slate-600 dark:text-slate-500">
        No skills detected yet.
      </div>
    );
  }

  return (
    <div className="h-[300px] min-h-[300px] min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 16, left: 4, bottom: 8 }}>
          <CartesianGrid strokeDasharray="4 4" stroke={isDarkMode ? 'rgba(148, 163, 184, 0.15)' : 'rgba(71, 85, 105, 0.18)'} />
          <XAxis
            dataKey="name"
            tick={{ fill: isDarkMode ? '#94a3b8' : '#475569', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={56}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: isDarkMode ? '#94a3b8' : '#475569', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
            contentStyle={{
              borderRadius: '12px',
              border: isDarkMode ? '1px solid rgba(148, 163, 184, 0.2)' : '1px solid rgba(148, 163, 184, 0.45)',
              backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.96)',
              color: isDarkMode ? '#e2e8f0' : '#0f172a',
            }}
          />
          <Bar dataKey="level" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

'use client';

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
  if (!data || data.length === 0) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center text-sm text-slate-500">
        No analysis history available yet.
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full px-3 pb-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 16, right: 20, left: 8, bottom: 8 }}>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.15)" strokeDasharray="4 4" />
          <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ stroke: 'rgba(99, 102, 241, 0.25)' }}
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              backgroundColor: 'rgba(15, 23, 42, 0.92)',
              color: '#e2e8f0',
            }}
          />
          <Legend wrapperStyle={{ color: '#cbd5e1', fontSize: 11 }} />
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

'use client';

import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

type Props = {
  onPick: (value: string, options?: { useDemo?: boolean }) => void;
};

const SUGGESTIONS = [
  { label: 'Review my resume', value: 'Review my resume and suggest the top 5 high-impact improvements.' },
  { label: 'Suggest jobs for me', value: 'Recommend roles I should target next with match percentages.' },
  { label: 'Explain my skill gaps', value: 'Explain my top skill gaps and how to close them in 30 days.' },
  { label: 'Generate interview questions', value: 'Generate interview questions based on my strongest skills.' },
  { label: 'Rewrite my resume bullet', value: 'Rewrite my weak resume bullets into quantified, action-oriented ones.' },
  { label: 'Ask AI About Demo Resume', value: 'Use demo resume context and give me a fast coaching overview.', useDemo: true },
];

export default function ChatSuggestions({ onPick }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-brand-accent-data/90">
        <Sparkles className="h-3 w-3" />
        Quick Actions
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((item, idx) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            onClick={() => onPick(item.value, { useDemo: Boolean(item.useDemo) })}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs font-bold text-slate-200 transition-all hover:border-brand-accent-ai/40 hover:bg-brand-accent-ai/10 hover:text-white"
          >
            {item.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';

export default function ChatTypingIndicator() {
  return (
    <div className="flex items-start gap-2.5">
      <div className="h-8 w-8 rounded-full bg-brand-accent-ai/15 border border-brand-accent-ai/25 flex items-center justify-center text-[10px] font-black text-brand-accent-ai">
        AI
      </div>
      <div className="rounded-2xl rounded-tl-md border border-white/10 bg-white/5 backdrop-blur-md px-4 py-3">
        <div className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-brand-accent-data/90">
          AI is thinking...
        </div>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              className="h-1.5 w-1.5 rounded-full bg-brand-accent-data"
              animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: dot * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import { Bot, Minimize2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  onClose: () => void;
};

export default function ChatHeader({ onClose }: Props) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-accent-ai/35 bg-brand-accent-ai/15 text-brand-accent-ai">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-xs font-black tracking-[0.12em] text-white">
            MEDHA ASSISTANT <Sparkles className="h-3.5 w-3.5 text-brand-accent-data" />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Personalized Resume Intelligence</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="h-8 w-8 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
      >
        <Minimize2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

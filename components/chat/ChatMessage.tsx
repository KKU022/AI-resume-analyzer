'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChatMessageItem } from '@/components/chat/types';
import { cn } from '@/lib/utils';

type Props = {
  message: ChatMessageItem;
};

const SECTION_HEADERS = [
  'Answer',
  'Based on your resume',
  'Suggested actions',
  '❓ Questions',
];

function renderAssistantMessage(raw: string) {
  const lines = raw.split('\n');
  const rendered: ReactNode[] = [];

  let currentSection: string | null = null;
  let bullets: string[] = [];

  const flush = () => {
    if (!currentSection) {
      return;
    }

    rendered.push(
      <div key={`${currentSection}-${rendered.length}`} className="space-y-1.5">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-brand-accent-data">
          {currentSection}
        </p>
        <ul className="list-disc space-y-1 pl-4 text-slate-100">
          {bullets.map((item, idx) => (
            <li key={`${currentSection}-${idx}`}>{item}</li>
          ))}
        </ul>
      </div>
    );

    currentSection = null;
    bullets = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    if (SECTION_HEADERS.includes(trimmed)) {
      flush();
      currentSection = trimmed;
      continue;
    }

    if (currentSection) {
      bullets.push(trimmed.replace(/^-\s*/, ''));
    } else {
      rendered.push(
        <p key={`line-${rendered.length}`} className="text-slate-100">
          {trimmed}
        </p>
      );
    }
  }

  flush();
  return rendered;
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('flex gap-2.5', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && (
        <div className="h-8 w-8 shrink-0 rounded-full bg-brand-accent-ai/15 border border-brand-accent-ai/30 flex items-center justify-center text-[10px] font-black text-brand-accent-ai">
          AI
        </div>
      )}
      <div
        className={cn(
          'max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'rounded-tr-md bg-brand-accent-ai text-white shadow-[0_12px_30px_rgba(99,102,241,0.32)]'
            : 'rounded-tl-md border border-white/10 bg-white/5 text-slate-100 backdrop-blur-md'
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.message}</p>
        ) : (
          <div className="space-y-3">{renderAssistantMessage(message.message)}</div>
        )}
      </div>
      {isUser && (
        <div className="h-8 w-8 shrink-0 rounded-full bg-brand-accent-success/20 border border-brand-accent-success/30 flex items-center justify-center text-[10px] font-black text-brand-accent-success">
          You
        </div>
      )}
    </motion.div>
  );
}

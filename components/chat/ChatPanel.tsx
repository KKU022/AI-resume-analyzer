'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import ChatSuggestions from '@/components/chat/ChatSuggestions';
import ChatTypingIndicator from '@/components/chat/ChatTypingIndicator';
import { ChatMessageItem } from '@/components/chat/types';

type Props = {
  open: boolean;
  messages: ChatMessageItem[];
  isLoadingHistory: boolean;
  isStreaming: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSend: (message: string, options?: { useDemo?: boolean }) => Promise<void>;
};

export default function ChatPanel({
  open,
  messages,
  isLoadingHistory,
  isStreaming,
  errorMessage,
  onClose,
  onSend,
}: Props) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isStreaming]);

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-x-0 bottom-0 z-80 h-[90vh] border border-white/10 bg-[rgba(17,24,39,0.75)] shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:inset-auto sm:bottom-6 sm:right-6 sm:h-170 sm:w-105 sm:rounded-3xl"
        >
          <div className="flex h-full flex-col">
            <ChatHeader onClose={onClose} />

            <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
              {errorMessage && (
                <div className="rounded-2xl border border-red-500/35 bg-red-500/10 p-3 text-xs font-bold text-red-200">
                  {errorMessage}
                </div>
              )}

              {messages.length === 0 && !isLoadingHistory && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
                  Ask anything about your resume, skill gaps, interview prep, roadmaps, and portfolio growth.
                </div>
              )}

              {messages.length === 0 && !isStreaming && <ChatSuggestions onPick={onSend} />}

              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {isStreaming && <ChatTypingIndicator />}
              <div ref={endRef} />
            </div>

            <ChatInput disabled={isStreaming || isLoadingHistory} onSend={(message) => onSend(message)} />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

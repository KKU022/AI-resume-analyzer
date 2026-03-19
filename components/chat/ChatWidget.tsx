'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, X } from 'lucide-react';
import ChatPanel from '@/components/chat/ChatPanel';
import { ChatMessageItem } from '@/components/chat/types';
import { Button } from '@/components/ui/button';

type ChatHistoryResponse = {
  sessionId: string | null;
  isDemo?: boolean;
  messages: Array<{ id: string; role: 'user' | 'assistant'; message: string; timestamp?: string }>;
};

function makeLocalMessage(role: 'user' | 'assistant', message: string): ChatMessageItem {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    message,
    timestamp: new Date().toISOString(),
  };
}

const DEMO_QUESTIONS = [
  'What skills should I learn next?',
  'What jobs match my resume?',
  'How can I improve my resume?',
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const loadedRef = useRef(false);

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch('/api/chat');
      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as ChatHistoryResponse;
      setSessionId(payload.sessionId);
      setMessages(payload.messages || []);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    const seen = window.localStorage.getItem('medha-assistant-intro-seen');
    if (!seen) {
      setShowIntro(true);
    }
  }, []);

  useEffect(() => {
    if (!open || loadedRef.current) {
      return;
    }

    loadedRef.current = true;
    loadHistory();
  }, [open, loadHistory]);

  const sendMessage = useCallback(
    async (value: string, options?: { useDemo?: boolean }) => {
      if (!value.trim() || isStreaming) {
        return;
      }

      const userMessage = makeLocalMessage('user', value);
      const assistantPlaceholder = makeLocalMessage('assistant', '');

      setChatError(null);
      setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
      setIsStreaming(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: value,
            sessionId,
            useDemo: Boolean(options?.useDemo),
          }),
        });

        if (!response.ok || !response.body) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error || 'Chat request failed');
        }

        const nextSessionId = response.headers.get('X-Session-Id');
        if (nextSessionId) {
          setSessionId(nextSessionId);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value: chunk } = await reader.read();
          if (done) {
            break;
          }

          fullText += decoder.decode(chunk, { stream: true });
          setMessages((prev) => {
            const copy = [...prev];
            const lastIdx = copy.length - 1;
            if (lastIdx >= 0 && copy[lastIdx].role === 'assistant') {
              copy[lastIdx] = { ...copy[lastIdx], message: fullText };
            }
            return copy;
          });
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Something went wrong';
        setChatError(`AI request failed: ${message}`);
        setMessages((prev) => {
          const copy = [...prev];
          const lastIdx = copy.length - 1;
          if (lastIdx >= 0 && copy[lastIdx].role === 'assistant') {
            copy[lastIdx] = {
              ...copy[lastIdx],
              message: `I hit a temporary issue: ${message}. I can still provide guidance if you retry.`,
            };
          }
          return copy;
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, sessionId]
  );

  const closeIntro = useCallback(() => {
    window.localStorage.setItem('medha-assistant-intro-seen', '1');
    setShowIntro(false);
  }, []);

  const openAndAsk = useCallback(
    async (question?: string) => {
      setOpen(true);
      closeIntro();
      if (question) {
        await sendMessage(question);
      }
    },
    [closeIntro, sendMessage]
  );

  return (
    <>
      <div className="fixed bottom-6 right-6 z-75 flex flex-col items-end gap-2">
        <AnimatePresence>
          {!open && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="rounded-lg border border-brand-accent-data/40 bg-brand-primary/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-brand-accent-data shadow-lg"
            >
              Ask Medha Assistant
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          animate={{ boxShadow: ['0 0 0 rgba(99,102,241,0.2)', '0 0 28px rgba(99,102,241,0.7)', '0 0 0 rgba(99,102,241,0.2)'] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          onClick={() => setOpen((prev) => !prev)}
          className="group relative flex h-15 w-15 items-center justify-center rounded-2xl border border-brand-accent-ai/50 bg-brand-accent-ai text-white shadow-[0_14px_45px_rgba(99,102,241,0.48)] transition-all hover:shadow-[0_18px_58px_rgba(99,102,241,0.72)]"
          aria-label="Toggle Medha assistant chatbot"
        >
          <motion.div
            animate={{ rotate: [0, 0, 10, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
          >
            <Bot className="h-7 w-7" />
          </motion.div>
          <span className="pointer-events-none absolute inset-0 rounded-2xl border border-brand-accent-data/40 opacity-0 transition-opacity group-hover:opacity-100" />
        </motion.button>
      </div>

      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[85] bg-black/45 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              className="absolute bottom-24 right-6 w-[min(92vw,420px)] rounded-3xl border border-white/15 bg-brand-secondary/85 p-5 shadow-2xl"
            >
              <button
                onClick={closeIntro}
                className="absolute right-3 top-3 rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                aria-label="Dismiss intro"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-3 flex items-center gap-2 text-brand-accent-data">
                <Sparkles className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Medha Assistant</span>
              </div>

              <h3 className="text-lg font-black text-white">Hi! I&apos;m your Medha Assistant.</h3>
              <p className="mt-2 text-sm text-slate-300">
                I can help improve your resume, suggest jobs, and answer career questions.
              </p>

              <div className="mt-4 space-y-2">
                {DEMO_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    onClick={() => openAndAsk(question)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs font-bold text-slate-200 transition hover:border-brand-accent-ai/40 hover:bg-brand-accent-ai/12"
                  >
                    {question}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Button onClick={() => openAndAsk()} className="flex-1 bg-brand-accent-ai text-white hover:bg-brand-accent-ai/90">
                  Try asking a question
                </Button>
                <Button variant="ghost" onClick={closeIntro} className="text-slate-300 hover:bg-white/10 hover:text-white">
                  Dismiss
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ChatPanel
        open={open}
        messages={messages}
        isLoadingHistory={isLoadingHistory}
        isStreaming={isStreaming}
        errorMessage={chatError}
        onClose={() => setOpen(false)}
        onSend={sendMessage}
      />
    </>
  );
}

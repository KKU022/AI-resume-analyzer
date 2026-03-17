'use client';

import { FormEvent, useState } from 'react';
import { SendHorizonal } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  onSend: (message: string) => Promise<void> | void;
  disabled?: boolean;
};

export default function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const next = value.trim();
    if (!next || disabled) {
      return;
    }

    setValue('');
    await onSend(next);
  };

  return (
    <form onSubmit={submit} className="flex items-end gap-2 border-t border-white/10 p-3">
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Ask about resume bullets, interview prep, jobs, skill gaps..."
        rows={1}
        disabled={disabled}
        className="max-h-28 min-h-[44px] flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-accent-ai/45 focus:outline-none"
      />
      <Button
        type="submit"
        disabled={disabled || !value.trim()}
        className="h-11 rounded-xl bg-brand-accent-ai px-4 text-white hover:bg-brand-accent-ai/90 disabled:opacity-50"
      >
        <SendHorizonal className="h-4 w-4" />
      </Button>
    </form>
  );
}

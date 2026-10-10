'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, Copy, ArrowRight, Loader2, GitCommit, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { showSuccessToast } from '@/lib/toast';

interface AiRewriteDiffCardProps {
  original: string;
  improved: string;
  targetRole?: string;
  onApplyFix?: (original: string, improved: string) => Promise<void> | void;
  isApplying?: boolean;
}

export default function AiRewriteDiffCard({
  original,
  improved: initialImproved,
  targetRole,
  onApplyFix,
  isApplying,
}: AiRewriteDiffCardProps) {
  const [currentImproved, setCurrentImproved] = useState(initialImproved);
  const [isRewriting, setIsRewriting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRewriteWithGrok = async () => {
    setIsRewriting(true);
    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalBullet: original,
          targetRole: targetRole || 'Software Professional',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.improved) {
          setCurrentImproved(data.improved);
          showSuccessToast('Grok generated a high-impact metric rewrite!');
        }
      }
    } catch (e) {
      console.warn('Live rewrite error:', e);
    } finally {
      setIsRewriting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentImproved);
    setCopied(true);
    showSuccessToast('Improved bullet copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-[28px] border transition-all duration-300 relative overflow-hidden space-y-4"
      style={{
        background: 'rgba(255, 255, 255, 0.025)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-[#6366F1]" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6366F1]">
            Git-Style Metric Diff
          </span>
        </div>
        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
          Grok Calibrated
        </span>
      </div>

      {/* Git-Style Inline Diff Block */}
      <div className="p-4 rounded-2xl bg-black/50 border border-white/5 font-mono text-xs space-y-3 leading-relaxed">
        {/* Red Strikethrough for Deleted / Weak Phrasing */}
        <div className="flex items-start gap-3 text-red-400/90 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
          <span className="font-black text-red-400 select-none">-</span>
          <span className="line-through opacity-80">{original}</span>
        </div>

        {/* Green for Strong Action Verbs & Metrics */}
        <div className="flex items-start gap-3 text-emerald-300 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
          <span className="font-black text-emerald-400 select-none">+</span>
          <span className="font-semibold">{currentImproved}</span>
        </div>
      </div>

      {/* Action + Metric + Impact Enhancement Breakdown */}
      <div className="flex items-center gap-2 flex-wrap text-[10px] font-bold">
        <span className="px-2.5 py-1 rounded-md bg-[#6366F1]/15 text-[#818cf8] border border-[#6366F1]/30">
          ✓ Action: Strong Action Verb
        </span>
        <span className="px-2.5 py-1 rounded-md bg-[#22C55E]/15 text-[#4ade80] border border-[#22C55E]/30">
          ✓ Metric: Quantifiable Scale
        </span>
        <span className="px-2.5 py-1 rounded-md bg-[#38BDF8]/15 text-[#38bdf8] border border-[#38BDF8]/30">
          ✓ Impact: Business Latency / ROI
        </span>
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-between gap-3 pt-2 flex-wrap border-t border-white/5">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRewriteWithGrok}
            disabled={isRewriting}
            className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white"
          >
            {isRewriting ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-[#6366F1]" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-[#38BDF8]" />
            )}
            Regenerate with Grok
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="rounded-xl text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10"
          >
            {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
        </div>

        {onApplyFix && (
          <Button
            size="sm"
            onClick={() => onApplyFix(original, currentImproved)}
            disabled={isApplying}
            className="bg-[#22C55E] hover:bg-[#16a34a] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg"
          >
            {isApplying ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            )}
            Apply to Resume
          </Button>
        )}
      </div>
    </motion.div>
  );
}

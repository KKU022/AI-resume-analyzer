'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  BrainCircuit,
  Shield,
  AlertCircle,
  Sparkles,
  Zap,
  Globe,
  Cpu,
  Target,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { showSuccessToast, showErrorToast } from '@/lib/toast';


type UploadStatus = 'idle' | 'uploading' | 'parsing' | 'syncing' | 'finalizing' | 'done' | 'error';

const PIPELINE_STAGES = [
  { id: 'uploading', label: 'Uploading Resume', icon: UploadCloud, color: '#38BDF8', description: 'Secure transfer to AI engine' },
  { id: 'parsing', label: 'Extracting Text', icon: Cpu, color: '#22C55E', description: 'Neural document parsing' },
  { id: 'syncing', label: 'AI Analysis', icon: BrainCircuit, color: '#6366F1', description: 'GPT-4o intelligence engine' },
  { id: 'finalizing', label: 'Building Report', icon: Sparkles, color: '#F59E0B', description: 'Generating career insights' },
];

const STAGE_ORDER: UploadStatus[] = ['uploading', 'parsing', 'syncing', 'finalizing', 'done'];

function getStageIndex(status: UploadStatus) {
  return STAGE_ORDER.indexOf(status);
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState('');
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const router = useRouter();
  const progressRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const animateProgressTo = useCallback((target: number, duration: number): Promise<void> => {
    return new Promise((resolve) => {
      const startVal = progressRef.current;
      const start = Date.now();
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - start;
        const frac = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - frac, 3);
        const next = Math.round(startVal + (target - startVal) * eased);
        progressRef.current = next;
        setProgress(next);
        if (frac >= 1) {
          clearInterval(intervalRef.current!);
          progressRef.current = target;
          setProgress(target);
          resolve();
        }
      }, 16);
    });
  }, []);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const runUploadPipeline = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setError('');
    progressRef.current = 0;
    setProgress(0);
    setStatus('uploading');

    try {
      await animateProgressTo(20, 400);
      const formData = new FormData();
      formData.append('file', selectedFile);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!uploadRes.ok) {
        let errorMsg = `Upload failed (${uploadRes.status}). Please try another file.`;
        const uploadResClone = uploadRes.clone();
        try {
          const errorData = await uploadRes.json();
          errorMsg = errorData.error || errorMsg;
        } catch {
          // If response isn't JSON, try to read as text for debugging
          try {
            const text = await uploadResClone.text();
            console.error('[UPLOAD] Non-JSON error response:', text);
          } catch {
            console.error('[UPLOAD] Could not read error response');
          }
        }
        throw new Error(errorMsg);
      }
      let uploadData;
      try {
        uploadData = await uploadRes.json();
      } catch (jsonErr) {
        console.error('[UPLOAD] Failed to parse JSON response:', jsonErr);
        throw new Error('Invalid response from server. Please try again.');
      }
      await animateProgressTo(34, 320);

      setStatus('parsing');
      await animateProgressTo(66, 700);

      setStatus('syncing');
      await animateProgressTo(88, 500);

      if (!uploadData.analysisId) {
        throw new Error('Analysis was not generated. Please retry.');
      }

      setStatus('finalizing');
      await animateProgressTo(100, 450);
      setStatus('done');
      await new Promise((resolve) => setTimeout(resolve, 350));
      showSuccessToast('Resume analyzed successfully! Processing your insights...');
      router.push(`/dashboard/analysis?id=${uploadData.analysisId}`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Processing failed. Please try again.';
      setError(errMsg);
      setStatus('error');
      showErrorToast(errMsg);
    }
  }, [animateProgressTo, router]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) runUploadPipeline(acceptedFiles[0]);
  }, [runUploadPipeline]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
    disabled: status !== 'idle' && status !== 'error',
  });

  const handleBrowse = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    open();
  };

  const handleDemoResume = async () => {
    setIsDemoLoading(true);
    await new Promise(r => setTimeout(r, 600));
    router.push('/dashboard/analysis?demo=true');
  };

  const resetUpload = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFile(null);
    progressRef.current = 0;
    setProgress(0);
    setStatus('idle');
    setError('');
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const isProcessing = status !== 'idle' && status !== 'error' && status !== 'done';
  const currentStageIdx = getStageIndex(status);

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/20 text-[10px] font-black text-[#6366F1] uppercase tracking-[0.3em]">
          <Sparkles className="w-3 h-3" /> Industry Standard AI V4.0
        </motion.div>
        <h1 className="text-5xl md:text-6xl font-black font-space-grotesk text-white tracking-tighter">
          Initialize <span className="text-gradient">Profile Sync</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
          Feed our neural engine your professional history. We&apos;ll calculate your market velocity and match you with elite opportunities.
        </p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Button onClick={handleDemoResume} disabled={isDemoLoading || isProcessing}
            className="group relative overflow-hidden bg-gradient-to-r from-[#22C55E]/20 to-[#38BDF8]/20 hover:from-[#22C55E]/30 hover:to-[#38BDF8]/30 border border-[#22C55E]/30 hover:border-[#22C55E]/50 text-white rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px] transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            {isDemoLoading ? (
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />Loading Demo...</span>
            ) : (
              <span className="flex items-center gap-2"><Play className="w-3 h-3 fill-current" />Try Demo Resume — Instant Results</span>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
          </Button>
        </motion.div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="p-6 rounded-[32px] bg-red-500/10 border border-red-500/20 text-red-100 text-sm flex items-center gap-4 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1">
              <div className="font-black uppercase tracking-widest text-[10px] text-red-400 mb-1">Processing Error</div>
              <p className="font-medium opacity-80">{error}</p>
            </div>
            <Button variant="ghost" onClick={resetUpload} className="text-red-400 hover:text-red-300 text-xs font-bold shrink-0">Retry</Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-4 space-y-6">
          {[
            { icon: Shield, color: '#38BDF8', title: 'Privacy Protocol Alpha', desc: 'Military-grade end-to-end encryption. Your data is ephemeral after analysis.' },
            { icon: BrainCircuit, color: '#6366F1', title: 'Neural Skill Mapping', desc: 'Semantic connections between your projects and target role requirements.' },
            { icon: Cpu, color: '#22C55E', title: 'ATS Velocity Score', desc: 'Simulate how Applicant Tracking Systems perceive your resume structure.' },
          ].map(({ icon: Icon, color, title, desc }) => (
            <Card key={title} className="bg-[#111827]/40 border-white/5 backdrop-blur-xl p-8 rounded-[40px] space-y-4 hover:border-white/10 transition-all duration-500 group overflow-hidden relative card-lift">
              <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `${color}10` }} />
              <div className="w-14 h-14 rounded-2xl border flex items-center justify-center relative z-10" style={{ background: `${color}15`, borderColor: `${color}30` }}>
                <Icon className="w-7 h-7" style={{ color }} />
              </div>
              <div className="space-y-2 relative z-10">
                <h3 className="text-lg font-black text-white font-space-grotesk tracking-tight">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{desc}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div {...getRootProps()} className={cn(
            'min-h-[500px] border-2 border-dashed rounded-[60px] flex flex-col items-center justify-center p-12 transition-all duration-700 relative overflow-hidden',
            isProcessing ? 'cursor-default border-[#6366F1]/30 bg-[#6366F1]/5' :
            isDragActive ? 'cursor-copy border-[#6366F1] bg-[#6366F1]/10 shadow-[0_0_60px_rgba(99,102,241,0.15)]' :
            status === 'error' ? 'cursor-pointer border-red-500/30 hover:border-red-500/50' :
            'cursor-pointer border-white/10 hover:border-[#6366F1]/40 hover:bg-white/[0.02] shadow-2xl group'
          )}>
            <input {...getInputProps()} />
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
              <div className="grid grid-cols-12 h-full w-full">{Array.from({ length: 144 }).map((_, i) => <div key={i} className="border-[0.5px] border-white h-24 w-full" />)}</div>
            </div>
            <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-white/10 rounded-tl-xl" />
            <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-white/10 rounded-tr-xl" />
            <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-white/10 rounded-bl-xl" />
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-white/10 rounded-br-xl" />

            <AnimatePresence mode="wait">
              {status === 'idle' && (
                <motion.div key="idle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="text-center space-y-10 relative z-10">
                  <div className="relative inline-block">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="absolute -inset-4 rounded-full border border-dashed border-[#6366F1]/30" />
                    <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-[#6366F1] to-[#38BDF8] flex items-center justify-center shadow-[0_20px_40px_rgba(99,102,241,0.4)] group-hover:scale-110 transition-transform duration-500">
                      <UploadCloud className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-3xl font-black text-white font-space-grotesk tracking-tight">{isDragActive ? 'Drop to Deploy' : 'Deployment Input'}</p>
                    <p className="text-slate-500 font-medium">Drag & drop your resume, or browse files. Max 10MB.</p>
                    <div className="flex items-center justify-center gap-6 pt-2">
                      {['PDF', 'DOCX', 'TXT'].map(fmt => (
                        <div key={fmt} className="flex items-center gap-2 text-[10px] font-black text-slate-600 tracking-widest uppercase">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/20" /> {fmt}
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleBrowse}
                    className="border-white/10 text-white hover:bg-white/10 rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] glass-panel glow-button">
                    Browse System Files
                  </Button>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center space-y-8 relative z-10">
                  <div className="w-28 h-28 rounded-[40px] bg-red-500/10 border-2 border-red-500/40 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-12 h-12 text-red-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white font-space-grotesk mb-2">Processing Failed</p>
                    <p className="text-red-400 text-sm font-medium max-w-xs mx-auto">{error}</p>
                  </div>
                  <Button onClick={resetUpload} className="bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px]">
                    Try Again
                  </Button>
                </motion.div>
              )}

              {isProcessing && (
                <motion.div key="processing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full space-y-10 relative z-10">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-[28px] bg-[#6366F1]/10 border-2 border-[#6366F1]/40 flex items-center justify-center">
                      <FileText className="w-9 h-9 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-black text-white font-space-grotesk tracking-tight truncate max-w-sm">{file?.name}</p>
                      <p className="text-xs text-slate-600 font-mono mt-1">{file ? (file.size / 1024).toFixed(0) : 0} KB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 max-w-lg mx-auto">
                    {PIPELINE_STAGES.map((stage, idx) => {
                      const stageStatus = idx < currentStageIdx ? 'done' : idx === currentStageIdx ? 'active' : 'waiting';
                      const StageIcon = stage.icon;
                      return (
                        <div key={stage.id} className="flex flex-col items-center gap-2 text-center">
                          <motion.div
                            animate={stageStatus === 'active' ? { scale: [1, 1.06, 1] } : {}}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className={cn('w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border',
                              stageStatus === 'done' ? 'bg-[#22C55E]/20 border-[#22C55E]/40' :
                              stageStatus === 'waiting' ? 'bg-white/5 border-white/10 opacity-40' : 'border-2'
                            )}
                            style={stageStatus === 'active' ? { background: `${stage.color}20`, borderColor: `${stage.color}60`, boxShadow: `0 0 20px ${stage.color}30` } : {}}
                          >
                            {stageStatus === 'done'
                              ? <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                              : <StageIcon className="w-5 h-5" style={{ color: stageStatus === 'active' ? stage.color : '#475569' }} />
                            }
                          </motion.div>
                          <span className={cn('text-[9px] font-black uppercase tracking-wider leading-tight', stageStatus !== 'waiting' ? 'text-white' : 'text-slate-700')}>
                            {stage.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="max-w-sm mx-auto space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{PIPELINE_STAGES[Math.min(currentStageIdx, 3)]?.description}</span>
                      <span className="text-lg font-black font-space-grotesk text-white">{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#6366F1] to-[#38BDF8] transition-all duration-100 ease-out"
                        style={{ width: `${progress}%`, boxShadow: '0 0 12px rgba(99,102,241,0.6)' }} />
                    </div>
                    <div className="flex items-center justify-center gap-1.5 pt-2">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-[#6366F1]"
                          animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.4, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-[#111827]/40 backdrop-blur-xl border border-white/5 p-6 rounded-[32px] flex flex-col md:flex-row items-center gap-6">
            <div className="w-14 h-14 rounded-[20px] bg-[#6366F1]/10 flex items-center justify-center border border-[#6366F1]/20 shrink-0">
              <Target className="w-7 h-7 text-[#6366F1]" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-[10px] font-black text-[#6366F1] uppercase tracking-[0.3em]">Neural Protocol Active</p>
              <p className="font-bold text-white">AI Pipeline Integrity Verified</p>
              <p className="text-xs text-slate-500 font-medium">Secure pipeline with deep extraction accuracy across 14 stages of career intelligence.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
        {[
          { icon: Globe, label: 'Global Standards', sub: 'Matching 150+ Markets' },
          { icon: Zap, label: 'Instant Sync', sub: 'Neural Speed Analysis' },
          { icon: Shield, label: 'Data Sovereign', sub: 'Encrypted Ingest' },
          { icon: Sparkles, label: 'Premium AI', sub: 'GPT-4o Level Engine' },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.1 }}
            className="text-center space-y-3 p-6 group rounded-3xl hover:bg-white/[0.02] transition-all duration-300">
            <item.icon className="w-6 h-6 text-slate-700 mx-auto group-hover:text-[#6366F1] transition-colors duration-300" />
            <div>
              <div className="text-[10px] font-black text-white uppercase tracking-widest">{item.label}</div>
              <div className="text-[10px] text-slate-600 font-medium">{item.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

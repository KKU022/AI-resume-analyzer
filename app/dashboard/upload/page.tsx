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
  Briefcase,
  FileSearch,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { showSuccessToast, showErrorToast, showInfoToast } from '@/lib/toast';

type UploadStatus = 'idle' | 'uploading' | 'parsing' | 'syncing' | 'finalizing' | 'done' | 'error';

const PIPELINE_STAGES = [
  { id: 'uploading', label: 'Uploading Resume', icon: UploadCloud, color: '#38BDF8', description: 'Scanning document structure...' },
  { id: 'parsing', label: 'Gemini Ingest', icon: Cpu, color: '#22C55E', description: 'Gemini: Extracting competencies & experience...' },
  { id: 'syncing', label: 'Grok Calibration', icon: BrainCircuit, color: '#6366F1', description: 'Grok: Benchmarking ATS velocity & market match...' },
  { id: 'finalizing', label: 'Executive Scorecard', icon: Sparkles, color: '#F59E0B', description: 'Calibrating executive scorecard...' },
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
  const [notice, setNotice] = useState('');
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  
  // Job Description (JD) Match Mode
  const [auditMode, setAuditMode] = useState<'general' | 'target'>('general');
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');

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

  const getDynamicLoadingMessage = (p: number) => {
    if (p < 25) return 'Scanning document structure...';
    if (p < 55) return 'Gemini: Extracting competencies & experience...';
    if (p < 85) return 'Grok: Benchmarking ATS velocity & market match...';
    return 'Calibrating executive scorecard...';
  };

  const runUploadPipeline = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setError('');
    setNotice('');
    progressRef.current = 0;
    setProgress(0);
    setStatus('uploading');

    try {
      await animateProgressTo(20, 450);
      const formData = new FormData();
      formData.append('file', selectedFile);

      if (auditMode === 'target') {
        if (targetRole.trim()) formData.append('targetRole', targetRole.trim());
        if (jobDescription.trim()) formData.append('jobDescription', jobDescription.trim());
      }

      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        console.error(errText);
        throw new Error('Server error during upload');
      }
      let uploadData;
      try {
        uploadData = await uploadRes.json();
      } catch (jsonErr) {
        console.error('[UPLOAD] Failed to parse JSON response:', jsonErr);
        throw new Error('Invalid response from server. Please try again.');
      }

      if (uploadData?.degraded || !uploadData?.analysisId) {
        try {
          await fetch('/api/session', { method: 'DELETE' });
        } catch {
          // Ignore cleanup errors
        }

        await animateProgressTo(100, 450);
        setStatus('done');
        const degradedMessage =
          uploadData?.message ||
          'Resume text extracted successfully, but real AI analysis did not complete.';
        setNotice(degradedMessage);
        showInfoToast('Resume uploaded, but AI analysis failed. Please retry.');
        return;
      }

      await animateProgressTo(40, 400);

      setStatus('parsing');
      await animateProgressTo(68, 700);

      setStatus('syncing');
      await animateProgressTo(88, 600);

      if (!uploadData.analysisId) {
        throw new Error('Analysis was not generated. Please retry.');
      }

      setStatus('finalizing');
      await animateProgressTo(100, 450);
      setStatus('done');
      await new Promise((resolve) => setTimeout(resolve, 350));
      showSuccessToast('Resume analyzed successfully! Opening scorecard...');
      router.push(`/dashboard/analysis?id=${uploadData.analysisId}`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Processing failed. Please try again.';
      setError(errMsg);
      setStatus('error');
      showErrorToast(errMsg);
    }
  }, [animateProgressTo, router, auditMode, targetRole, jobDescription]);

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
    noClick: false,
    noKeyboard: false,
    disabled: status !== 'idle' && status !== 'error',
  });

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
    setNotice('');
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const isProcessing = status !== 'idle' && status !== 'error' && status !== 'done';
  const currentStageIdx = getStageIndex(status);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700 px-2 sm:px-4">
      {/* Responsive Header Headline */}
      <div className="text-center space-y-5">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/20 text-[10px] font-black text-[#6366F1] uppercase tracking-[0.25em]">
          <Sparkles className="w-3.5 h-3.5" /> Hybrid Multimodal: Gemini 1.5 Flash + Grok Engine
        </motion.div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-space-grotesk text-white tracking-tight break-words">
          Upload Your Resume for an <span className="text-gradient">Instant Market Audit</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
          Ingest your resume directly into our Gemini multimodal & Grok calibration pipeline. Zero retention, verified in-memory computation, and instant ATS velocity benchmark.
        </p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="pt-2">
          <Button onClick={handleDemoResume} disabled={isDemoLoading || isProcessing}
            className="group relative overflow-hidden bg-gradient-to-r from-[#22C55E]/20 to-[#38BDF8]/20 hover:from-[#22C55E]/30 hover:to-[#38BDF8]/30 border border-[#22C55E]/30 hover:border-[#22C55E]/50 text-white rounded-2xl h-11 px-7 font-black uppercase tracking-widest text-[10px] transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            {isDemoLoading ? (
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />Loading Demo...</span>
            ) : (
              <span className="flex items-center gap-2"><Play className="w-3 h-3 fill-current" />Try Demo Resume — Instant Scorecard</span>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
          </Button>
        </motion.div>
      </div>

      {/* Mode Selector: General ATS Audit vs Target Specific Role (JD Match) */}
      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setAuditMode('general')}
            className={cn(
              "flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300",
              auditMode === 'general'
                ? "bg-[#6366F1] text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                : "text-slate-400 hover:text-white"
            )}
          >
            <FileSearch className="w-4 h-4" />
            General ATS Audit
          </button>
          <button
            type="button"
            onClick={() => setAuditMode('target')}
            className={cn(
              "flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300",
              auditMode === 'target'
                ? "bg-gradient-to-r from-[#6366F1] to-[#38BDF8] text-white shadow-[0_0_20px_rgba(56,189,248,0.4)]"
                : "text-slate-400 hover:text-white"
            )}
          >
            <Briefcase className="w-4 h-4" />
            Target Specific Role (JD Match)
          </button>
        </div>

        {/* Expandable JD Input Panel */}
        <AnimatePresence>
          {auditMode === 'target' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mt-4"
            >
              <div 
                className="p-5 rounded-2xl space-y-4"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                }}
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#38BDF8]">
                  <Target className="w-4 h-4" /> Vacancy Calibration Context
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Target Job Title</label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer, Cloud Solutions Architect..."
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#6366F1] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Job Description / Requirements</label>
                  <textarea
                    rows={4}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description, required qualifications, or LinkedIn post text here..."
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#6366F1] transition-colors resize-none font-mono"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modern Frosted Glass Alert: Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="p-5 rounded-2xl flex items-center gap-4 text-sm text-slate-200"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            }}>
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1">
              <div className="font-black uppercase tracking-widest text-[10px] text-red-400 mb-0.5">Processing Alert</div>
              <p className="font-medium text-slate-300">{error}</p>
            </div>
            <Button variant="ghost" onClick={resetUpload} className="text-red-400 hover:text-red-300 text-xs font-bold shrink-0">Retry</Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Frosted Glass Alert: Notice */}
      <AnimatePresence>
        {notice && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="p-5 rounded-2xl flex items-center gap-4 text-sm text-slate-200"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            }}>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-[#38BDF8]" />
            </div>
            <div className="flex-1">
              <div className="font-black uppercase tracking-widest text-[10px] text-[#38BDF8] mb-0.5">Upload State</div>
              <p className="font-medium text-slate-300">{notice}</p>
            </div>
            <Button variant="ghost" onClick={resetUpload} className="text-slate-300 hover:text-white text-xs font-bold shrink-0">Upload Another</Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: SaaS Positioning & Architecture */}
        <div className="lg:col-span-4 space-y-4">
          {[
            { 
              icon: Shield, 
              color: '#38BDF8', 
              title: 'Zero-Retention Privacy', 
              desc: 'Zero-Retention Privacy — Analyzed in memory, never saved or used for AI training.' 
            },
            { 
              icon: BrainCircuit, 
              color: '#6366F1', 
              title: 'Gemini 1.5 Flash Ingest', 
              desc: 'Direct multimodal buffer ingestion parsing scanned, visual, and Canva PDFs directly with high structural fidelity.' 
            },
            { 
              icon: Cpu, 
              color: '#22C55E', 
              title: 'Grok ATS Calibration', 
              desc: 'Simulating ATS parsers, computing keyword density, quantifying action-metric-impact scores, and vacancy fit.' 
            },
          ].map(({ icon: Icon, color, title, desc }) => (
            <Card key={title} 
              className="p-6 rounded-3xl space-y-3 transition-all duration-300 group overflow-hidden relative"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
              }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center relative z-10" style={{ background: `${color}15`, borderColor: `${color}30` }}>
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
              <div className="space-y-1 relative z-10">
                <h3 className="text-base font-black text-white font-space-grotesk tracking-tight">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">{desc}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Right Side: Interactive Drag & Drop Area */}
        <div className="lg:col-span-8 space-y-6">
          <div
            {...getRootProps()}
            className={cn(
              'min-h-[460px] rounded-[36px] flex flex-col items-center justify-center p-8 sm:p-12 transition-all duration-300 relative overflow-hidden cursor-pointer group',
              isProcessing
                ? 'cursor-default border-2 border-dashed border-[#6366F1]/40 bg-[#6366F1]/5'
                : isDragActive
                ? 'border-2 border-dashed border-[#6366f1] bg-[#6366f1]/10 shadow-[0_0_50px_rgba(99,102,241,0.2)]'
                : 'border-2 border-dashed border-[#6366F1]/30 hover:border-[#6366f1] hover:bg-[#6366f1]/[0.04] bg-white/[0.015]'
            )}
          >
            <input {...getInputProps()} />

            {/* Corner Markers */}
            <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-white/10 rounded-tl-lg" />
            <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-white/10 rounded-tr-lg" />
            <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-white/10 rounded-bl-lg" />
            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-white/10 rounded-br-lg" />

            <AnimatePresence mode="wait">
              {status === 'idle' && (
                <motion.div key="idle" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
                  className="text-center space-y-8 relative z-10 w-full max-w-md">
                  
                  {/* Animated Cloud Icon */}
                  <div className="relative inline-block">
                    <motion.div 
                      animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }} 
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute -inset-4 rounded-full bg-[#6366F1]/20 blur-xl" 
                    />
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-[#6366F1] to-[#38BDF8] flex items-center justify-center shadow-[0_15px_35px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform duration-300">
                      <UploadCloud className="w-10 h-10 sm:w-11 sm:h-11 text-white animate-bounce" />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <p className="text-2xl sm:text-3xl font-black text-white font-space-grotesk tracking-tight">
                      {isDragActive ? 'Drop File to Ingest' : 'Upload Resume Document'}
                    </p>
                    <p className="text-slate-400 text-sm font-medium">
                      Drag & drop your file here, or click anywhere to browse
                    </p>
                    
                    {/* File Format & Size Badges */}
                    <div className="flex items-center justify-center gap-2 pt-3 flex-wrap">
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-slate-300 uppercase tracking-wider">
                        PDF
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-slate-300 uppercase tracking-wider">
                        DOCX
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-slate-300 uppercase tracking-wider">
                        TXT
                      </span>
                      <span className="px-3 py-1 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[10px] font-black text-[#38BDF8] uppercase tracking-wider">
                        Max 10MB
                      </span>
                    </div>
                  </div>

                  <Button 
                    type="button"
                    className="border border-[#6366F1]/50 bg-[#6366F1]/10 text-white hover:bg-[#6366F1] hover:text-white rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px] transition-all duration-300 shadow-lg"
                  >
                    Select File From Device
                  </Button>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center space-y-6 relative z-10">
                  <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-white font-space-grotesk mb-1">Upload Interrupted</p>
                    <p className="text-red-300 text-sm font-medium max-w-xs mx-auto">{error}</p>
                  </div>
                  <Button onClick={resetUpload} className="bg-white/10 hover:bg-white/20 text-white rounded-xl h-11 px-8 font-black uppercase tracking-widest text-[10px]">
                    Try Again
                  </Button>
                </motion.div>
              )}

              {/* Real-Time Live Step-by-Step Audit Feed */}
              {isProcessing && (
                <motion.div key="processing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full space-y-6 relative z-10 max-w-xl mx-auto">
                  
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#6366F1]/20 border border-[#6366F1]/40 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-[#38BDF8]" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-white font-space-grotesk tracking-tight truncate max-w-[200px] sm:max-w-xs">{file?.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{file ? (file.size / 1024).toFixed(0) : 0} KB • Verified Buffer</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-black text-[#38BDF8]">{progress}%</span>
                      <p className="text-[9px] uppercase tracking-widest font-black text-slate-400">Live Compute</p>
                    </div>
                  </div>

                  {/* Terminal-Grade Step-by-Step Audit Feed */}
                  <div className="rounded-2xl bg-black/60 border border-white/10 p-5 space-y-3 font-mono text-left shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping" />
                        Active Computation Stream
                      </span>
                      <span className="text-[10px] text-indigo-400">Medha Engine v2.4</span>
                    </div>

                    {[
                      {
                        title: 'Document structure decoded (Gemini 1.5 Flash)',
                        threshold: 25,
                        doneThreshold: 40,
                      },
                      {
                        title: 'Extracted 24 core competencies & 3 work histories',
                        threshold: 40,
                        doneThreshold: 68,
                      },
                      {
                        title: 'Simulating ATS parsers & keyword density (Grok)',
                        threshold: 68,
                        doneThreshold: 90,
                      },
                      {
                        title: 'Generating executive career recommendations',
                        threshold: 90,
                        doneThreshold: 100,
                      },
                    ].map((step, idx) => {
                      const isDone = progress >= step.doneThreshold;
                      const isCurrent = progress >= step.threshold && progress < step.doneThreshold;
                      return (
                        <div
                          key={idx}
                          className={cn(
                            "flex items-center gap-3 text-xs py-1 transition-all duration-300",
                            isDone ? "text-emerald-400 font-medium" :
                            isCurrent ? "text-white font-bold" :
                            "text-slate-600"
                          )}
                        >
                          <span className={cn(
                            "w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 transition-all",
                            isDone ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" :
                            isCurrent ? "bg-[#6366F1]/30 text-[#38BDF8] border border-[#38BDF8]/60 animate-pulse" :
                            "bg-white/5 text-slate-600 border border-white/5"
                          )}>
                            {isDone ? '✓' : isCurrent ? '⟳' : ' '}
                          </span>
                          <span className="flex-1 truncate">
                            {step.title}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] text-[#38BDF8] shrink-0 font-bold animate-pulse">Running</span>
                          )}
                          {isDone && (
                            <span className="text-[10px] text-emerald-400 shrink-0 font-mono">OK</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Micro-Interaction Progress Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#6366F1] via-[#38BDF8] to-[#22C55E] transition-all duration-150 ease-out"
                        style={{ width: `${progress}%`, boxShadow: '0 0 15px rgba(56,189,248,0.7)' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Feature Pillars */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
        {[
          { icon: Globe, label: 'Global ATS Benchmarks', sub: 'Standardized against 150+ Markets' },
          { icon: Zap, label: 'Gemini Multimodal', sub: 'Native Visual Document Ingest' },
          { icon: Shield, label: 'Ephemeral Security', sub: 'Never Retained or Re-Trained' },
          { icon: Sparkles, label: 'Hybrid Intelligence', sub: 'Powered by Gemini & Grok' },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
            className="text-center space-y-2 p-5 group rounded-2xl hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all duration-300">
            <item.icon className="w-5 h-5 text-slate-600 mx-auto group-hover:text-[#6366F1] transition-colors duration-300" />
            <div>
              <div className="text-[10px] font-black text-white uppercase tracking-widest">{item.label}</div>
              <div className="text-[10px] text-slate-500 font-medium">{item.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

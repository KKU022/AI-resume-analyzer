'use client';

import { motion } from 'framer-motion';
import InterviewPrep from '@/components/dashboard/InterviewPrep';
import { Zap } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function InterviewPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 pb-20"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-12 h-12 rounded-xl bg-brand-accent-ai/20 flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap className="w-6 h-6 text-brand-accent-ai" />
          </motion.div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white font-space-grotesk">
              Interview Prep Engine
            </h1>
            <p className="text-slate-400 font-medium mt-1">
              Master real-world interview questions with intelligent AI feedback
            </p>
          </div>
        </div>
      </motion.div>

      {/* Features Overview */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-brand-accent-ai/20 bg-brand-accent-ai/5 p-5">
          <h3 className="font-bold text-white mb-2">Role-Based Questions</h3>
          <p className="text-sm text-neutral-400">
            Choose from Software Engineer, Product Manager, Data Scientist, or General roles
          </p>
        </div>
        <div className="rounded-xl border border-brand-accent-data/20 bg-brand-accent-data/5 p-5">
          <h3 className="font-bold text-white mb-2">Difficulty Levels</h3>
          <p className="text-sm text-neutral-400">
            Progress from Beginner → Intermediate → Advanced
          </p>
        </div>
        <div className="rounded-xl border border-brand-accent-success/20 bg-brand-accent-success/5 p-5">
          <h3 className="font-bold text-white mb-2">Instant Feedback</h3>
          <p className="text-sm text-neutral-400">
            Get scoring, detailed feedback, and improvement tips immediately
          </p>
        </div>
      </motion.div>

      {/* Interview Engine */}
      <motion.div variants={itemVariants}>
        <InterviewPrep />
      </motion.div>
    </motion.div>
  );
}

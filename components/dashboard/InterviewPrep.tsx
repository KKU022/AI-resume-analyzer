'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Send, Award, Zap, TrendingUp, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InterviewQuestion {
  questionId: string;
  question: string;
  category: string;
}

interface InterviewAnswer {
  questionId: string;
  question: string;
  category: string;
  userAnswer: string;
  score: number;
  feedback: string;
  timestamp: Date;
}

type InterviewState = 'idle' | 'setup' | 'interviewing' | 'feedback' | 'complete';

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const roles = ['Software Engineer', 'Product Manager', 'Data Scientist', 'Default'];
const difficulties = ['beginner', 'intermediate', 'advanced'];

export default function InterviewPrep() {
  const [state, setState] = useState<InterviewState>('idle');
  const [selectedRole, setSelectedRole] = useState('Software Engineer');
  const [selectedDifficulty, setSelectedDifficulty] = useState('intermediate');
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    score: number;
    feedback: string;
    overallScore: number;
  } | null>(null);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [stats, setStats] = useState({ bestScore: 0, bestRole: '' });

  // Load interview history on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch('/api/interviews');
        if (res.ok) {
          const data = await res.json();
          setStats({ bestScore: data.bestScore, bestRole: data.bestRole });
        }
      } catch (err) {
        console.error('Error loading stats:', err);
      }
    };
    loadStats();
  }, []);

  const startInterview = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole, difficulty: selectedDifficulty }),
      });

      if (!res.ok) {
        throw new Error('Failed to start interview');
      }

      const data = await res.json();
      setSessionId(data.sessionId);
      setQuestions(data.questions);
      setCurrentQuestionIndex(0);
      setUserAnswer('');
      setAnswers([]);
      setState('interviewing');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!sessionId || !userAnswer.trim()) return;

    try {
      setLoading(true);
      const currentQuestion = questions[currentQuestionIndex];

      const res = await fetch('/api/interviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.questionId,
          question: currentQuestion.question,
          userAnswer,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit answer');
      }

      const data = await res.json();

      // Store answer
      const newAnswer: InterviewAnswer = {
        questionId: currentQuestion.questionId,
        question: currentQuestion.question,
        category: currentQuestion.category,
        userAnswer,
        score: data.score,
        feedback: data.feedback,
        timestamp: new Date(),
      };

      setAnswers([...answers, newAnswer]);
      setFeedback({
        score: data.score,
        feedback: data.feedback,
        overallScore: data.overallScore,
      });

      setState('feedback');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setFeedback(null);
      setState('interviewing');
    } else {
      setState('complete');
    }
  };

  const resetInterview = () => {
    setState('idle');
    setUserAnswer('');
    setFeedback(null);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setSessionId(null);
  };

  // ==================== RENDER STATES ====================

  if (state === 'idle' || state === 'setup') {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
        {/* Header */}
        <motion.div variants={itemVariants} className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-accent-ai/20 via-transparent to-brand-accent-secondary/20 blur-2xl rounded-3xl -z-10" />
          <div className="rounded-2xl border border-brand-accent-ai/30 bg-gradient-to-br from-neutral-900/60 via-brand-accent-ai/10 to-neutral-900/60 p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-brand-accent-ai/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-brand-accent-ai" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white font-space-grotesk">Interview Prep Engine</h2>
                <p className="text-sm text-neutral-400 mt-1">Master real-world interview questions with instant AI feedback</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        {stats.bestScore > 0 && (
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-brand-accent-success/20 bg-brand-accent-success/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-neutral-400 uppercase tracking-wide">Best Score</p>
                  <p className="text-2xl font-bold text-brand-accent-success mt-1">{stats.bestScore}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-brand-accent-success opacity-40" />
              </div>
            </div>
            <div className="rounded-xl border border-brand-accent-ai/20 bg-brand-accent-ai/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-neutral-400 uppercase tracking-wide">Last Role</p>
                  <p className="text-lg font-bold text-brand-accent-ai mt-1">{stats.bestRole}</p>
                </div>
                <Zap className="w-8 h-8 text-brand-accent-ai opacity-40" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Setup Form */}
        <motion.div variants={itemVariants} className="rounded-xl border border-brand-subtle bg-gradient-to-br from-neutral-900/40 to-neutral-800/20 p-6 space-y-6 backdrop-blur-sm">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">Interview Role</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`p-3 rounded-lg border transition-all duration-300 text-sm font-semibold ${
                    selectedRole === role
                      ? 'border-brand-accent-ai bg-brand-accent-ai/20 text-brand-accent-ai'
                      : 'border-neutral-700 bg-neutral-800/40 text-neutral-400 hover:border-brand-accent-ai/50'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">Difficulty Level</label>
            <div className="grid grid-cols-3 gap-3">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`p-3 rounded-lg border transition-all duration-300 text-sm font-semibold capitalize ${
                    selectedDifficulty === diff
                      ? 'border-brand-accent-success bg-brand-accent-success/20 text-brand-accent-success'
                      : 'border-neutral-700 bg-neutral-800/40 text-neutral-400 hover:border-brand-accent-success/50'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">{error}</div>}

          {/* Start Button */}
          <Button
            onClick={startInterview}
            disabled={loading}
            className="w-full bg-brand-accent-ai hover:bg-brand-accent-ai/90 text-white font-bold h-12 rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Starting Interview...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" /> Start Interview
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  if (state === 'interviewing' && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const answerLength = userAnswer.trim().split(/\s+/).length;

    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        {/* Progress Bar */}
        <motion.div variants={itemVariants} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-neutral-400 uppercase tracking-wide font-semibold">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            {feedback && <span className="text-sm font-bold text-brand-accent-ai">Score: {feedback.score}%</span>}
          </div>
          <div className="relative w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-accent-ai to-brand-accent-secondary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Question Card */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-brand-accent-ai/30 bg-gradient-to-br from-neutral-900/60 to-neutral-800/40 p-8 backdrop-blur-sm min-h-[200px] flex flex-col justify-center"
        >
          <div className="space-y-4">
            <div className="flex items-baseline justify-between gap-4">
              <span className="inline-block px-3 py-1 rounded-full bg-brand-accent-ai/20 text-brand-accent-ai text-xs font-bold uppercase tracking-widest">
                {currentQuestion.category}
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white leading-snug">{currentQuestion.question}</h3>
          </div>
        </motion.div>

        {/* Answer Input */}
        <motion.div variants={itemVariants} className="space-y-3">
          <label className="block text-sm font-semibold text-white">Your Answer</label>
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Share your detailed response here. Include specific examples, metrics, and your thought process..."
            className="w-full bg-neutral-900/60 border border-neutral-700 rounded-xl p-4 text-white placeholder-neutral-500 focus:outline-none focus:border-brand-accent-ai/50 focus:ring-1 focus:ring-brand-accent-ai/30 resize-none transition-all min-h-[200px]"
          />
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Aim for 50+ words for detailed responses</span>
            <motion.span animate={{ color: answerLength < 15 ? '#ef4444' : answerLength < 50 ? '#f59e0b' : '#22c55e' }}>
              {answerLength} words
            </motion.span>
          </div>
        </motion.div>

        {/* Feedback Area */}
        {feedback && (
          <motion.div
            variants={itemVariants}
            className="rounded-xl border border-brand-accent-success/30 bg-brand-accent-success/5 p-6 space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-white">Feedback</h4>
              <div className="text-2xl font-bold text-brand-accent-success">{feedback.score}%</div>
            </div>
            <p className="text-neutral-300 text-sm leading-relaxed">{feedback.feedback}</p>
            <div className="text-xs text-neutral-400 flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="text-brand-accent-data">●</span> Overall Interview Score: {feedback.overallScore}%
              </span>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div variants={itemVariants} className="flex gap-3">
          {!feedback ? (
            <Button
              onClick={submitAnswer}
              disabled={loading || userAnswer.trim().length < 10}
              className="flex-1 bg-brand-accent-ai hover:bg-brand-accent-ai/90 text-white font-bold h-12 rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Evaluating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" /> Submit Answer
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={nextQuestion}
                className="flex-1 bg-brand-accent-success hover:bg-brand-accent-success/90 text-white font-bold h-12 rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'View Results'} →
              </Button>
              <Button
                onClick={() => {
                  setUserAnswer('');
                  setFeedback(null);
                }}
                variant="outline"
                className="border-neutral-700 text-neutral-400 hover:text-white hover:bg-white/5 font-bold h-12 rounded-xl w-12 p-0"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </>
          )}
        </motion.div>
      </motion.div>
    );
  }

  if (state === 'complete') {
    const avgScore = answers.length > 0 ? Math.round(answers.reduce((sum, a) => sum + a.score, 0) / answers.length) : 0;
    const highestScore = Math.max(...answers.map((a) => a.score), 0);

    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
        {/* Results Header */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-brand-accent-success/30 bg-gradient-to-br from-brand-accent-success/10 via-neutral-900/50 to-neutral-900/60 p-8 backdrop-blur-sm text-center"
        >
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2 }}>
            <Award className="w-16 h-16 text-brand-accent-success mx-auto mb-4" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-2">Interview Complete!</h2>
          <p className="text-neutral-300 mb-6">Great work. Review your performance below.</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-white/5 p-4 border border-white/10">
              <p className="text-xs text-neutral-400 uppercase mb-1">Average</p>
              <p className="text-2xl font-bold text-brand-accent-success">{avgScore}%</p>
            </div>
            <div className="rounded-lg bg-white/5 p-4 border border-white/10">
              <p className="text-xs text-neutral-400 uppercase mb-1">Best</p>
              <p className="text-2xl font-bold text-brand-accent-ai">{highestScore}%</p>
            </div>
            <div className="rounded-lg bg-white/5 p-4 border border-white/10">
              <p className="text-xs text-neutral-400 uppercase mb-1">Questions</p>
              <p className="text-2xl font-bold text-brand-accent-data">{answers.length}/{questions.length}</p>
            </div>
          </div>
        </motion.div>

        {/* Detailed Breakdown */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h3 className="text-lg font-bold text-white">Question Breakdown</h3>
          {answers.map((answer, i) => (
            <motion.div
              key={i}
              className="rounded-xl border border-neutral-700 bg-neutral-900/40 p-6 space-y-3 hover:border-brand-accent-ai/30 transition-all"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="text-xs font-bold text-brand-accent-data uppercase tracking-widest">{answer.category}</div>
                  <p className="text-white font-semibold">{answer.question}</p>
                </div>
                <motion.div className="text-right flex-shrink-0">
                  <div
                    className={`text-2xl font-bold ${answer.score >= 75 ? 'text-brand-accent-success' : answer.score >= 50 ? 'text-brand-accent-ai' : 'text-orange-400'}`}
                  >
                    {answer.score}%
                  </div>
                </motion.div>
              </div>
              <p className="text-sm text-neutral-300 border-t border-neutral-700 pt-3">{answer.feedback}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex gap-3">
          <Button
            onClick={resetInterview}
            className="flex-1 bg-brand-accent-ai hover:bg-brand-accent-ai/90 text-white font-bold h-12 rounded-xl transition-all hover:scale-105"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Try Another Interview
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  return null;
}

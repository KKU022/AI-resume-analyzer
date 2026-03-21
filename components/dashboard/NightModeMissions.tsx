'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { IMissionProgress } from '@/lib/db/models/MissionProgress';
import Link from 'next/link';

type MissionApiError = {
  error?: string;
  code?: string;
};

interface NightModeMissionsProps {
  onMissionsLoaded?: (missions: IMissionProgress | null) => void;
}

const containerVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
};

export default function NightModeMissions({ onMissionsLoaded }: NightModeMissionsProps) {
  const [missions, setMissions] = useState<IMissionProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingDay, setCompletingDay] = useState<number | null>(null);

  useEffect(() => {
    const loadMissions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/missions');

        if (!response.ok) {
          throw new Error('Failed to fetch missions');
        }

        let data = await response.json();

        // If no missions exist, initialize them
        if (!data.missions || data.missions.length === 0) {
          const initResponse = await fetch('/api/missions', {
            method: 'POST',
          });

          if (!initResponse.ok) {
            const initError = (await initResponse.json().catch(() => ({}))) as MissionApiError;

            // Expected case before first resume analysis: keep UI stable, no hard error.
            if (
              initResponse.status === 400 &&
              typeof initError.error === 'string' &&
              initError.error.toLowerCase().includes('no resume analysis found')
            ) {
              const emptyMissionsState = {
                missions: [],
                currentStreak: 0,
                longestStreak: 0,
                lastCompletedDate: null,
              } as unknown as IMissionProgress;

              setMissions(emptyMissionsState);
              setError(null);
              onMissionsLoaded?.(emptyMissionsState);
              return;
            }

            throw new Error(initError.error || 'Failed to initialize missions');
          }

          data = await initResponse.json();
        }

        setMissions(data);
        onMissionsLoaded?.(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error loading missions:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMissions();
  }, [onMissionsLoaded]);

  const handleMissionComplete = async (dayIndex: number) => {
    if (completingDay !== null) return;

    try {
      setCompletingDay(dayIndex);

      const response = await fetch('/api/missions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayIndex }),
      });

      if (!response.ok) {
        throw new Error('Failed to update mission');
      }

      const updatedMissions = await response.json();
      setMissions(updatedMissions);
    } catch (err) {
      console.error('Error completing mission:', err);
    } finally {
      setCompletingDay(null);
    }
  };

  if (loading) {
    return (
      <motion.div
        className="rounded-xl border border-brand-subtle bg-linear-to-br from-slate-50 to-white p-6 backdrop-blur-sm dark:from-neutral-900/50 dark:to-neutral-900/30"
        variants={itemVariants}
      >
        <div className="h-96 flex items-center justify-center">
          <motion.div
            className="text-center"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-sm text-slate-600 dark:text-neutral-400">Initializing Night Mode...</div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (error || !missions) {
    return (
      <motion.div
        className="rounded-xl border border-red-500/30 bg-red-50 p-6 dark:border-red-500/20 dark:bg-red-500/5"
        variants={itemVariants}
      >
        <div className="text-sm text-red-700 dark:text-red-400">
          {error || 'Failed to load missions. Please try again.'}
        </div>
      </motion.div>
    );
  }

  const completedCount = (missions.missions || []).filter((m) => m.completed).length;
  const completionPercentage = missions.missions ? (completedCount / missions.missions.length) * 100 : 0;
  const hasNoMissionPlan = !missions.missions || missions.missions.length === 0;

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header with Streak Stats */}
      <motion.div
        className="rounded-xl border border-brand-subtle bg-linear-to-br from-slate-50 via-cyan-50/60 to-white p-6 backdrop-blur-sm dark:from-neutral-900/50 dark:via-indigo-900/20 dark:to-neutral-900/50"
        variants={itemVariants}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              🌙 Night Mode Missions
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-neutral-400">7-day career acceleration plan</p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-accent-ai">{missions.currentStreak}</div>
              <div className="text-xs uppercase tracking-wide text-slate-600 dark:text-neutral-400">Day Streak</div>
            </div>
            <div className="w-px bg-slate-300 dark:bg-neutral-700" />
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-accent-success">{missions.longestStreak}</div>
              <div className="text-xs uppercase tracking-wide text-slate-600 dark:text-neutral-400">Best Streak</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-neutral-400">
            <span>Weekly Progress</span>
            <span>
              {completedCount}/{missions.missions?.length || 0}
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-neutral-800">
            <motion.div
              className="h-full rounded-full bg-linear-to-r from-brand-accent-ai via-brand-accent-secondary to-brand-accent-success"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </motion.div>

      {hasNoMissionPlan ? (
        <motion.div
          className="rounded-lg border border-brand-accent-ai/25 bg-cyan-50 p-6 dark:border-brand-accent-ai/20 dark:bg-brand-accent-ai/5"
          variants={itemVariants}
        >
          <div className="space-y-4 text-center">
            <p className="text-sm text-slate-700 dark:text-neutral-300">
              Upload and analyze your resume to unlock your personalized 7-day Night Mode Missions.
            </p>
            <Link
              href="/dashboard/upload"
              className="inline-flex items-center rounded-lg border border-brand-accent-ai/35 bg-brand-accent-ai/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-cyan-800 transition-colors hover:bg-brand-accent-ai/25 dark:bg-brand-accent-ai/10 dark:text-brand-accent-data dark:hover:bg-brand-accent-ai/20"
            >
              Upload Resume To Unlock
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.div className="grid grid-cols-1 gap-4 md:grid-cols-2" variants={containerVariants}>
          {missions.missions?.map((mission, index) => (
            <motion.div
              key={index}
              className={`relative rounded-lg border p-4 transition-all duration-300 ${
                mission.completed
                  ? 'border-brand-accent-success/40 bg-emerald-50 dark:bg-brand-accent-success/5'
                    : 'border-brand-subtle bg-linear-to-br from-white to-slate-50 hover:border-brand-accent-ai/40 dark:from-neutral-900/40 dark:to-neutral-800/20'
              }`}
              variants={itemVariants}
              whileHover={!mission.completed ? { scale: 1.02 } : undefined}
            >
              {/* Glow effect for active missions */}
              {!mission.completed && (
                <motion.div
                  className="absolute inset-0 rounded-lg bg-brand-accent-ai/10 -z-10 blur-xl"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              )}

              <div className="flex gap-4">
                {/* Checkbox */}
                <div className="shrink-0 pt-1">
                  <button
                    onClick={() => handleMissionComplete(index)}
                    disabled={completingDay !== null}
                    className={`relative flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      mission.completed
                        ? 'border-brand-accent-success bg-brand-accent-success'
                        : 'border-slate-400 hover:border-brand-accent-ai dark:border-neutral-600'
                    } disabled:opacity-50`}
                  >
                    {mission.completed && (
                      <motion.svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </motion.svg>
                    )}
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div
                        className={`text-sm font-semibold transition-colors duration-300 ${
                          mission.completed ? 'text-brand-accent-success line-through' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        Day {mission.day}: {mission.title}
                      </div>
                      <p className="mt-1 text-xs leading-snug text-slate-600 dark:text-neutral-400">
                        {mission.description}
                      </p>
                    </div>
                  </div>

                  {/* Completion timestamp */}
                  {mission.completed && mission.completedAt && (
                    <div className="mt-2 text-xs text-emerald-700 dark:text-brand-accent-success/60">
                      ✓ Completed {new Date(mission.completedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Motivational Footer */}
      {completedCount > 0 && (
        <motion.div
          className="rounded-lg border border-brand-accent-ai/25 bg-cyan-50 p-4 text-center dark:border-brand-accent-ai/20 dark:bg-brand-accent-ai/5"
          variants={itemVariants}
        >
          <p className="text-sm text-slate-700 dark:text-neutral-300">
            {completedCount === 1 && "🚀 Great start! Keep the momentum going."}
            {completedCount > 1 && completedCount < 7 && `✨ ${completedCount} missions complete! You're on fire!`}
            {completedCount === 7 && "🏆 LEGENDARY! You completed the entire 7-day plan. Ready for the next cycle?"}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

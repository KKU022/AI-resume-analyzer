'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const SOURCE_FRAME_COUNT = 176;
const TARGET_FRAME_COUNT = SOURCE_FRAME_COUNT;
const DEFAULT_PLAYBACK_FPS = 30;
const MAX_PLAYBACK_FPS = 60;
const MIN_PLAYBACK_FPS = 24;
const PLAYBACK_RATE = 0.75;
const FRAME_INTERVAL_MS = 1000 / DEFAULT_PLAYBACK_FPS;
const INITIAL_PRELOAD_COUNT = 40;
const FPS_SAMPLE_SIZE = 45;

export default function HeroFrameAnimation() {
  const [currentFrame, setCurrentFrame] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);
  const lastRafTimeRef = useRef(0);
  const fpsSampleTotalRef = useRef(0);
  const fpsSampleCountRef = useRef(0);
  const currentFpsRef = useRef(DEFAULT_PLAYBACK_FPS);
  const frameIntervalRef = useRef(FRAME_INTERVAL_MS);
  const frameProgressRef = useRef(0);

  const frames = useMemo(() => {
    const step = Math.max(1, Math.floor(SOURCE_FRAME_COUNT / TARGET_FRAME_COUNT));

    return Array.from({ length: TARGET_FRAME_COUNT }, (_, index) => {
      const sourceIndex = 1 + index * step;
      const padded = Math.min(sourceIndex, SOURCE_FRAME_COUNT).toString().padStart(3, '0');
      return `/animation/ezgif-frame-${padded}.jpg`;
    });
  }, []);

  useEffect(() => {
    const preload = (sources: string[]) => {
      sources.forEach((src) => {
        const img = new window.Image();
        img.decoding = 'async';
        img.src = src;
      });
    };

    preload(frames.slice(0, INITIAL_PRELOAD_COUNT));

    const loadRemainingFrames = () => {
      preload(frames.slice(INITIAL_PRELOAD_COUNT));
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (cb: IdleRequestCallback) => number })
        .requestIdleCallback(loadRemainingFrames);
    } else {
      setTimeout(loadRemainingFrames, 0);
    }
  }, [frames]);

  useEffect(() => {
    const setPlaybackFps = (fps: number) => {
      const clamped = Math.max(MIN_PLAYBACK_FPS, Math.min(MAX_PLAYBACK_FPS, fps));
      currentFpsRef.current = clamped;
      frameIntervalRef.current = 1000 / clamped;
    };

    const navigatorWithMemory = navigator as Navigator & { deviceMemory?: number };
    const coreCount = navigatorWithMemory.hardwareConcurrency ?? 4;
    const deviceMemory = navigatorWithMemory.deviceMemory ?? 4;

    // Start at 60 FPS on stronger devices, otherwise start at stable 30 FPS.
    if (coreCount >= 8 && deviceMemory >= 8) {
      setPlaybackFps(MAX_PLAYBACK_FPS);
    } else {
      setPlaybackFps(DEFAULT_PLAYBACK_FPS);
    }

    const animate = (time: number) => {
      if (document.visibilityState !== 'visible') {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      if (lastRafTimeRef.current !== 0) {
        const rafDelta = time - lastRafTimeRef.current;
        fpsSampleTotalRef.current += rafDelta;
        fpsSampleCountRef.current += 1;

        if (fpsSampleCountRef.current >= FPS_SAMPLE_SIZE) {
          const avgDelta = fpsSampleTotalRef.current / fpsSampleCountRef.current;

          // Adaptive policy:
          // 1) Upgrade toward 60 FPS when frame pacing is smooth.
          // 2) Fallback to 24 FPS when pacing is unstable.
          if (avgDelta <= 18 && currentFpsRef.current < MAX_PLAYBACK_FPS) {
            setPlaybackFps(MAX_PLAYBACK_FPS);
          } else if (avgDelta > 30 && currentFpsRef.current !== MIN_PLAYBACK_FPS) {
            setPlaybackFps(MIN_PLAYBACK_FPS);
          } else if (
            avgDelta > 22 &&
            avgDelta <= 30 &&
            currentFpsRef.current !== DEFAULT_PLAYBACK_FPS
          ) {
            setPlaybackFps(DEFAULT_PLAYBACK_FPS);
          }

          fpsSampleTotalRef.current = 0;
          fpsSampleCountRef.current = 0;
        }
      }
      lastRafTimeRef.current = time;

      if (lastTickRef.current === 0) {
        lastTickRef.current = time;
      }

      const elapsed = time - lastTickRef.current;
      if (elapsed >= frameIntervalRef.current) {
        const rawFrames = elapsed / frameIntervalRef.current;
        frameProgressRef.current += rawFrames * PLAYBACK_RATE;

        const framesToAdvance = Math.floor(frameProgressRef.current);
        if (framesToAdvance > 0) {
          frameProgressRef.current -= framesToAdvance;
          setCurrentFrame((prev) => (prev + framesToAdvance) % frames.length);
        }

        lastTickRef.current = time;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        lastTickRef.current = 0;
        lastRafTimeRef.current = 0;
        fpsSampleTotalRef.current = 0;
        fpsSampleCountRef.current = 0;
        frameProgressRef.current = 0;
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [frames.length]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl">
      <motion.div
        initial={{ opacity: 0.72, scale: 0.992 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="absolute inset-0"
      >
        <Image
          src={frames[currentFrame]}
          alt="AI Animation"
          fill
          priority
          unoptimized
          sizes="(max-width: 1024px) 100vw, 520px"
          className="object-cover"
        />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050a16]/45 via-transparent to-[#0ea5e9]/10"
        animate={{ opacity: [0.45, 0.62, 0.45] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

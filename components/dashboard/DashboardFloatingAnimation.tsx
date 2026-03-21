'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const VIDEO_SRC = '/dashboard-animation/ai-loop.mp4';
const FRAME_COUNT = 168;
const FALLBACK_FPS = 20;
const FRAME_INTERVAL_MS = 1000 / FALLBACK_FPS;

export default function DashboardFloatingAnimation() {
  const [useFrameFallback, setUseFrameFallback] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);

  const frames = useMemo(
    () =>
      Array.from({ length: FRAME_COUNT }, (_, index) => {
        const padded = (index + 1).toString().padStart(3, '0');
        return `/dashboard-animation/ezgif-frame-${padded}.jpg`;
      }),
    []
  );

  useEffect(() => {
    if (!useFrameFallback) {
      return;
    }

    const animate = (time: number) => {
      if (lastTickRef.current === 0) {
        lastTickRef.current = time;
      }

      const elapsed = time - lastTickRef.current;
      if (elapsed >= FRAME_INTERVAL_MS) {
        const framesToAdvance = Math.max(1, Math.floor(elapsed / FRAME_INTERVAL_MS));
        setFrameIndex((prev) => (prev + framesToAdvance) % frames.length);
        lastTickRef.current = time;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      lastTickRef.current = 0;
    };
  }, [frames.length, useFrameFallback]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed bottom-4 right-4 z-5 w-[clamp(150px,16vw,220px)] opacity-70 md:bottom-6 md:right-6"
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="overflow-hidden rounded-xl border border-brand-accent-data/20 bg-[#0b1120]/25 shadow-[0_0_18px_rgba(56,189,248,0.16)] backdrop-blur-[0.5px]">
        {useFrameFallback ? (
          <div className="relative aspect-video w-full">
            <Image
              src={frames[frameIndex]}
              alt=""
              fill
              unoptimized
              loading="lazy"
              sizes="(max-width: 768px) 200px, (max-width: 1200px) 240px, 300px"
              className="object-cover"
            />
          </div>
        ) : (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            onError={() => setUseFrameFallback(true)}
            className="h-full w-full object-cover"
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>
        )}
      </div>
    </motion.div>
  );
}

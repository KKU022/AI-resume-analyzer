'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const SOURCE_FRAME_COUNT = 176;
const TARGET_FRAME_COUNT = 58;
const FRAME_INTERVAL_MS = 120;

export default function HeroFrameAnimation() {
  const [currentFrame, setCurrentFrame] = useState(0);

  const frames = useMemo(() => {
    const step = Math.max(1, Math.floor(SOURCE_FRAME_COUNT / TARGET_FRAME_COUNT));

    return Array.from({ length: TARGET_FRAME_COUNT }, (_, index) => {
      const sourceIndex = 1 + index * step;
      const padded = Math.min(sourceIndex, SOURCE_FRAME_COUNT).toString().padStart(3, '0');
      return `/animation/ezgif-frame-${padded}.jpg`;
    });
  }, []);

  useEffect(() => {
    const preload = frames.slice(0, 12);
    preload.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, [frames]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, FRAME_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [frames.length]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl">
      <motion.div
        key={frames[currentFrame]}
        initial={{ opacity: 0.72, scale: 0.992 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="absolute inset-0"
      >
        <Image
          src={frames[currentFrame]}
          alt="AI Animation"
          fill
          priority={currentFrame === 0}
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

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useScroll, useTransform, useSpring } from 'framer-motion';

const TOTAL_FRAMES = 192;
const INITIAL_FRAME_PRELOAD = 4;
const BACKGROUND_LOAD_CONCURRENCY = 4;
const FRAME_BASE_URL = '/frames/ezgif-frame-';
const FRAME_EXTENSION = '.jpg';

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<Array<HTMLImageElement | null>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const loadedCountRef = useRef(0);

  const { scrollYProgress } = useScroll();
  
  // Smooth out the scroll progress with spring physics
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Map scroll progress (0-1) to frame index (0-191)
  const frameIndex = useTransform(smoothProgress, [0, 1], [0, TOTAL_FRAMES - 1]);

  // Preload the first frames only, then lazy-load the remainder.
  useEffect(() => {
    let cancelled = false;
    let idleId: number | null = null;

    imagesRef.current = Array.from({ length: TOTAL_FRAMES }, () => null);

    const loadFrame = (index: number) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        const frameNum = (index + 1).toString().padStart(3, '0');
        img.src = `${FRAME_BASE_URL}${frameNum}${FRAME_EXTENSION}`;
        img.onload = () => {
          if (cancelled) {
            resolve();
            return;
          }
          imagesRef.current[index] = img;
          loadedCountRef.current += 1;

          // Avoid re-rendering for every single frame during background loading.
          if (
            loadedCountRef.current <= INITIAL_FRAME_PRELOAD ||
            loadedCountRef.current % 8 === 0 ||
            loadedCountRef.current === TOTAL_FRAMES
          ) {
            setLoadProgress(
              Math.floor((loadedCountRef.current / TOTAL_FRAMES) * 100)
            );
          }
          resolve();
        };
        img.onerror = () => reject(new Error(`Failed to load frame ${frameNum}`));
      });
    };

    const preloadInitialFrames = async () => {
      const initialCount = Math.min(INITIAL_FRAME_PRELOAD, TOTAL_FRAMES);
      try {
        await Promise.all(
          Array.from({ length: initialCount }, (_, i) => loadFrame(i))
        );
        if (cancelled) {
          return;
        }
        setIsLoading(false);
        renderFrame(0);

        const loadBackgroundFrames = async () => {
          const remainingFrames = Array.from(
            { length: TOTAL_FRAMES - initialCount },
            (_, i) => i + initialCount
          );

          for (let i = 0; i < remainingFrames.length; i += BACKGROUND_LOAD_CONCURRENCY) {
            const batch = remainingFrames.slice(i, i + BACKGROUND_LOAD_CONCURRENCY);
            await Promise.allSettled(batch.map((idx) => loadFrame(idx)));
            if (cancelled) {
              break;
            }
          }
        };

        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          idleId = (window as Window & { requestIdleCallback: (cb: IdleRequestCallback) => number })
            .requestIdleCallback(() => {
            void loadBackgroundFrames();
          });
        } else {
          setTimeout(() => {
            void loadBackgroundFrames();
          }, 0);
        }
      } catch (error) {
        console.error('Failed to preload initial frames:', error);
      }
    };

    preloadInitialFrames();

    return () => {
      cancelled = true;
      if (idleId !== null && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
      }
    };
  }, []);

  // Set up resize handler
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      renderFrame(Math.floor(frameIndex.get()));
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [frameIndex]);

  // Render function
  const renderFrame = (index: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const clampedIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, index));
    const frame = imagesRef.current[clampedIndex];

    if (!context || !frame) return;

    const img = frame;
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgRatio;
      offsetX = 0;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      drawWidth = canvas.height * imgRatio;
      drawHeight = canvas.height;
      offsetX = (canvas.width - drawWidth) / 2;
      offsetY = 0;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  // Update frame on scroll
  useEffect(() => {
    let rafId = 0;
    const unsubscribe = frameIndex.onChange((v) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        renderFrame(Math.floor(v));
      });
    });
    return () => {
      cancelAnimationFrame(rafId);
      unsubscribe();
    };
  }, [frameIndex]);

  return (
    <div className="fixed inset-0 w-full h-screen z-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
      />
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B1120] z-50">
          <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#6366F1] transition-all duration-300" 
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <p className="mt-4 text-xs font-mono text-[#38BDF8] uppercase tracking-widest animate-pulse">
            Initializing AI Neural System... {loadProgress}%
          </p>
        </div>
      )}
      {/* Background Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1120]/80 via-transparent to-[#0B1120]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120]/60 via-transparent to-[#0B1120]/60" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,rgba(99,102,241,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Floating Particles Effect (simplified version for the canvas section) */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6366F1]/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#38BDF8]/10 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>
    </div>
  );
}

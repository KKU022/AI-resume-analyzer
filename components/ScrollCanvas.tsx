'use client';

import { useEffect, useRef, useState } from 'react';
import { useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';

const TOTAL_FRAMES = 192; // ezgif-frame-001.jpg to ezgif-frame-192.jpg

export default function ScrollCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { scrollYProgress } = useScroll();
  
  // Add smooth spring physics to the scroll
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Map 0-1 scroll progress to 1-192 frame index
  const frameIndex = useTransform(smoothProgress, [0, 1], [1, TOTAL_FRAMES]);

  // Preload all frames on mount
  useEffect(() => {
    let loadedCount = 0;
    const loadedImages: HTMLImageElement[] = [];

    const loadImages = async () => {
      for (let i = 1; i <= TOTAL_FRAMES; i++) {
        const img = new Image();
        // Pad with leading zeros: 1 -> 001, 12 -> 012, etc.
        const paddedIndex = i.toString().padStart(3, '0');
        img.src = `/frames/ezgif-frame-${paddedIndex}.jpg`;
        
        img.onload = () => {
          loadedCount++;
          if (loadedCount === TOTAL_FRAMES) {
            setImages(loadedImages);
            setIsLoaded(true);
            // Draw first frame immediately
            drawFrame(1, loadedImages);
          }
        };
        // Store in array by index (0-based)
        loadedImages[i - 1] = img;
      }
    };

    loadImages();
  }, []);

  // Update canvas when frameIndex changes
  useMotionValueEvent(frameIndex, "change", (latest) => {
    if (isLoaded && images.length > 0) {
      // Round to nearest integer to get actual frame
      const frameToDraw = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(latest)));
      drawFrame(frameToDraw, images);
    }
  });

  const drawFrame = (frameNum: number, imgArray: HTMLImageElement[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get the image from the array (0-indexed)
    const img = imgArray[frameNum - 1];
    
    // Ensure image exists and is fully loaded
    if (!img || !img.complete || img.naturalWidth === 0) return;

    // Responsive scaling: cover the canvas
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;
    
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      drawHeight = canvas.width / imgRatio;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      drawWidth = canvas.height * imgRatio;
      offsetX = (canvas.width - drawWidth) / 2;
    }

    // Optional: add a dark tint overlay to make text more readable
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Darken the image output by setting global alpha or blending
    ctx.globalAlpha = 0.4; // 40% opacity for the video frames so UI stands out
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    
    // Reset alpha
    ctx.globalAlpha = 1.0;
  };

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Redraw current frame
        if (isLoaded && images.length > 0) {
          const currentFrame = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(frameIndex.get())));
          drawFrame(currentFrame, images);
        }
      }
    };

    handleResize(); // Initial sizing
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isLoaded, images, frameIndex]);

  return (
    <div className="fixed inset-0 z-0 h-[100vh] w-full bg-brand-primary overflow-hidden pointer-events-none">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-brand-primary z-10 text-brand-accent-ai animate-pulse">
          <span className="font-space-grotesk tracking-widest text-sm uppercase">Loading AI Synthetics...</span>
        </div>
      )}
      <canvas 
        ref={canvasRef} 
        className="block h-full w-full object-cover mix-blend-screen" 
      />
    </div>
  );
}

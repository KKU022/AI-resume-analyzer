'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6366F1] to-[#38BDF8] z-[110] origin-left shadow-[0_0_10px_rgba(99,102,241,0.5)]"
      style={{ scaleX }}
    />
  );
}

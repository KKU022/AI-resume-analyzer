'use client';

import React, { useEffect, useRef, useState } from 'react';

type DeferredSectionProps = {
  children: React.ReactNode;
  minHeightClassName?: string;
  rootMargin?: string;
};

export default function DeferredSection({
  children,
  minHeightClassName = 'min-h-[320px]',
  rootMargin = '600px',
}: DeferredSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || isVisible) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin, threshold: 0.01 }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  return <div ref={containerRef} className={minHeightClassName}>{isVisible ? children : null}</div>;
}
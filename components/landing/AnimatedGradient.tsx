'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface AnimatedGradientProps {
  className?: string;
}

export default function AnimatedGradient({ className = '' }: AnimatedGradientProps) {
  const gradientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const gradient = gradientRef.current;
    if (!gradient) return;

    const colors = [
      'from-blue-500/20 via-purple-500/20 to-pink-500/20',
      'from-green-500/20 via-blue-500/20 to-purple-500/20',
      'from-purple-500/20 via-pink-500/20 to-blue-500/20',
      'from-pink-500/20 via-blue-500/20 to-green-500/20',
    ];

    let currentIndex = 0;

    const animateGradient = () => {
      gsap.to(gradient, {
        duration: 3,
        ease: 'power2.inOut',
        onComplete: () => {
          currentIndex = (currentIndex + 1) % colors.length;
          gradient.className = `absolute inset-0 bg-gradient-to-br ${colors[currentIndex]} blur-3xl ${className}`;
          animateGradient();
        },
      });
    };

    animateGradient();
  }, [className]);

  return (
    <div
      ref={gradientRef}
      className={`absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl ${className}`}
    />
  );
}


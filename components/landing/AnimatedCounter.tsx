'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export default function AnimatedCounter({
  value,
  duration = 2,
  prefix = '',
  suffix = '',
  decimals = 2,
}: AnimatedCounterProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        if (node) {
          node.textContent = `${prefix}${obj.val.toFixed(decimals)}${suffix}`;
        }
      },
    });
  }, [value, duration, prefix, suffix, decimals]);

  return <span ref={nodeRef}>0</span>;
}


'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  trend?: 'up' | 'down';
  trendValue?: string;
  delay?: number;
}

export default function StatsCard({
  icon: Icon,
  label,
  value,
  prefix = '',
  suffix = '',
  decimals = 2,
  trend,
  trendValue,
  delay = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900">
          <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </div>
        {trend && trendValue && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded ${
              trend === 'up'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{label}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        <AnimatedCounter
          value={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
        />
      </p>
    </motion.div>
  );
}


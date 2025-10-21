'use client';

import Link from 'next/link';
import { TrendingUp, BarChart3, Calendar, Sparkles } from 'lucide-react';

export default function NiftyQuickAccess() {
  return (
    <Link href="/nifty" className="block">
      <div className="group relative overflow-hidden rounded-lg border border-black/10 dark:border-white/10 p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 hover:shadow-lg transition-all duration-300">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Content */}
        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-600 text-white">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Nifty 50 Analysis
              </h3>
            </div>
            <span className="px-2 py-1 text-xs font-semibold bg-green-500 text-white rounded-full">
              NEW
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-black/70 dark:text-white/70 mb-4">
            Explore 17+ years of Nifty 50 historical data with advanced candlestick charts and technical indicators
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="flex flex-col items-center text-center p-3 rounded-lg bg-white/50 dark:bg-black/20">
              <BarChart3 className="w-4 h-4 mb-1 text-blue-600" />
              <span className="text-xs font-medium">Advanced Charts</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-lg bg-white/50 dark:bg-black/20">
              <Calendar className="w-4 h-4 mb-1 text-purple-600" />
              <span className="text-xs font-medium">4,400+ Days</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-lg bg-white/50 dark:bg-black/20">
              <Sparkles className="w-4 h-4 mb-1 text-pink-600" />
              <span className="text-xs font-medium">Live Indicators</span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-black/60 dark:text-white/60">
              <span className="font-semibold">Since 2007</span> • No login required
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
              View Charts
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </Link>
  );
}


'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import {
  TrendingUp,
  BarChart3,
  Zap,
  Shield,
  Clock,
  DollarSign,
  Activity,
  PieChart,
  LineChart,
  ArrowRight,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Globe,
  Lock,
  Cpu,
} from 'lucide-react';
import Link from 'next/link';
import StatsCard from '@/components/landing/StatsCard';
import MiniChart from '@/components/landing/MiniChart';
import AnimatedLineChart from '@/components/landing/AnimatedLineChart';
import AnimatedAreaChart from '@/components/landing/AnimatedAreaChart';
import AnimatedBarChart from '@/components/landing/AnimatedBarChart';
import CandlestickChart from '@/components/landing/CandlestickChart';
import ThemeToggle from '@/components/ThemeToggle';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  // Generate sample data for charts
  const generateChartData = (points = 30) => {
    return Array.from({ length: points }, (_, i) => {
      return 100 + Math.sin(i / 3) * 20 + Math.random() * 10;
    });
  };

  const [chartData1] = useState(generateChartData());
  const [chartData2] = useState(generateChartData());
  const [chartData3] = useState(generateChartData());

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-title', {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out',
      });

      gsap.from('.hero-subtitle', {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 0.2,
        ease: 'power3.out',
      });

      gsap.from('.hero-buttons', {
        opacity: 0,
        y: 20,
        duration: 1,
        delay: 0.4,
        ease: 'power3.out',
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Execute trades in milliseconds with our high-performance infrastructure',
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your data and funds are protected with enterprise-grade encryption',
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Make informed decisions with real-time charts and technical indicators',
    },
    {
      icon: Globe,
      title: 'Multi-Exchange',
      description: 'Trade across NSE, BSE, and derivatives markets from one platform',
    },
    {
      icon: Cpu,
      title: 'AI-Powered Insights',
      description: 'Get intelligent trade suggestions powered by machine learning',
    },
    {
      icon: Lock,
      title: 'Risk Management',
      description: 'Built-in tools to manage risk and protect your portfolio',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Nidhi Nivesh
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="#features"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                Features
              </Link>
              <Link
                href="#analytics"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                Analytics
              </Link>
              <Link
                href="#pricing"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                Pricing
              </Link>
              <ThemeToggle />
              <Link
                href="/kite-accounts"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </div>

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 dark:border-gray-800"
          >
            <div className="px-6 py-4 space-y-4">
              <Link href="#features" className="block text-gray-600 dark:text-gray-400">
                Features
              </Link>
              <Link href="#analytics" className="block text-gray-600 dark:text-gray-400">
                Analytics
              </Link>
              <Link href="#pricing" className="block text-gray-600 dark:text-gray-400">
                Pricing
              </Link>
              <Link
                href="/kite-accounts"
                className="block px-4 py-2 bg-blue-600 text-white rounded-lg text-center"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ opacity, scale }}
        className="relative pt-32 pb-20 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 mb-6"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Next-Gen Trading Platform</span>
              </motion.div>

              <h1 className="hero-title text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
                Trade Smarter,
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Not Harder
                </span>
              </h1>

              <p className="hero-subtitle text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Experience the future of trading with real-time analytics, AI-powered
                insights, and lightning-fast execution. Start trading with confidence.
              </p>

              <div className="hero-buttons flex flex-wrap gap-4">
                <Link
                  href="/kite-accounts"
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
                >
                  <span>Start Trading</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button className="px-8 py-4 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors">
                  Watch Demo
                </button>
              </div>
            </div>

            <div className="relative">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl"></div>
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        Live Market
                      </span>
                    </div>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                      Live
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        NIFTY 50
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        19,847.50
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        +0.85%
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        SENSEX
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        66,589.93
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        +0.72%
                      </p>
                    </div>
                  </div>

                  <div className="h-48 rounded-lg bg-gray-50 dark:bg-gray-950 p-4 border border-gray-200 dark:border-gray-800">
                    <MiniChart data={chartData1} color="#3b82f6" height={160} />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gray-100 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              icon={DollarSign}
              label="Trading Volume"
              value={2.4}
              suffix="B+"
              decimals={1}
              trend="up"
              trendValue="12%"
              delay={0}
            />
            <StatsCard
              icon={Activity}
              label="Active Traders"
              value={150000}
              suffix="+"
              decimals={0}
              trend="up"
              trendValue="8%"
              delay={0.1}
            />
            <StatsCard
              icon={Clock}
              label="Avg. Execution Time"
              value={0.15}
              suffix="s"
              decimals={2}
              delay={0.2}
            />
            <StatsCard
              icon={PieChart}
              label="Success Rate"
              value={98.7}
              suffix="%"
              decimals={1}
              trend="up"
              trendValue="2%"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Built for traders who demand the best. Our platform combines power,
              simplicity, and intelligence.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group relative p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 w-fit mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                <ChevronRight className="absolute top-6 right-6 w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Preview Section */}
      <section id="analytics" className="py-20 px-6 bg-gray-100 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Live Trading Analytics
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Real-time charts with live data updates, candlestick patterns, and market insights.
            </p>
          </motion.div>

          {/* Main Trading Dashboard */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Live Candlestick Chart
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Real-time price action
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Live</span>
                </div>
              </div>
              <CandlestickChart height={320} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Portfolio Performance
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Growth over time
                  </p>
                </div>
                <LineChart className="w-5 h-5 text-green-600" />
              </div>
              <AnimatedAreaChart color="#10b981" height={320} />
            </motion.div>
          </div>

          {/* Secondary Charts Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0, duration: 0.5 }}
              className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    Price Movement
                  </span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Real-time updates
                  </p>
                </div>
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <AnimatedLineChart color="#3b82f6" height={200} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    Trading Volume
                  </span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Monthly trends
                  </p>
                </div>
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <AnimatedBarChart color="#8b5cf6" height={200} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    Market Depth
                  </span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Live order flow
                  </p>
                </div>
                <PieChart className="w-5 h-5 text-orange-600" />
              </div>
              <AnimatedLineChart color="#f97316" height={200} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-12 text-center"
          >
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Start Trading?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of traders who trust Nidhi Nivesh for their daily trading
                needs.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/kite-accounts"
                  className="px-8 py-4 bg-white hover:bg-gray-100 text-blue-600 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button className="px-8 py-4 border-2 border-white hover:bg-white/10 text-white rounded-lg font-medium transition-colors">
                  Contact Sales
                </button>
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 to-purple-600/50 backdrop-blur-3xl"></div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Nidhi Nivesh
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Next-generation trading platform for modern traders.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Product
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link href="#" className="hover:text-gray-900 dark:hover:text-gray-100">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900 dark:hover:text-gray-100">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900 dark:hover:text-gray-100">
                    API
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Company
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link href="#" className="hover:text-gray-900 dark:hover:text-gray-100">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900 dark:hover:text-gray-100">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900 dark:hover:text-gray-100">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Legal
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link href="#" className="hover:text-gray-900 dark:hover:text-gray-100">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900 dark:hover:text-gray-100">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900 dark:hover:text-gray-100">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>© 2024 Nidhi Nivesh. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


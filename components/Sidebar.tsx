'use client';

import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  ShoppingCart,
  Eye,
  Clock,
  Activity,
  BarChart3,
  Calculator,
  PieChart,
  FileText,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/kite-accounts', label: 'Kite Accounts', icon: Users },
    { path: '/positions', label: 'Positions', icon: TrendingUp },
    { path: '/holdings', label: 'Holdings', icon: Wallet },
    { path: '/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/watchlist', label: 'Watchlist', icon: Eye },
    { path: '/nifty', label: 'Nifty Chart', icon: BarChart3 },
    { path: '/historical', label: 'Historical', icon: Clock },
    { path: '/live', label: 'Live Market', icon: Activity },
    { path: '/margins', label: 'Margins', icon: Calculator },
    { path: '/mf', label: 'Mutual Funds', icon: PieChart },
    { path: '/reports', label: 'Reports', icon: FileText },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <motion.div
        initial={false}
        animate={{ width: isCollapsed ? 64 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-screen bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 z-50 overflow-hidden"
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-2"
              >
                <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Nidhi Nivesh
                </h1>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <motion.button
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all mb-1 group relative ${
                  active
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 w-1 h-8 bg-blue-600 dark:bg-blue-400 rounded-r"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon
                  className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-all group-hover:scale-110 ${
                    active ? 'text-blue-600 dark:text-blue-400' : ''
                  }`}
                />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-3">
          <div className={`flex ${isCollapsed ? 'justify-center' : 'items-center'}`}>
            <ThemeToggle />
          </div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: isCollapsed ? 1.1 : 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center' : 'space-x-2'
            } px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all group`}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} group-hover:scale-110 transition-transform`} />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>

    </>
  );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <nav className="border-b border-black/10 dark:border-white/10 bg-white text-black dark:bg-black dark:text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="text-xl font-bold">
            NIDHI NIVESH
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <Link href="/nifty" className="hover:underline font-medium text-blue-600 dark:text-blue-400">
              Nifty 50
            </Link>
            <Link href="/watchlist" className="hover:underline">Watchlist</Link>
            <Link href="/mf" className="hover:underline">Mutual Funds</Link>
            <Link href="/margins" className="hover:underline font-medium text-purple-600 dark:text-purple-400">
              Margins
            </Link>
            <Link href="/historical" className="hover:underline">Historical</Link>
            <Link href="/live" className="hover:underline">Live</Link>
            <Link href="/accounts" className="hover:underline">
              Accounts
            </Link>
            <Link href="/kite-accounts" className="hover:underline font-medium text-indigo-600 dark:text-indigo-400">
              Kite Accounts
            </Link>
            <Link href="/positions" className="hover:underline">
              Positions
            </Link>
            <Link href="/holdings" className="hover:underline">
              Holdings
            </Link>
            <Link href="/orders" className="hover:underline">
              Orders
            </Link>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="ml-2 inline-flex h-9 items-center justify-center rounded-md border border-black/10 dark:border-white/20 px-3 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [loginUrl, setLoginUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLoginUrl();
  }, []);

  const fetchLoginUrl = async () => {
    try {
      const response = await fetch('/api/auth/login');
      const data = await response.json();
      setLoginUrl(data.url);
    } catch (error) {
      console.error('Error fetching login URL:', error);
    }
  };

  const handleLogin = () => {
    if (loginUrl) {
      setLoading(true);
      window.location.href = loginUrl;
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-black rounded-lg border border-black/10 dark:border-white/10 p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
            NIDHI NIVESH
          </h1>
          <p className="text-black/60 dark:text-white/60">
            Connect your Zerodha account to start trading
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg p-4 border border-black/10 dark:border-white/10">
            <h2 className="font-semibold mb-2">Features:</h2>
            <ul className="text-sm space-y-1">
              <li>• Real-time market data with WebSocket</li>
              <li>• View positions and holdings</li>
              <li>• Place and manage orders</li>
              <li>• Monitor account margins</li>
              <li>• Live ticker updates</li>
              <li>• <a href="/nifty" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Nifty 50 Historical Charts</a></li>
            </ul>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading || !loginUrl}
            className="w-full border border-black/10 dark:border-white/20 bg-black text-white dark:bg.white dark:text-black font-semibold py-3 px-6 rounded-md disabled:opacity-50"
          >
            {loading ? 'Redirecting...' : 'Login with Zerodha'}
          </button>

          <p className="text-xs text-black/60 dark:text-white/60 text-center">
            You'll be redirected to Zerodha's secure login page
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10">
          <p className="text-xs text-black/60 dark:text-white/60 text-center">
            Make sure your API keys are configured in the .env.local file
          </p>
        </div>
      </div>
    </main>
  );
}

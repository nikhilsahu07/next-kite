'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

function ManageAccountContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const accountId = searchParams.get('accountId');

  useEffect(() => {
    if (accountId) {
      selectAccountAndRedirect();
    }
  }, [accountId]);

  const selectAccountAndRedirect = async () => {
    try {
      let account: any = null;

      // FAST PATH: Try to get account data from sessionStorage first
      const storageKey = `kite_trading_account_${accountId}`;
      const cachedData = sessionStorage.getItem(storageKey);
      
      if (cachedData) {
        console.log('⚡ Using cached account data from sessionStorage (FAST PATH)');
        const parsed = JSON.parse(cachedData);
        
        // Verify the cached data is recent (< 30 seconds old)
        if (Date.now() - parsed.timestamp < 30000) {
          account = {
            accountId: parsed.accountId,
            accountName: parsed.accountName,
            apiKey: parsed.apiKey,
            session: parsed.session
          };
          console.log('✅ Cached data is fresh, using it');
          
          // Clean up sessionStorage
          sessionStorage.removeItem(storageKey);
        } else {
          console.log('⚠️ Cached data is stale, fetching from database...');
          sessionStorage.removeItem(storageKey);
        }
      }

      // SLOW PATH: Fetch from database if not in sessionStorage
      if (!account) {
        console.log('💾 Fetching account from database (SLOW PATH)');
        const response = await axios.get(`${API_BASE_URL}/crud`, {
          params: { 
            tableName: 'kite-accounts',
            key: JSON.stringify({ accountId })
          },
        });
        
        account = response.data?.item || response.data?.Items?.[0] || response.data;
        console.log('📊 Full Response Data:', response.data);
      }
      
      console.log('📊 Account Data:', {
        source: cachedData ? 'sessionStorage' : 'database',
        accountId: account?.accountId,
        accountName: account?.accountName,
        hasSession: !!account?.session,
        hasAccessToken: !!account?.session?.accessToken,
        sessionData: account?.session,
        expiresAt: account?.session?.expiresAt,
        expiresAtType: typeof account?.session?.expiresAt,
        expiresAtDate: account?.session?.expiresAt ? new Date(account.session.expiresAt).toLocaleString() : 'N/A',
        currentTime: Date.now(),
        currentTimeDate: new Date().toLocaleString(),
        isExpired: account?.session?.expiresAt ? account.session.expiresAt <= Date.now() : true,
        hoursRemaining: account?.session?.expiresAt 
          ? Math.round((account.session.expiresAt - Date.now()) / (1000 * 60 * 60)) 
          : 'N/A'
      });
      
      if (!account) {
        alert('Account not found!');
        window.close();
        return;
      }

      // Check if access token exists and is valid
      if (!account.session || !account.session.accessToken) {
        alert('No access token found. Please generate access token from the Kite Accounts page.');
        window.close();
        return;
      }

      // Check if access token is expired (24 hour validity)
      const expiresAt = typeof account.session.expiresAt === 'string' 
        ? new Date(account.session.expiresAt).getTime() 
        : account.session.expiresAt;

      if (expiresAt <= Date.now()) {
        const hoursExpired = Math.round((Date.now() - expiresAt) / (1000 * 60 * 60));
        alert(`Access token expired ${hoursExpired} hours ago. Please refresh access token from the Kite Accounts page.`);
        window.close();
        return;
      }

      // Select this account for trading
      await axios.post('/api/kite-auth/select-account', {
        accountId: account.accountId,
        accessToken: account.session.accessToken,
        apiKey: account.apiKey,
      });

      console.log('✅ Account selected successfully, redirecting to dashboard...');

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      console.error('❌ Error selecting account:', error);
      alert('Failed to load account: ' + (error.response?.data?.error || error.message));
      window.close();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Loading Trading Dashboard...
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Selecting account and preparing your trading interface
        </p>
      </div>
    </div>
  );
}

export default function ManageAccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Loading...
          </h2>
        </div>
      </div>
    }>
      <ManageAccountContent />
    </Suspense>
  );
}


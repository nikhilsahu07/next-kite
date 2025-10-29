'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function KiteCallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const requestToken = searchParams.get('request_token');
    const status = searchParams.get('status');

    console.log('Kite Callback - Request Token:', requestToken);
    console.log('Kite Callback - Status:', status);

    if (status === 'success' && requestToken) {
      // Send message to parent window
      if (window.opener) {
        console.log('Sending auth success message to parent window');
        window.opener.postMessage({
          type: 'KITE_AUTH_SUCCESS',
          requestToken,
        }, window.location.origin);
        
        // Close this window after sending message
        setTimeout(() => {
          console.log('Closing popup window');
          window.close();
        }, 500);
      } else {
        // If no opener (opened directly), redirect to kite-accounts page with success
        console.log('No opener found, redirecting to kite-accounts');
        window.location.href = `/kite-accounts?auth=success&token=${requestToken}`;
      }
    } else {
      // Authentication failed
      console.error('Authentication failed - status:', status);
      if (window.opener) {
        window.opener.postMessage({
          type: 'KITE_AUTH_FAILURE',
          error: 'Authentication failed',
        }, window.location.origin);
        
        setTimeout(() => {
          window.close();
        }, 500);
      } else {
        window.location.href = '/kite-accounts?auth=failed';
      }
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Processing Authentication...
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Please wait while we complete the authentication.
        </p>
      </div>
    </div>
  );
}

export default function KiteCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <KiteCallbackContent />
    </Suspense>
  );
}


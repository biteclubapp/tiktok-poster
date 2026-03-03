'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function RedditCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Authenticating with Reddit...');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage(`Reddit auth error: ${error}`);
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('No authorization code received');
      return;
    }

    fetch('/api/reddit/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Token exchange failed');
        }
        setStatus('success');
        setMessage('Reddit connected! Redirecting...');
        setTimeout(() => window.location.href = '/', 2000);
      })
      .catch((e) => {
        setStatus('error');
        setMessage(e.message);
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <div className="animate-spin w-8 h-8 border-3 border-gray-300 border-t-orange-500 rounded-full mx-auto mb-4" />
        )}
        {status === 'success' && (
          <div className="text-4xl mb-4">✓</div>
        )}
        {status === 'error' && (
          <div className="text-4xl mb-4">✕</div>
        )}
        <p className={`text-sm ${status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
          {message}
        </p>
        {status === 'error' && (
          <a href="/" className="text-sm text-orange-500 underline mt-4 block">
            Return to app
          </a>
        )}
      </div>
    </div>
  );
}

export default function RedditCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <RedditCallbackContent />
    </Suspense>
  );
}

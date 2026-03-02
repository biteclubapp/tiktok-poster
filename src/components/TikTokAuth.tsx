'use client';

import { useState, useEffect } from 'react';

interface TikTokAuthProps {
  onStatusChange: (connected: boolean) => void;
}

export default function TikTokAuth({ onStatusChange }: TikTokAuthProps) {
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    try {
      const res = await fetch('/api/tiktok/status');
      if (res.ok) {
        const data = await res.json();
        setConnected(data.connected);
        setUsername(data.username);
        onStatusChange(data.connected);
      }
    } catch {
      // Not connected
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect() {
    try {
      const res = await fetch('/api/tiktok/auth-url');
      const data = await res.json();
      window.location.href = data.url;
    } catch (e) {
      alert('Failed to start TikTok auth: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  }

  async function handleDisconnect() {
    try {
      await fetch('/api/tiktok/disconnect', { method: 'POST' });
      setConnected(false);
      setUsername(null);
      onStatusChange(false);
    } catch {
      // ignore
    }
  }

  if (loading) return null;

  if (connected) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-sm text-green-800 font-medium">
          TikTok: {username || 'Connected'}
        </span>
        <button
          onClick={handleDisconnect}
          className="ml-auto text-xs text-green-600 hover:text-green-800 underline"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .54.04.79.1v-3.47a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.3 6.34 6.34 0 009.49 21.66 6.34 6.34 0 0015.83 15.3V8.64a8.22 8.22 0 003.76.96V6.13a4.85 4.85 0 01-.01 0z" />
      </svg>
      Connect TikTok Account
    </button>
  );
}

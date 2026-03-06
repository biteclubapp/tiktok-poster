'use client';

import { useState, useEffect } from 'react';

interface InstagramAuthProps {
  onStatusChange: (connected: boolean) => void;
}

export default function InstagramAuth({ onStatusChange }: InstagramAuthProps) {
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    try {
      const res = await fetch('/api/instagram/status');
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
      const res = await fetch('/api/instagram/auth-url');
      const data = await res.json();
      window.location.href = data.url;
    } catch (e) {
      alert('Failed to start Instagram auth: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  }

  async function handleDisconnect() {
    try {
      await fetch('/api/instagram/disconnect', { method: 'POST' });
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
      <div className="flex items-center gap-3 px-4 py-2 bg-pink-50 border border-pink-200 rounded-lg">
        <div className="w-2 h-2 rounded-full bg-pink-500" />
        <span className="text-sm text-pink-800 font-medium">
          Instagram: @{username || 'Connected'}
        </span>
        <button
          onClick={handleDisconnect}
          className="ml-auto text-xs text-pink-600 hover:text-pink-800 underline"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
      Connect Instagram
    </button>
  );
}

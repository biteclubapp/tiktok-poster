'use client';

import { useState } from 'react';

interface ScheduleModalProps {
  open: boolean;
  onClose: () => void;
  onSchedule: (scheduledAt: number) => void;
  scheduling: boolean;
}

export default function ScheduleModal({ open, onClose, onSchedule, scheduling }: ScheduleModalProps) {
  // Default to 1 hour from now, rounded to next 5 min
  const defaultDate = () => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5, 0, 0);
    return d;
  };

  const [date, setDate] = useState(() => {
    const d = defaultDate();
    return d.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm format
  });

  if (!open) return null;

  const selectedTime = new Date(date).getTime();
  const isInFuture = selectedTime > Date.now();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isInFuture) {
      onSchedule(selectedTime);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-gray-900 mb-1">Schedule Post</h3>
        <p className="text-sm text-gray-500 mb-4">
          Choose when this carousel should be published to TikTok.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date & Time
          </label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
          />

          {!isInFuture && (
            <p className="text-xs text-red-500 mt-1">Please select a time in the future.</p>
          )}

          <div className="text-xs text-gray-400 mt-2">
            {isInFuture && (
              <>Posting in {formatTimeUntil(selectedTime - Date.now())}</>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isInFuture || scheduling}
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {scheduling ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  Scheduling...
                </span>
              ) : (
                'Schedule'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatTimeUntil(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

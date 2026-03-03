'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ScheduledPost } from '@/lib/db';

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
  generating: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Generating' },
  publishing: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Publishing' },
  published: { bg: 'bg-green-100', text: 'text-green-700', label: 'Published' },
  failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed' },
};

export default function SchedulePage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/schedule');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error('Failed to fetch scheduled posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    // Refresh every 30s
    const interval = setInterval(fetchPosts, 30_000);
    return () => clearInterval(interval);
  }, [fetchPosts]);

  async function cancelPost(id: string) {
    if (!confirm('Cancel this scheduled post?')) return;
    try {
      const res = await fetch(`/api/schedule/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to cancel');
      }
    } catch {
      alert('Failed to cancel post');
    }
  }

  const upcoming = posts.filter((p) => p.status === 'pending');
  const past = posts.filter((p) => p.status !== 'pending');

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Scheduled Posts</h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-red-500 rounded-full" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">No scheduled posts yet</p>
            <p className="text-sm mt-1">
              Go to the <a href="/" className="text-red-500 hover:underline">home page</a> to create a carousel and schedule it.
            </p>
          </div>
        ) : (
          <>
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
                  Upcoming ({upcoming.length})
                </h2>
                <div className="space-y-3">
                  {upcoming.map((post) => (
                    <PostRow key={post.id} post={post} onCancel={cancelPost} />
                  ))}
                </div>
              </section>
            )}

            {/* Past */}
            {past.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
                  History ({past.length})
                </h2>
                <div className="space-y-3">
                  {past.map((post) => (
                    <PostRow key={post.id} post={post} onCancel={cancelPost} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function PostRow({ post, onCancel }: { post: ScheduledPost; onCancel: (id: string) => void }) {
  const style = STATUS_STYLES[post.status] || STATUS_STYLES.pending;
  const dishData = JSON.parse(post.dish_data);
  const scheduledDate = new Date(post.scheduled_at);
  const slideUrls: string[] | null = post.slide_urls ? JSON.parse(post.slide_urls) : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4">
      {/* Slide preview thumbnail */}
      {slideUrls && slideUrls[0] && (
        <img
          src={slideUrls[0]}
          alt="Slide preview"
          className="w-16 h-28 object-cover rounded-lg flex-shrink-0 bg-gray-100"
        />
      )}
      {!slideUrls && (
        <div className="w-16 h-28 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-300 text-xs">
          No preview
        </div>
      )}

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {dishData.recipeName || 'Untitled'}
          </h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
            {style.label}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
            Template {post.template}
          </span>
        </div>

        <p className="text-xs text-gray-500 mb-1">
          {scheduledDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}{' '}
          at{' '}
          {scheduledDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>

        <p className="text-xs text-gray-400 truncate">{post.caption}</p>

        {post.error && (
          <p className="text-xs text-red-500 mt-1">Error: {post.error}</p>
        )}

        {post.publish_id && (
          <p className="text-xs text-green-600 mt-1">Publish ID: {post.publish_id}</p>
        )}
      </div>

      {/* Actions */}
      {post.status === 'pending' && (
        <button
          onClick={() => onCancel(post.id)}
          className="text-xs text-red-500 hover:text-red-700 font-medium flex-shrink-0 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  );
}

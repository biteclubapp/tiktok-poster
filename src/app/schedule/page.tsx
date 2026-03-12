'use client';

import { useState, useEffect, useCallback, useRef, DragEvent } from 'react';
import Link from 'next/link';
import type { ScheduledPost } from '@/lib/db';

// ── Status & content type styles ─────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
  queued: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Queued' },
  generating: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Generating' },
  publishing: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Publishing' },
  published: { bg: 'bg-green-100', text: 'text-green-700', label: 'Published' },
  failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed' },
};

const CONTENT_TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  cook_together: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Cook Together' },
  community_spotlight: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Community' },
  biteclub_stats: { bg: 'bg-cyan-50', text: 'text-cyan-700', label: 'BiteClub Stats' },
  save_money: { bg: 'bg-green-50', text: 'text-green-700', label: 'Save Money' },
  health_wellness: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Health' },
  happiness: { bg: 'bg-pink-50', text: 'text-pink-700', label: 'Happiness' },
  cooking_progress: { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'Progress' },
  debate_poll: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Debate' },
  tips_hacks: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Tips' },
  this_or_that: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'This or That' },
};

// ── Filter types ─────────────────────────────────────────────────────────────

type FilterStatus = 'all' | 'queued' | 'scheduled' | 'published' | 'failed';

const FILTERS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'queued', label: 'Queued' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'failed', label: 'Failed' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function isQueued(post: ScheduledPost): boolean {
  return post.scheduled_at === 0 && post.status === 'pending';
}

function isScheduled(post: ScheduledPost): boolean {
  return post.scheduled_at > 0 && post.status === 'pending';
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // Monday = 0 offset
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDays(weekStart: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDayHeader(d: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${days[d.getDay()]} ${d.getDate()}`;
}

function parseDishData(post: ScheduledPost): { recipeName?: string; contentType?: string } {
  try {
    return JSON.parse(post.dish_data);
  } catch {
    return {};
  }
}

function getPostStatus(post: ScheduledPost): string {
  if (isQueued(post)) return 'queued';
  return post.status;
}

// ── Download helpers ─────────────────────────────────────────────────────────

async function downloadSlide(url: string, filename: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error('Failed to download slide:', err);
  }
}

async function downloadAllSlides(slideUrls: string[], recipeName: string) {
  const safeName = recipeName.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-').toLowerCase() || 'slide';
  for (let i = 0; i < slideUrls.length; i++) {
    await downloadSlide(slideUrls[i], `${safeName}-slide-${i + 1}.jpg`);
    if (i < slideUrls.length - 1) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }
}

// ── Post Card Component ──────────────────────────────────────────────────────

function PostCard({
  post,
  compact,
  onCancel,
  onDragStart,
}: {
  post: ScheduledPost;
  compact?: boolean;
  onCancel: (id: string) => void;
  onDragStart: (e: DragEvent, post: ScheduledPost) => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const [hovered, setHovered] = useState(false);
  const dishData = parseDishData(post);
  const slideUrls: string[] | null = post.slide_urls ? JSON.parse(post.slide_urls) : null;
  const status = getPostStatus(post);
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const ctStyle = dishData.contentType ? CONTENT_TYPE_STYLES[dishData.contentType] : null;
  const canDrag = post.status === 'pending';

  async function handleDownloadAll() {
    if (!slideUrls) return;
    setDownloading(true);
    try {
      await downloadAllSlides(slideUrls, dishData.recipeName || 'carousel');
    } finally {
      setDownloading(false);
    }
  }

  if (compact) {
    return (
      <div
        draggable={canDrag}
        onDragStart={(e) => canDrag && onDragStart(e, post)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`bg-white rounded-lg border border-gray-200 p-2 text-xs ${
          canDrag ? 'cursor-grab active:cursor-grabbing hover:shadow-md' : ''
        } transition-shadow relative group`}
      >
        <div className="flex items-start gap-2">
          {/* Thumbnail */}
          {slideUrls && slideUrls.length > 0 ? (
            <img
              src={slideUrls[0]}
              alt="Slide 1"
              className="w-8 h-12 object-cover rounded bg-gray-100 flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-12 bg-gray-100 rounded flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate leading-tight">
              {dishData.recipeName || 'Untitled'}
            </p>
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${style.bg} ${style.text}`}>
                {style.label}
              </span>
              {ctStyle && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${ctStyle.bg} ${ctStyle.text}`}>
                  {ctStyle.label}
                </span>
              )}
            </div>
            {post.scheduled_at > 0 && (
              <p className="text-[10px] text-gray-400 mt-0.5">
                {new Date(post.scheduled_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>

        {/* Hover actions */}
        {hovered && (
          <div className="absolute top-1 right-1 flex gap-1">
            {slideUrls && slideUrls.length > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); handleDownloadAll(); }}
                disabled={downloading}
                className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                title="Download slides"
              >
                {downloading ? (
                  <span className="animate-spin w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full" />
                ) : (
                  <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 16.5v-2.25m-18 0l9 9m0 0l9-9m-9 9V3" />
                  </svg>
                )}
              </button>
            )}
            {post.status === 'pending' && (
              <button
                onClick={(e) => { e.stopPropagation(); onCancel(post.id); }}
                className="w-6 h-6 rounded bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
                title="Delete"
              >
                <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full-size card for the queue panel
  return (
    <div
      draggable={canDrag}
      onDragStart={(e) => canDrag && onDragStart(e, post)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`bg-white rounded-xl border border-gray-200 p-3 ${
        canDrag ? 'cursor-grab active:cursor-grabbing hover:shadow-md' : ''
      } transition-shadow relative group`}
    >
      <div className="flex items-start gap-3">
        {/* Thumbnail */}
        {slideUrls && slideUrls.length > 0 ? (
          <img
            src={slideUrls[0]}
            alt="Slide 1"
            className="w-12 h-[68px] object-cover rounded-lg bg-gray-100 flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-[68px] bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-300 text-[10px]">
            No img
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {dishData.recipeName || 'Untitled'}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${style.bg} ${style.text}`}>
              {style.label}
            </span>
            {ctStyle && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${ctStyle.bg} ${ctStyle.text}`}>
                {ctStyle.label}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 truncate mt-1">{post.caption}</p>
          {post.error && (
            <p className="text-[10px] text-red-500 mt-1 truncate">Error: {post.error}</p>
          )}
        </div>
      </div>

      {/* Hover actions */}
      {hovered && (
        <div className="absolute top-2 right-2 flex gap-1">
          {slideUrls && slideUrls.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); handleDownloadAll(); }}
              disabled={downloading}
              className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-[10px] text-gray-600 font-medium transition-colors flex items-center gap-1"
              title="Download slides"
            >
              {downloading ? (
                <span className="animate-spin w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full" />
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 16.5v-2.25m-18 0l9 9m0 0l9-9m-9 9V3" />
                  </svg>
                  Download
                </>
              )}
            </button>
          )}
          {post.status === 'pending' && (
            <button
              onClick={(e) => { e.stopPropagation(); onCancel(post.id); }}
              className="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-[10px] text-red-600 font-medium transition-colors"
              title="Delete"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page Component ──────────────────────────────────────────────────────

export default function SchedulePage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);
  const draggedPostRef = useRef<ScheduledPost | null>(null);

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
    const interval = setInterval(fetchPosts, 30_000);
    return () => clearInterval(interval);
  }, [fetchPosts]);

  // ── Counts ──

  const counts = {
    all: posts.length,
    queued: posts.filter(isQueued).length,
    scheduled: posts.filter(isScheduled).length,
    published: posts.filter((p) => p.status === 'published').length,
    failed: posts.filter((p) => p.status === 'failed').length,
  };

  // ── Filter logic ──

  function matchesFilter(post: ScheduledPost): boolean {
    if (filter === 'all') return true;
    if (filter === 'queued') return isQueued(post);
    if (filter === 'scheduled') return isScheduled(post);
    if (filter === 'published') return post.status === 'published';
    if (filter === 'failed') return post.status === 'failed';
    return true;
  }

  const filteredPosts = posts.filter(matchesFilter);

  // Queue: unscheduled pending posts
  const queuePosts = filteredPosts.filter(isQueued);

  // Calendar posts: anything with a real scheduled_at
  const calendarPosts = filteredPosts.filter((p) => p.scheduled_at > 0);

  // ── Week navigation ──

  const weekDays = getWeekDays(weekStart);
  const today = new Date();

  function goToPrevWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  }

  function goToNextWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  }

  function goToToday() {
    setWeekStart(getWeekStart(new Date()));
  }

  // ── Actions ──

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

  async function schedulePostToDay(postId: string, day: Date) {
    // Default to 10:00 AM on that day
    const scheduledAt = new Date(day);
    scheduledAt.setHours(10, 0, 0, 0);

    try {
      const res = await fetch(`/api/schedule/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt: scheduledAt.getTime() }),
      });
      if (res.ok) {
        // Optimistic update
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, scheduled_at: scheduledAt.getTime() } : p
          )
        );
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to reschedule');
      }
    } catch {
      alert('Failed to reschedule post');
    }
  }

  // ── Drag & Drop handlers ──

  function handleDragStart(e: DragEvent, post: ScheduledPost) {
    draggedPostRef.current = post;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', post.id);
  }

  function handleDragOver(e: DragEvent, dayKey: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDay(dayKey);
  }

  function handleDragLeave() {
    setDragOverDay(null);
  }

  function handleDrop(e: DragEvent, day: Date) {
    e.preventDefault();
    setDragOverDay(null);
    const post = draggedPostRef.current;
    if (!post) return;
    draggedPostRef.current = null;
    schedulePostToDay(post.id, day);
  }

  // ── Posts for a given day ──

  function postsForDay(day: Date): ScheduledPost[] {
    return calendarPosts
      .filter((p) => {
        const postDate = new Date(p.scheduled_at);
        return isSameDay(postDate, day);
      })
      .sort((a, b) => a.scheduled_at - b.scheduled_at);
  }

  // ── Week range label ──

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-[1400px] mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Content Calendar</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Post
            </Link>
            <Link
              href="/streams/info"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-gray-700 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Info Carousel
            </Link>
          </div>
        </div>

        {/* Filter pills */}
        {!loading && posts.length > 0 && (
          <div className="flex gap-2 mb-6">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filter === f.value
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {f.label}
                {counts[f.value] > 0 && (
                  <span className={`ml-1.5 ${filter === f.value ? 'text-gray-300' : 'text-gray-400'}`}>
                    {counts[f.value]}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-red-500 rounded-full" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-600 mb-1">No posts yet</p>
            <p className="text-sm text-gray-400 mb-6">
              Create a carousel and send it to the queue.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Recipe Carousel
              </Link>
              <Link
                href="/streams/info"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-gray-700 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Info Carousel
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex gap-6">
            {/* ── Left Panel: Content Queue ── */}
            <div className="w-72 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-gray-900">Content Queue</h2>
                  <span className="text-xs text-gray-400">{queuePosts.length} items</span>
                </div>

                {queuePosts.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">
                    {filter === 'all' || filter === 'queued'
                      ? 'No queued posts. Create content to add to the queue.'
                      : 'No queued posts match this filter.'}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[calc(100vh-260px)] overflow-y-auto">
                    {queuePosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onCancel={cancelPost}
                        onDragStart={handleDragStart}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Right Panel: Weekly Calendar ── */}
            <div className="flex-1 min-w-0">
              {/* Week navigation */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPrevWeek}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <button
                    onClick={goToNextWeek}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                  <h2 className="text-sm font-bold text-gray-900 ml-2">{weekLabel}</h2>
                </div>
                <button
                  onClick={goToToday}
                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Today
                </button>
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => {
                  const dayKey = day.toISOString().split('T')[0];
                  const isToday = isSameDay(day, today);
                  const dayPosts = postsForDay(day);
                  const isDragOver = dragOverDay === dayKey;

                  return (
                    <div
                      key={dayKey}
                      onDragOver={(e) => handleDragOver(e, dayKey)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, day)}
                      className={`rounded-xl border min-h-[200px] p-2 transition-colors ${
                        isToday
                          ? 'bg-red-50/50 border-red-200'
                          : isDragOver
                          ? 'bg-blue-50 border-blue-300 border-dashed'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      {/* Day header */}
                      <div className={`text-xs font-bold mb-2 px-1 ${
                        isToday ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {formatDayHeader(day)}
                        {isToday && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded bg-red-500 text-white text-[9px] font-bold">
                            TODAY
                          </span>
                        )}
                      </div>

                      {/* Posts */}
                      <div className="space-y-1.5">
                        {dayPosts.map((post) => (
                          <PostCard
                            key={post.id}
                            post={post}
                            compact
                            onCancel={cancelPost}
                            onDragStart={handleDragStart}
                          />
                        ))}
                      </div>

                      {/* Drop zone hint */}
                      {isDragOver && dayPosts.length === 0 && (
                        <div className="flex items-center justify-center h-16 text-xs text-blue-400 font-medium">
                          Drop here
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

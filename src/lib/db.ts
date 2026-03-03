import Database from 'better-sqlite3';
import { join } from 'path';

const DB_PATH = join(process.cwd(), 'biteclub.db');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    initTables(_db);
  }
  return _db;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS scheduled_posts (
      id TEXT PRIMARY KEY,
      dish_data JSON NOT NULL,
      template TEXT NOT NULL,
      caption TEXT NOT NULL,
      scheduled_at INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      error TEXT,
      publish_id TEXT,
      slide_urls JSON,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS trending_sounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      artist TEXT,
      score INTEGER DEFAULT 0,
      fetched_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS trending_hashtags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tag TEXT NOT NULL,
      posts TEXT,
      views TEXT,
      avg_views TEXT,
      fetched_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_scheduled_status
      ON scheduled_posts(status, scheduled_at);

    CREATE INDEX IF NOT EXISTS idx_sounds_fetched
      ON trending_sounds(fetched_at);

    CREATE INDEX IF NOT EXISTS idx_hashtags_fetched
      ON trending_hashtags(fetched_at);
  `);
}

// --- Scheduled Posts helpers ---

export interface ScheduledPost {
  id: string;
  dish_data: string; // JSON string
  template: string;
  caption: string;
  scheduled_at: number;
  status: string;
  error: string | null;
  publish_id: string | null;
  slide_urls: string | null; // JSON string
  created_at: number;
}

export function createScheduledPost(post: {
  id: string;
  dishData: object;
  template: string;
  caption: string;
  scheduledAt: number;
}): ScheduledPost {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO scheduled_posts (id, dish_data, template, caption, scheduled_at, status, created_at)
    VALUES (?, ?, ?, ?, ?, 'pending', ?)
  `);
  stmt.run(
    post.id,
    JSON.stringify(post.dishData),
    post.template,
    post.caption,
    post.scheduledAt,
    Date.now()
  );
  return getScheduledPost(post.id)!;
}

export function getScheduledPost(id: string): ScheduledPost | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM scheduled_posts WHERE id = ?').get(id) as ScheduledPost | undefined;
}

export function listScheduledPosts(): ScheduledPost[] {
  const db = getDb();
  return db.prepare('SELECT * FROM scheduled_posts ORDER BY scheduled_at DESC').all() as ScheduledPost[];
}

export function getDuePosts(): ScheduledPost[] {
  const db = getDb();
  return db.prepare(
    "SELECT * FROM scheduled_posts WHERE status = 'pending' AND scheduled_at <= ?"
  ).all(Date.now()) as ScheduledPost[];
}

export function updatePostStatus(
  id: string,
  status: string,
  extra?: { error?: string; publish_id?: string; slide_urls?: string[] }
) {
  const db = getDb();
  const sets = ['status = ?'];
  const values: unknown[] = [status];

  if (extra?.error !== undefined) {
    sets.push('error = ?');
    values.push(extra.error);
  }
  if (extra?.publish_id !== undefined) {
    sets.push('publish_id = ?');
    values.push(extra.publish_id);
  }
  if (extra?.slide_urls !== undefined) {
    sets.push('slide_urls = ?');
    values.push(JSON.stringify(extra.slide_urls));
  }

  values.push(id);
  db.prepare(`UPDATE scheduled_posts SET ${sets.join(', ')} WHERE id = ?`).run(...values);
}

export function deleteScheduledPost(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM scheduled_posts WHERE id = ? AND status = 'pending'").run(id);
  return result.changes > 0;
}

export function updateScheduledPost(
  id: string,
  updates: { scheduledAt?: number; caption?: string }
): boolean {
  const db = getDb();
  const sets: string[] = [];
  const values: unknown[] = [];

  if (updates.scheduledAt !== undefined) {
    sets.push('scheduled_at = ?');
    values.push(updates.scheduledAt);
  }
  if (updates.caption !== undefined) {
    sets.push('caption = ?');
    values.push(updates.caption);
  }

  if (sets.length === 0) return false;

  values.push(id);
  const result = db.prepare(
    `UPDATE scheduled_posts SET ${sets.join(', ')} WHERE id = ? AND status = 'pending'`
  ).run(...values);
  return result.changes > 0;
}

// --- Trending Sounds helpers ---

export interface TrendingSound {
  id: number;
  name: string;
  artist: string | null;
  score: number;
  fetched_at: number;
}

export function getCachedSounds(maxAgeMs: number = 60 * 60 * 1000): TrendingSound[] {
  const db = getDb();
  const cutoff = Date.now() - maxAgeMs;
  return db.prepare(
    'SELECT * FROM trending_sounds WHERE fetched_at > ? ORDER BY score DESC'
  ).all(cutoff) as TrendingSound[];
}

export function cacheSounds(sounds: Omit<TrendingSound, 'id' | 'fetched_at'>[]) {
  const db = getDb();
  const now = Date.now();
  // Clear old sounds before inserting fresh batch
  db.prepare('DELETE FROM trending_sounds').run();
  const insert = db.prepare(
    'INSERT INTO trending_sounds (name, artist, score, fetched_at) VALUES (?, ?, ?, ?)'
  );
  const insertMany = db.transaction((items: Omit<TrendingSound, 'id' | 'fetched_at'>[]) => {
    for (const s of items) {
      insert.run(s.name, s.artist, s.score, now);
    }
  });
  insertMany(sounds);
}

// --- Trending Hashtags helpers ---

export interface TrendingHashtag {
  id: number;
  tag: string;
  posts: string | null;
  views: string | null;
  avg_views: string | null;
  fetched_at: number;
}

export function getCachedHashtags(maxAgeMs: number = 60 * 60 * 1000): TrendingHashtag[] {
  const db = getDb();
  const cutoff = Date.now() - maxAgeMs;
  return db.prepare(
    'SELECT * FROM trending_hashtags WHERE fetched_at > ? ORDER BY id ASC'
  ).all(cutoff) as TrendingHashtag[];
}

export function cacheHashtags(hashtags: Omit<TrendingHashtag, 'id' | 'fetched_at'>[]) {
  const db = getDb();
  const now = Date.now();
  db.prepare('DELETE FROM trending_hashtags').run();
  const insert = db.prepare(
    'INSERT INTO trending_hashtags (tag, posts, views, avg_views, fetched_at) VALUES (?, ?, ?, ?, ?)'
  );
  const insertMany = db.transaction((items: Omit<TrendingHashtag, 'id' | 'fetched_at'>[]) => {
    for (const h of items) {
      insert.run(h.tag, h.posts, h.views, h.avg_views, now);
    }
  });
  insertMany(hashtags);
}

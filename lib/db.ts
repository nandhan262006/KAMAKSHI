import { createClient } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";

export type Film = {
  id: number;
  position: number;
  src: string;
  poster: string | null;
  title: string;
  description: string;
  home: boolean;
  createdAt: number;
};

export type GalleryItem = {
  id: number;
  position: number;
  src: string;
  alt: string;
  home: boolean;
  createdAt: number;
};

let client: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url) throw new Error("TURSO_DATABASE_URL is not set");
    client = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS cms_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS films (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    position INTEGER NOT NULL,
    src TEXT NOT NULL,
    poster TEXT,
    title TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    home INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    position INTEGER NOT NULL,
    src TEXT NOT NULL,
    alt TEXT NOT NULL DEFAULT '',
    home INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  )`,
];

/**
 * Adds a column when the live table was created before it existed.
 * Legacy rows are treated as "featured on home" so the public site keeps
 * showing exactly what it showed before the CMS landed.
 */
const MIGRATIONS = [
  {
    version: "home-flags",
    columns: [
      { table: "films", column: "home", ddl: "ALTER TABLE films ADD COLUMN home INTEGER NOT NULL DEFAULT 0" },
      { table: "gallery", column: "home", ddl: "ALTER TABLE gallery ADD COLUMN home INTEGER NOT NULL DEFAULT 0" },
    ],
    after: [
      "UPDATE films SET home = 1",
      "UPDATE gallery SET home = 1",
    ],
  },
];

/**
 * DB-level single-flight lock: two processes (build workers, dev prerender
 * workers, live server) can hit this simultaneously; only the one whose
 * claim INSERT actually returns a row gets to run the one-time work.
 */
async function claimMarker(db: Awaited<ReturnType<typeof getClient>>, key: string): Promise<boolean> {
  const claimed = await db.execute({
    sql: "INSERT INTO cms_meta (key, value) VALUES (?, 'claimed') ON CONFLICT(key) DO NOTHING RETURNING key",
    args: [key],
  });
  return claimed.rows.length > 0;
}

async function ensureSchema() {
  const db = getClient();
  for (const sql of SCHEMA) {
    await db.execute(sql);
  }

  if (await claimMarker(db, "home-flags")) {
    for (const [table, column, ddl] of MIGRATIONS[0].columns.map((c) => [c.table, c.column, c.ddl] as const)) {
      const cols = await db.execute(`PRAGMA table_info(${table})`);
      if (cols.rows.some((row) => String(row.name) === column)) continue;
      await db.execute(ddl);
    }
    for (const sql of MIGRATIONS[0].after) {
      await db.execute(sql);
    }
    await db.execute({
      sql: "UPDATE cms_meta SET value = ? WHERE key = 'home-flags'",
      args: [new Date().toISOString()],
    });
  }
}

async function seedIfFirstRun() {
  const db = getClient();
  if (!(await claimMarker(db, "seeded"))) return;

  const downloadsDir = path.join(process.cwd(), "public", "downloads");
  const videoExts = /\.(mp4|webm|mov)$/i;
  const imageExts = /\.(jpg|jpeg|png|webp|avif)$/i;

  // Films: every video file found in /downloads, sorted for stable order.
  const files = fs.existsSync(downloadsDir) ? fs.readdirSync(downloadsDir).sort() : [];
  const videos = files.filter((f) => videoExts.test(f));
  for (let i = 0; i < videos.length; i++) {
    await db.execute({
      sql: "INSERT INTO films (position, src, poster, title, description, home, created_at) VALUES (?, ?, NULL, '', '', 1, ?)",
      args: [i + 1, `/downloads/${videos[i]}`, Date.now() + i],
    });
  }

  // Gallery: every image file found in /downloads, sorted for stable order.
  const images = files.filter((f) => imageExts.test(f));
  for (let i = 0; i < images.length; i++) {
    await db.execute({
      sql: "INSERT INTO gallery (position, src, alt, home, created_at) VALUES (?, ?, '', 1, ?)",
      args: [i + 1, `/downloads/${images[i]}`, Date.now() + i],
    });
  }

  await db.execute({
    sql: "UPDATE cms_meta SET value = ? WHERE key = 'seeded'",
    args: [new Date().toISOString()],
  });
}

let ready: Promise<unknown> | null = null;

export function getDb() {
  if (!ready) {
    ready = (async () => {
      await ensureSchema();
      await seedIfFirstRun();
    })().catch((error) => {
      ready = null;
      throw error;
    });
  }
  return Promise.resolve(getClient());
}

const TRANSIENT =
  /\bUND_ERR\b|connect timeout|Connect Timeout|ECONNRESET|ETIMEDOUT|ECONNREFUSED|EAI_AGAIN|fetch failed|socket|network|timeout/i;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retries transient network failures against the hosted Turso instance
 * (connect timeouts, dropped sockets). Retried work must be safe to replay:
 * reads, single-statement updates, or claim-marker inserts.
 */
export async function withRetry<T>(
  run: (db: Awaited<ReturnType<typeof getDb>>) => Promise<T>,
): Promise<T> {
  let db = await getDb();
  try {
    return await run(db);
  } catch (error) {
    if (!TRANSIENT.test(error instanceof Error ? error.message : String(error))) {
      throw error;
    }
    await delay(400);
    db = await getDb();
    return await run(db);
  }
}

export async function listFilms(): Promise<Film[]> {
  return withRetry(async (db) => {
    const res = await db.execute(
      "SELECT id, position, src, poster, title, description, home, created_at FROM films ORDER BY position ASC, id ASC",
    );
    return res.rows.map((row) => ({
      id: Number(row.id),
      position: Number(row.position),
      src: String(row.src),
      poster: row.poster === null ? null : String(row.poster),
      title: String(row.title),
      description: String(row.description),
      home: Number(row.home) === 1,
      createdAt: Number(row.created_at),
    }));
  });
}

export async function getFilm(id: number): Promise<Film | null> {
  return withRetry(async (db) => {
    const res = await db.execute({
      sql: "SELECT id, position, src, poster, title, description, home, created_at FROM films WHERE id = ?",
      args: [id],
    });
    const row = res.rows[0];
    if (!row) return null;
    return {
      id: Number(row.id),
      position: Number(row.position),
      src: String(row.src),
      poster: row.poster === null ? null : String(row.poster),
      title: String(row.title),
      description: String(row.description),
      home: Number(row.home) === 1,
      createdAt: Number(row.created_at),
    };
  });
}

export async function listGallery(): Promise<GalleryItem[]> {
  return withRetry(async (db) => {
    const res = await db.execute(
      "SELECT id, position, src, alt, home, created_at FROM gallery ORDER BY position ASC, id ASC",
    );
    return res.rows.map((row) => ({
      id: Number(row.id),
      position: Number(row.position),
      src: String(row.src),
      alt: String(row.alt),
      home: Number(row.home) === 1,
      createdAt: Number(row.created_at),
    }));
  });
}

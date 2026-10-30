import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient } from "@libsql/client";

// Simulate a legacy DB created before the `home` columns existed,
// exactly like a pre-CMS production database.
const dir = mkdtempSync(join(tmpdir(), "home-toggle-test-"));
process.env.TEST_DB_URL = `file:${join(dir, "test.db")}`;
process.env.TURSO_DATABASE_URL = process.env.TEST_DB_URL;

import { spawnSync } from "node:child_process";

// Execute a child process per phase: fresh process = fresh cold start.
const run = (args) =>
  new Promise((resolve, reject) => {
    const res = spawnSync(process.execPath, ["scripts/test-home-reset-phase.mjs", args], {
      cwd: process.cwd(),
      env: { ...process.env },
      encoding: "utf8",
    });
    process.stdin.pause();
    let out = (res.stdout ?? "") + (res.stderr ?? "");
    if (res.status !== 0) reject(new Error(`phase ${args} failed:\n${out}`));
    else resolve(out.trim());
  });

(async () => {
  const boot = createClient({ url: process.env.TEST_DB_URL });
  await boot.execute(`CREATE TABLE cms_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)`);
  await boot.execute(`CREATE TABLE films (id INTEGER PRIMARY KEY AUTOINCREMENT, position INTEGER NOT NULL, src TEXT NOT NULL, poster TEXT, title TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '', created_at INTEGER NOT NULL)`);
  await boot.execute(`CREATE TABLE gallery (id INTEGER PRIMARY KEY AUTOINCREMENT, position INTEGER NOT NULL, src TEXT NOT NULL, alt TEXT NOT NULL DEFAULT '', created_at INTEGER NOT NULL)`);
  await boot.execute(`INSERT INTO films (position, src, created_at) VALUES (1, '/a.mov', 1), (2, '/b.mov', 2)`);
  await boot.execute(`INSERT INTO gallery (position, src, created_at) VALUES (1, '/a.jpg', 1), (2, '/b.jpg', 2)`);

  // Boot 1: schema engine must migrate + backfill legacy rows to home=1.
  await new Promise((resolve, reject) => {
    import("../lib/db.ts").then(async ({ getDb }) => {
      const db = await getDb();
      const assert = (await import("node:assert")).default;
      assert.equal((await db.execute("SELECT home FROM films")).rows.every(r => Number(r.home) === 1), true, "films backfilled");
      assert.equal((await db.execute("SELECT home FROM gallery")).rows.every(r => Number(r.home) === 1), true, "gallery backfilled");
      console.log("boot 1: legacy rows backfilled to ON");
      resolve();
    }).catch(reject);
  });

  // Toggle rows OFF (what the admin panel does), each in its own "process".
  await run("seed");
  console.log("after toggle: all OFF");
  locate: {
    // 3 simulated cold starts (build workers + dev + prod server).
    for (let i = 0; i < 3; i++) await run("restart");
  }
  console.log("PASS: toggles survived 3 cold starts");
})().catch((e) => { console.error(e.message); process.exit(1); });

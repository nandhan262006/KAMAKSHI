/** Cold-start phase: one fresh process import of the schema engine = one server boot. */
const mode = process.argv[2] ?? "seed";
process.env.TURSO_DATABASE_URL = process.env.TEST_DB_URL;

const assert = (await import("node:assert")).default;
const { getDb } = await import("../lib/db.ts");
const db = await getDb();

const flags = (q) =>
  db.execute(q).then((r) => r.rows.map((row) => Number(row.home)).join(","));

if (mode === "seed") {
  // Admin toggles rows OFF (what the CMS home toggle writes).
  await db.execute("UPDATE films SET home = 0 WHERE id = 1");
  await db.execute("UPDATE films SET home = 0 WHERE id = 2");
  await db.execute("UPDATE gallery SET home = 0 WHERE id = 1");
  await db.execute("UPDATE gallery SET home = 0 WHERE id = 2");
  assert.equal(await flags("SELECT home FROM films ORDER BY id"), "0,0", "films toggled OFF");
  assert.equal(await flags("SELECT home FROM gallery ORDER BY id"), "0,0", "gallery toggled OFF");
  console.log("seed: toggles OFF written");
} else {
  assert.equal(await flags("SELECT home FROM films ORDER BY id"), "0,0", "films survived cold start");
  assert.equal(await flags("SELECT home FROM gallery ORDER BY id"), "0,0", "gallery survived cold start");
  console.log("restart: toggles still OFF");
}
process.exit(0);

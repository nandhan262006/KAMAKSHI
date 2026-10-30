process.env.TURSO_DATABASE_URL ??= "SET-ME";

const { createClient } = require("@libsql/client");
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const TEASERS = [
  { id: "XqcKejNr598", title: "Gowthami Bride Haldi Teaser | Nellore Telugu Wedding" },
  { id: "ipHzZUpOyXI", title: "Muni Megha Sri & Manoj Wedding & Reception Teaser | Nellore Cinematic Wedding" },
  { id: "IzJdDni6_EU", title: "Lasya Seemantham Teaser | Telugu Baby Shower Film | Nellore" },
  { id: "2Xv7W6JR7Ng", title: "Loukya Half Saree Pre-Shoot Song | Outdoor Half Saree Film | Nellore" },
  { id: "7pwKZgK5wSc", title: "Kumar Siva Groom Haldi Teaser | Nellore Telugu Wedding" },
  { id: "x8D2MPGNYn0", title: "Gowthami & Guru Prakash Reception Teaser | Nellore Cinematic Wedding" },
];

(async () => {
  const last = await db.execute("SELECT COALESCE(MAX(position), 0) AS p FROM films");
  let position = Number(last.rows[0].p);
  const existing = await db.execute("SELECT youtube FROM films");
  const have = new Set(existing.rows.map((r) => (r.youtube ?? "").trim()));
  for (const t of TEASERS) {
    const url = `https://www.youtube.com/watch?v=${t.id}`;
    if (have.has(url)) {
      console.log("skip (already present):", t.id);
      continue;
    }
    position += 1;
    await db.execute({
      sql: "INSERT INTO films (position, src, poster, title, description, youtube, home, created_at) VALUES (?, '', NULL, ?, '', ?, 0, ?)",
      args: [position, t.title, url, Date.now()],
    });
    console.log("inserted:", t.id, t.title);
  }
})();

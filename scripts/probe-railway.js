const urls = [
  "https://hodlhotel.app/",
  "https://hodl-hotel.up.railway.app/",
  "https://hodl-hotel-production.up.railway.app/",
  "https://hodlhotel.up.railway.app/",
  "https://hodl-hotel-production.railway.app/",
  "https://hodl-hotel.railway.app/",
  "http://hodl-hotel.railway.internal/",
];

(async () => {
  for (const u of urls) {
    try {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 8000);
      const r = await fetch(u, { redirect: "follow", signal: c.signal, headers: { "user-agent": "hodl-probe" } });
      clearTimeout(t);
      const server = r.headers.get("server") || "";
      const powered = r.headers.get("x-powered-by") || "";
      const vercel = r.headers.get("x-vercel-id") || "";
      const railway = r.headers.get("x-railway") || r.headers.get("x-railway-edge") || "";
      const text = await r.text();
      const hasHodl = text.includes("HODL") || text.includes("hodl");
      console.log(JSON.stringify({ u, status: r.status, final: r.url, server, powered, vercel: !!vercel, railway, hasHodl, len: text.length }));
    } catch (e) {
      console.log(JSON.stringify({ u, error: e.cause?.code || e.message }));
    }
  }
})();

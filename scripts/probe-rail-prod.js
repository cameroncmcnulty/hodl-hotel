const base = "https://hodl-hotel-production.up.railway.app";
const urls = [
  "/",
  "/join",
  "/play",
  "/api/auth/me",
  "/art/landing-bg.jpg?v=4",
  "/art/furn/sofa_sunset.png",
  "/art/furn/stool_mint.png",
];

(async () => {
  for (const path of urls) {
    const u = base + path;
    const t0 = Date.now();
    try {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 20000);
      const r = await fetch(u, { signal: c.signal, redirect: "follow", headers: { "user-agent": "hodl-probe" } });
      clearTimeout(t);
      const buf = Buffer.from(await r.arrayBuffer());
      console.log(r.status, Date.now() - t0 + "ms", buf.length, path, r.headers.get("content-type") || "");
    } catch (e) {
      console.log("FAIL", Date.now() - t0 + "ms", path, e.cause?.code || e.message);
    }
  }
})();

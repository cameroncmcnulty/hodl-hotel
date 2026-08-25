const base = "https://hodl-hotel-production.up.railway.app";
const urls = ["/", "/join", "/api/health", "/api/auth/me", "/art/landing-bg.jpg?v=5"];

(async () => {
  for (const p of urls) {
    const t0 = Date.now();
    try {
      const r = await fetch(base + p, { cache: "no-store", headers: { "user-agent": "hodl-check" } });
      const text = await r.text();
      console.log(r.status, Date.now() - t0 + "ms", text.length, p, text.slice(0, 180).replace(/\s+/g, " "));
    } catch (e) {
      console.log("FAIL", p, e.cause?.code || e.message);
    }
  }
})();

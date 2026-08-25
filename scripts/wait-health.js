const url = "https://hodl-hotel-production.up.railway.app/api/health";

(async () => {
  for (let i = 0; i < 12; i++) {
    try {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 15000);
      const r = await fetch(url, { signal: c.signal, cache: "no-store" });
      clearTimeout(t);
      const text = await r.text();
      console.log(new Date().toISOString(), r.status, text.slice(0, 300));
      if (r.status === 200 && text.includes('"ok":true')) {
        process.exit(0);
      }
    } catch (e) {
      console.log(new Date().toISOString(), "err", e.cause?.code || e.message);
    }
    await new Promise((res) => setTimeout(res, 15000));
  }
  process.exit(1);
})();

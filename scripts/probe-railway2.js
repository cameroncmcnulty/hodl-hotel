const urls = [
  "https://hodl-hotel.up.railway.app/",
  "https://hodl-hotel.up.railway.app/join",
  "https://hodl-hotel.up.railway.app/play",
  "https://hodl-hotel-production.up.railway.app/",
];

(async () => {
  for (const u of urls) {
    try {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 12000);
      const r = await fetch(u, { redirect: "manual", signal: c.signal, headers: { "user-agent": "hodl-probe" } });
      clearTimeout(t);
      const headers = {};
      for (const [k, v] of r.headers) if (/railway|vercel|server|location|x-/i.test(k)) headers[k] = v;
      const text = await r.text();
      console.log("---", u);
      console.log("status", r.status, "len", text.length);
      console.log("headers", headers);
      console.log("body", text.slice(0, 250).replace(/\s+/g, " "));
    } catch (e) {
      console.log("---", u, "ERROR", e.cause?.code || e.message);
    }
  }
})();

const urls = [
  "http://localhost:3000/",
  "http://localhost:3000/join",
  "http://localhost:3000/login",
  "http://localhost:3000/art/landing-bg.jpg",
  "http://localhost:3000/art/landing-mobile.jpg",
  "http://localhost:3000/art/furn/sofa_sunset.png",
  "http://localhost:3000/art/furn/stool_mint.png",
  "http://localhost:3000/art/furn/throne_obsidian.png",
];

(async () => {
  for (const u of urls) {
    try {
      const r = await fetch(u);
      const buf = Buffer.from(await r.arrayBuffer());
      console.log(r.status, buf.length, u);
    } catch (e) {
      console.log("FAIL", u, e.message);
    }
  }
})();

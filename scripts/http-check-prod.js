const urls = [
  "https://hodlhotel.app/",
  "https://hodlhotel.app/join",
  "https://hodlhotel.app/art/landing-bg.jpg?v=3",
  "https://hodlhotel.app/art/landing-mobile.jpg?v=3",
  "https://hodlhotel.app/art/furn/sofa_sunset.png",
  "https://hodlhotel.app/art/furn/stool_mint.png",
  "https://hodlhotel.app/art/furn/chair_coral.png",
  "https://hodlhotel.app/art/furn/throne_obsidian.png",
  "https://hodlhotel.app/art/furn/bed_canopy.png",
];

(async () => {
  for (const u of urls) {
    try {
      const r = await fetch(u, { redirect: "follow" });
      const buf = Buffer.from(await r.arrayBuffer());
      console.log(r.status, buf.length, u);
    } catch (e) {
      console.log("FAIL", u, e.message);
    }
  }
})();

const fs = require("fs");
const path = require("path");
const IMG = path.join(
  process.env.USERPROFILE || "C:\\Users\\camer",
  ".grok",
  "sessions",
  "C%3A%5CUsers%5Ccamer",
  "01a0318d-2002-7f90-a78b-d6097a8442c5",
  "images"
);
const ART = path.join(__dirname, "..", "public", "art");
fs.copyFileSync(path.join(IMG, "77.jpg"), path.join(ART, "landing-bg.jpg"));
fs.copyFileSync(path.join(IMG, "78.jpg"), path.join(ART, "landing-mobile.jpg"));
fs.copyFileSync(path.join(ART, "landing-bg.jpg"), path.join(ART, "hotel-hero.jpg"));
console.log("ok", fs.statSync(path.join(ART, "landing-bg.jpg")).size, fs.statSync(path.join(ART, "landing-mobile.jpg")).size);

const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const dir = path.join(__dirname, "..", "public", "art", "furn");
let pngBytes = 0;
let jpgBytes = 0;
for (const f of fs.readdirSync(dir)) {
  const s = fs.statSync(path.join(dir, f)).size;
  if (f.endsWith(".png")) pngBytes += s;
  else if (/\.jpe?g$/i.test(f)) jpgBytes += s;
}
console.log("png total MB", (pngBytes / 1024 / 1024).toFixed(2));
console.log("jpg total MB", (jpgBytes / 1024 / 1024).toFixed(2));

const file = path.join(dir, "sofa_sunset.png");
const p = PNG.sync.read(fs.readFileSync(file));
const d = p.data;
let t = 0;
let o = 0;
for (let i = 3; i < d.length; i += 4) {
  if (d[i] < 128) t++;
  else o++;
}
console.log("sofa", p.width, "x", p.height, "transparent", t, "opaque", o);
console.log("corner RGBA", d[0], d[1], d[2], d[3]);
console.log("mid RGBA", d[Math.floor(d.length / 2)], d[Math.floor(d.length / 2) + 1], d[Math.floor(d.length / 2) + 2], d[Math.floor(d.length / 2) + 3]);

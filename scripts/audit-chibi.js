const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const DIR = path.join(__dirname, "..", "public", "art", "avatars");
const fail = [];
function mag(r, g, b, a) {
  return a < 16 || (r > 250 && g < 8 && b > 250) || (r > 190 && b > 150 && g < 110);
}
function opaque(name) {
  const f = path.join(DIR, name + ".png");
  if (!fs.existsSync(f)) return -1;
  const img = PNG.sync.read(fs.readFileSync(f));
  let n = 0;
  for (let i = 0; i < img.data.length; i += 4) if (!mag(img.data[i], img.data[i + 1], img.data[i + 2], img.data[i + 3])) n++;
  return n;
}
const need = [
  "m-base-se",
  "f-base-se",
  "m-hair-short-se-layer",
  "m-hair-spike-se-layer",
  "m-hair-buzz-se-layer",
  "m-hair-mohawk-se-layer",
  "m-top-hoodie-se-layer",
  "m-top-tee-se-layer",
  "m-top-jacket-se-layer",
  "m-bot-pants-se-layer",
  "m-bot-shorts-se-layer",
  "m-shoe-sneakers-se-layer",
  "f-hair-pony-se-layer",
  "f-hair-bob-se-layer",
  "f-hair-long-se-layer",
  "f-top-hoodie-se-layer",
  "f-top-cami-se-layer",
  "f-top-cardi-se-layer",
  "f-bot-skirt-se-layer",
  "f-bot-shorts-se-layer",
  "f-bot-pants-se-layer",
  "f-shoe-sneakers-se-layer",
];
for (const id of need) {
  const n = opaque(id);
  if (n < 0) fail.push("missing " + id);
  else if (n < 400) fail.push("thin " + id + " " + n);
  else console.log("ok", id, n);
}
console.log(fail.length ? "FAILED\n" + fail.join("\n") : "all chibi layers ok");
if (fail.length) process.exit(1);

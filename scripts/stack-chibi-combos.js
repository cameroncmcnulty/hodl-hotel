const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const DIR = path.join(__dirname, "..", "public", "art", "avatars");
const TEST = path.join(__dirname, "avatar-tests");

function load(name) {
  const f = path.join(DIR, name + ".png");
  if (!fs.existsSync(f)) return null;
  return PNG.sync.read(fs.readFileSync(f));
}
function mag(r, g, b, a) {
  return a < 16 || (r > 250 && g < 8 && b > 250);
}
function stack(base, layers) {
  const out = { width: base.width, height: base.height, data: Buffer.from(base.data) };
  for (const L of layers) {
    if (!L) continue;
    for (let i = 0; i < out.data.length; i += 4) {
      if (mag(L.data[i], L.data[i + 1], L.data[i + 2], L.data[i + 3])) continue;
      out.data[i] = L.data[i];
      out.data[i + 1] = L.data[i + 1];
      out.data[i + 2] = L.data[i + 2];
      out.data[i + 3] = 255;
    }
  }
  return out;
}
function save(name, img) {
  const png = new PNG({ width: img.width, height: img.height });
  png.data = Buffer.from(img.data);
  fs.writeFileSync(path.join(TEST, name + ".png"), PNG.sync.write(png));
}

const combos = [
  ["boy-default", "m-base-se", "m-shoe-sneakers-se-layer", "m-bot-pants-se-layer", "m-top-hoodie-se-layer", "m-hair-short-se-layer"],
  ["boy-spike-tee-shorts", "m-base-se", "m-shoe-sneakers-se-layer", "m-bot-shorts-se-layer", "m-top-tee-se-layer", "m-hair-spike-se-layer"],
  ["boy-buzz-jacket", "m-base-se", "m-shoe-boots-se-layer", "m-bot-pants-se-layer", "m-top-jacket-se-layer", "m-hair-buzz-se-layer"],
  ["girl-default", "f-base-se", "f-shoe-sneakers-se-layer", "f-bot-skirt-se-layer", "f-top-hoodie-se-layer", "f-hair-pony-se-layer"],
  ["girl-bob-cami-shorts", "f-base-se", "f-shoe-sneakers-se-layer", "f-bot-shorts-se-layer", "f-top-cami-se-layer", "f-hair-bob-se-layer"],
  ["girl-long-cardi-pants", "f-base-se", "f-shoe-sneakers-se-layer", "f-bot-pants-se-layer", "f-top-cardi-se-layer", "f-hair-long-se-layer"],
];
for (const [label, ...ids] of combos) {
  const parts = ids.map(load);
  if (parts.some((p) => !p)) {
    console.log("missing", label, ids.filter((id, i) => !parts[i]));
    continue;
  }
  save(label, stack(parts[0], parts.slice(1)));
  console.log("wrote", label);
}

/**
 * Function + layer audits for hotel public rooms.
 * Run after sprite convert and catalog changes.
 */
const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const root = path.join(__dirname, "..");
const catalogSrc = fs.readFileSync(path.join(root, "src", "lib", "catalog.ts"), "utf8");
const layoutSrc = fs.readFileSync(path.join(root, "src", "lib", "layouts.ts"), "utf8");
const shopSrc = fs.readFileSync(path.join(root, "src", "app", "api", "shop", "route.ts"), "utf8");
const clientSrc = fs.readFileSync(path.join(root, "src", "components", "GameClient.tsx"), "utf8");
const seedSrc = fs.readFileSync(path.join(root, "src", "lib", "seed.ts"), "utf8");
const furnDir = path.join(root, "public", "art", "furn");

const fail = [];
const ok = (msg) => console.log("ok ", msg);
const bad = (msg) => {
  fail.push(msg);
  console.log("FAIL", msg);
};

const hotelIds = [...catalogSrc.matchAll(/id: "hq_[^"]+"/g)].map((m) => m[0].slice(5, -1));
const uniqueIds = [...new Set(hotelIds)];
if (!uniqueIds.length) bad("no hq_ furniture ids");
else ok(`${uniqueIds.length} hotel furniture ids`);

for (const id of uniqueIds) {
  const f = path.join(furnDir, id + ".png");
  if (!fs.existsSync(f)) {
    bad(`missing sprite ${id}.png`);
    continue;
  }
  const png = PNG.sync.read(fs.readFileSync(f));
  let mag = 0,
    solid = 0;
  for (let i = 0; i < png.data.length; i += 4) {
    const r = png.data[i],
      g = png.data[i + 1],
      b = png.data[i + 2],
      a = png.data[i + 3];
    if (a < 8) continue;
    if (r > 200 && b > 170 && g < 90) mag++;
    else solid++;
  }
  if (solid < 800) bad(`thin sprite ${id} opaque=${solid}`);
  else ok(`sprite ${id} solid=${solid} key=${mag}`);
}

if (!/hotelOnly/.test(catalogSrc)) bad("catalog missing hotelOnly");
else ok("hotelOnly flag present");
if (!/!f\.hotelOnly/.test(clientSrc) && !/!f.hotelOnly/.test(clientSrc)) bad("shop UI does not hide hotelOnly");
else ok("shop UI hides hotelOnly");
if (!/hotelOnly/.test(shopSrc)) bad("shop API does not block hotelOnly");
else ok("shop API blocks hotelOnly");
if (!/hotelFurniture/.test(seedSrc)) bad("seed does not place hotel furniture");
else ok("seed places hotel furniture");

const layouts = ["grand_lobby", "roof_pool", "shill_club", "cook_lab", "pixel_arcade"];
for (const id of layouts) {
  if (!layoutSrc.includes(`"${id}"`)) bad(`layout missing ${id}`);
  else ok(`layout ${id}`);
}
if (!layoutSrc.includes("11111111")) bad("lobby missing raised stairs");
else ok("lobby stairs");
if (!/~{6,}/.test(layoutSrc)) bad("pool missing water");
else ok("pool water");
if (!/d{4,}/.test(layoutSrc)) bad("club missing dance floor");
else ok("club dance floor");

const shopCats = ["seating", "beds", "tables", "lighting", "electronics", "plants"];
for (const id of uniqueIds) {
  const block = catalogSrc.slice(catalogSrc.indexOf(`id: "${id}"`), catalogSrc.indexOf(`id: "${id}"`) + 280);
  if (shopCats.some((c) => block.includes(`category: "${c}"`))) bad(`${id} still in a shop category`);
}

if (!clientSrc.includes("hotelOnly")) bad("GameClient missing hotelOnly filter");
else ok("GameClient shop filter");

const size = {};
for (const m of catalogSrc.matchAll(/id: "(hq_[^"]+)"[\s\S]*?w: (\d+), d: (\d+)/g)) {
  size[m[1]] = { w: +m[2], d: +m[3] };
}
const spots = {};
const spotBlock = catalogSrc.slice(catalogSrc.indexOf("export const HOTEL_SPOTS"), catalogSrc.indexOf("export function hotelFurniture"));
let cur = "";
for (const line of spotBlock.split("\n")) {
  const lay = line.match(/^\s{2}([a-z_]+): \[/);
  if (lay) cur = lay[1];
  const s = line.match(/id: "(hq_[^"]+)", x: (\d+), y: (\d+)(?:, rot: (\d))?/);
  if (s && cur) (spots[cur] = spots[cur] || []).push({ id: s[1], x: +s[2], y: +s[3], rot: s[4] ? +s[4] : 0 });
}

function parseMaps(src) {
  const maps = {};
  const re = /parse\(\s*"([^"]+)"[\s\S]*?`([\s\S]*?)`/g;
  let m;
  while ((m = re.exec(src))) {
    const rows = m[2]
      .trim()
      .split("\n")
      .map((r) => r.trim());
    maps[m[1]] = rows;
  }
  return maps;
}
const maps = parseMaps(layoutSrc);
const layoutIds = { grand_lobby: "grand_lobby", roof_pool: "roof_pool", shill_club: "shill_club", cook_lab: "cook_lab", pixel_arcade: "pixel_arcade" };

for (const [layoutId, items] of Object.entries(spots)) {
  const grid = maps[layoutId];
  if (!grid) {
    bad(`no grid for ${layoutId}`);
    continue;
  }
  const h = grid.length;
  const w = Math.max(...grid.map((r) => r.length));
  const occ = new Set();
  let spawn = null;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < (grid[y] || "").length; x++) {
      if (grid[y][x] === "s") spawn = { x, y };
    }
  }
  if (!spawn) bad(`${layoutId} missing spawn`);
  for (const s of items) {
    const def = size[s.id];
    if (!def) {
      bad(`${layoutId} unknown ${s.id}`);
      continue;
    }
    const fw = s.rot === 1 || s.rot === 3 ? def.d : def.w;
    const fd = s.rot === 1 || s.rot === 3 ? def.w : def.d;
    const slice = catalogSrc.slice(catalogSrc.indexOf(`id: "${s.id}"`), catalogSrc.indexOf(`id: "${s.id}"`) + 280);
    const wall = /slot: "wall"/.test(slice);
    const walk = /walkable: true/.test(slice);
    for (let dy = 0; dy < fd; dy++) {
      for (let dx = 0; dx < fw; dx++) {
        const x = s.x + dx;
        const y = s.y + dy;
        if (y < 0 || x < 0 || y >= h || x >= w) bad(`${layoutId} ${s.id} out of bounds ${x},${y}`);
        else {
          const c = (grid[y] || "")[x] || "#";
          if (c === "#" && !wall) bad(`${layoutId} ${s.id} on wall tile ${x},${y}`);
          if (c === "~" && !wall) bad(`${layoutId} ${s.id} in water ${x},${y}`);
        }
        const key = `${x},${y}`;
        if (!wall && !walk && occ.has(key)) bad(`${layoutId} overlap at ${key} (${s.id})`);
        if (!wall && !walk) occ.add(key);
      }
    }
  }
  if (spawn && occ.has(`${spawn.x},${spawn.y}`)) bad(`${layoutId} spawn blocked at ${spawn.x},${spawn.y}`);
  else if (spawn) ok(`${layoutId} spawn clear ${spawn.x},${spawn.y} items=${items.length}`);
}

console.log(fail.length ? `\nFAILED ${fail.length}\n` + fail.join("\n") : "\nall room audits passed");
if (fail.length) process.exit(1);

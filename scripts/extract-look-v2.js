const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const SRC = "C:/Users/camer/.grok/sessions/C%3A%5CUsers%5Ccamer/01a0318d-2002-7f90-a78b-d6097a8442c5/assets";
const OUT = path.join(__dirname, "../public/art/look");
fs.mkdirSync(OUT, { recursive: true });

function readPng(file) {
  return PNG.sync.read(fs.readFileSync(path.join(SRC, file)));
}

function isBg(d, i) {
  const r = d[i],
    g = d[i + 1],
    b = d[i + 2];
  if (d[i + 3] < 12) return true;
  if (r > 248 && g > 248 && b > 248) return true;
  if (r > 235 && g > 235 && b > 235 && Math.abs(r - g) < 8 && Math.abs(g - b) < 8) return true;
  return false;
}

function crop(png, x, y, w, h) {
  x = Math.max(0, Math.floor(x));
  y = Math.max(0, Math.floor(y));
  w = Math.min(png.width - x, Math.floor(w));
  h = Math.min(png.height - y, Math.floor(h));
  const out = new PNG({ width: w, height: h });
  for (let yy = 0; yy < h; yy++) {
    for (let xx = 0; xx < w; xx++) {
      const si = ((y + yy) * png.width + (x + xx)) * 4;
      const di = (yy * w + xx) * 4;
      if (isBg(png.data, si)) {
        out.data[di] = 255;
        out.data[di + 1] = 0;
        out.data[di + 2] = 255;
        out.data[di + 3] = 0;
      } else {
        out.data[di] = png.data[si];
        out.data[di + 1] = png.data[si + 1];
        out.data[di + 2] = png.data[si + 2];
        out.data[di + 3] = 255;
      }
    }
  }
  return trim(out);
}

function trim(png) {
  const { width: w, height: h, data } = png;
  let minx = w,
    miny = h,
    maxx = 0,
    maxy = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (data[i + 3] < 16) continue;
      if (x < minx) minx = x;
      if (y < miny) miny = y;
      if (x > maxx) maxx = x;
      if (y > maxy) maxy = y;
    }
  }
  if (maxx < minx) return png;
  const pad = 2;
  minx = Math.max(0, minx - pad);
  miny = Math.max(0, miny - pad);
  maxx = Math.min(w - 1, maxx + pad);
  maxy = Math.min(h - 1, maxy + pad);
  const nw = maxx - minx + 1,
    nh = maxy - miny + 1;
  const out = new PNG({ width: nw, height: nh });
  for (let y = 0; y < nh; y++) {
    for (let x = 0; x < nw; x++) {
      const si = ((miny + y) * w + (minx + x)) * 4;
      const di = (y * nw + x) * 4;
      out.data[di] = png.data[si];
      out.data[di + 1] = png.data[si + 1];
      out.data[di + 2] = png.data[si + 2];
      out.data[di + 3] = png.data[si + 3];
    }
  }
  return out;
}

function save(name, png) {
  fs.writeFileSync(path.join(OUT, name), PNG.sync.write(png));
}

function stripText(png) {
  const { width: w, height: h, data } = png;
  const seen = new Uint8Array(w * h);
  const stack = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      if (seen[p]) continue;
      const i = p * 4;
      if (data[i + 3] < 16) {
        seen[p] = 1;
        continue;
      }
      const pts = [];
      let minx = x,
        maxx = x,
        miny = y,
        maxy = y;
      stack.push(x, y);
      seen[p] = 1;
      while (stack.length) {
        const cy = stack.pop();
        const cx = stack.pop();
        pts.push(cx, cy);
        if (cx < minx) minx = cx;
        if (cx > maxx) maxx = cx;
        if (cy < miny) miny = cy;
        if (cy > maxy) maxy = cy;
        for (const [nx, ny] of [
          [cx - 1, cy],
          [cx + 1, cy],
          [cx, cy - 1],
          [cx, cy + 1],
        ]) {
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const np = ny * w + nx;
          if (seen[np]) continue;
          const ni = np * 4;
          if (data[ni + 3] < 16) {
            seen[np] = 1;
            continue;
          }
          seen[np] = 1;
          stack.push(nx, ny);
        }
      }
      const bw = maxx - minx + 1;
      const bh = maxy - miny + 1;
      const n = pts.length / 2;
      const isText = n < 90 || bh < 10 || (bw > bh * 3 && bh < 18) || (n < 140 && bh < 16);
      if (isText) {
        for (let k = 0; k < pts.length; k += 2) {
          const di = (pts[k + 1] * w + pts[k]) * 4;
          data[di + 3] = 0;
        }
      }
    }
  }
  return trim(png);
}

const FW = 128;
const FH = 176;

function scaleTo(src, tw, th) {
  const out = new PNG({ width: tw, height: th });
  for (let y = 0; y < th; y++) {
    for (let x = 0; x < tw; x++) {
      const sx = Math.min(src.width - 1, Math.round((x / tw) * src.width));
      const sy = Math.min(src.height - 1, Math.round((y / th) * src.height));
      const si = (sy * src.width + sx) * 4;
      const di = (y * tw + x) * 4;
      out.data[di] = src.data[si];
      out.data[di + 1] = src.data[si + 1];
      out.data[di + 2] = src.data[si + 2];
      out.data[di + 3] = src.data[si + 3];
    }
  }
  return out;
}

function fit(src, maxW, maxH) {
  const s = Math.min(maxW / src.width, maxH / src.height, 1);
  const tw = Math.max(1, Math.round(src.width * s));
  const th = Math.max(1, Math.round(src.height * s));
  return scaleTo(src, tw, th);
}

function stamp(dst, src, cx, cy) {
  const dx = Math.round(cx - src.width / 2);
  const dy = Math.round(cy - src.height / 2);
  for (let y = 0; y < src.height; y++) {
    for (let x = 0; x < src.width; x++) {
      const tx = dx + x,
        ty = dy + y;
      if (tx < 0 || ty < 0 || tx >= dst.width || ty >= dst.height) continue;
      const si = (y * src.width + x) * 4;
      if (src.data[si + 3] < 16) continue;
      const di = (ty * dst.width + tx) * 4;
      dst.data[di] = src.data[si];
      dst.data[di + 1] = src.data[si + 1];
      dst.data[di + 2] = src.data[si + 2];
      dst.data[di + 3] = src.data[si + 3];
    }
  }
}

function blank() {
  const out = new PNG({ width: FW, height: FH });
  for (let i = 0; i < FW * FH; i++) {
    const o = i * 4;
    out.data[o] = 255;
    out.data[o + 1] = 0;
    out.data[o + 2] = 255;
    out.data[o + 3] = 0;
  }
  return out;
}

function placeBox(src, box) {
  const out = blank();
  stamp(out, fit(stripText(src), box.w, box.h), box.x + box.w / 2, box.y + box.h / 2);
  return out;
}

const BOX = {
  body: { x: 28, y: 6, w: 72, h: 166 },
  hair: { x: 30, y: 6, w: 68, h: 48 },
  hoodie: { x: 32, y: 66, w: 64, h: 60 },
  tee: { x: 36, y: 72, w: 56, h: 48 },
  pants: { x: 36, y: 108, w: 56, h: 54 },
  shorts: { x: 38, y: 110, w: 52, h: 36 },
  skirt: { x: 36, y: 106, w: 56, h: 34 },
  shoes: { x: 36, y: 152, w: 56, h: 22 },
};

const base = readPng("image-f3be7263-9d53-4bf3-94d0-4ac5cdcf5a0b.png");
const hair = readPng("image-a720e9a5-d7ba-4c3f-ad17-e594d43ef408.png");
const rest = readPng("image-a2b32d70-d9da-4c7a-bb07-291fa6e9de74.png");

const boyX = [24, 168, 308, 454, 592, 736, 880, 1024];
const girlX = [24, 166, 309, 452, 592, 736, 880, 1024];
for (let i = 0; i < 8; i++) {
  const b = crop(base, boyX[i], 58, 118, 252);
  save(`m-skin-${i}.png`, placeBox(b, BOX.body));
  const g = crop(base, girlX[i], 432, 120, 252);
  save(`f-skin-${i}.png`, placeBox(g, BOX.body));
}

const boyHairY = [
  [16, 76],
  [96, 138],
  [150, 210],
  [222, 276],
  [292, 346],
];
const boyHairX = [232, 368, 506, 644, 784, 922];
const boyHairNames = ["messy", "side", "afro", "undercut", "spikes"];
boyHairY.forEach(([y0, y1], si) => {
  boyHairX.forEach((x, ci) => {
    const c = crop(hair, x, y0, 100, y1 - y0);
    save(`m-hair-${boyHairNames[si]}-${ci}.png`, placeBox(c, BOX.hair));
  });
});

const girlHairY = [
  [362, 416],
  [428, 484],
  [498, 556],
];
const girlHairX = [274, 384, 504, 612, 720, 822];
const girlHairNames = ["pony", "waves", "bob"];
girlHairY.forEach(([y0, y1], si) => {
  girlHairX.forEach((x, ci) => {
    const c = crop(hair, x, y0, 88, y1 - y0);
    save(`f-hair-${girlHairNames[si]}-${ci}.png`, placeBox(c, BOX.hair));
  });
});

const topY = [
  [598, 672],
  [696, 764],
];
const topX = [24, 130, 241, 352, 462, 616, 720, 829, 934, 1040];
topY.forEach(([y0, y1], ri) => {
  const kind = ri === 0 ? "hoodie" : "tee";
  topX.forEach((x, i) => {
    const g = i < 5 ? "m" : "f";
    const ci = i < 5 ? i : i - 5;
    const c = crop(hair, x, y0, 92, y1 - y0);
    save(`${g}-top-${kind}-${ci}.png`, placeBox(c, kind === "hoodie" ? BOX.hoodie : BOX.tee));
  });
});

const boyPantsX = [32, 134, 238, 341, 440];
boyPantsX.forEach((x, i) => {
  save(`m-bot-pants-${i}.png`, placeBox(crop(rest, x, 90, 86, 130), BOX.pants));
});
const boyShortX = [28, 128, 235, 336, 439];
boyShortX.forEach((x, i) => {
  save(`m-bot-shorts-${i}.png`, placeBox(crop(rest, x, 308, 88, 80), BOX.shorts));
});
const girlSkirtX = [601, 704, 816, 921, 1025];
girlSkirtX.forEach((x, i) => {
  save(`f-bot-skirt-${i}.png`, placeBox(crop(rest, x, 82, 92, 70), BOX.skirt));
});
const girlPantsX = [604, 712, 816, 928, 1032];
girlPantsX.forEach((x, i) => {
  save(`f-bot-pants-${i}.png`, placeBox(crop(rest, x, 188, 86, 130), BOX.pants));
});
const girlShortX = [599, 704, 816, 920, 1029];
girlShortX.forEach((x, i) => {
  save(`f-bot-shorts-${i}.png`, placeBox(crop(rest, x, 370, 90, 62), BOX.shorts));
});
const boyShoeX = [16, 125, 228, 336, 440];
boyShoeX.forEach((x, i) => {
  save(`m-shoe-sneakers-${i}.png`, placeBox(crop(rest, x, 588, 100, 80), BOX.shoes));
});
const girlSneakX = [593, 704, 813, 918, 1026];
girlSneakX.forEach((x, i) => {
  save(`f-shoe-sneakers-${i}.png`, placeBox(crop(rest, x, 544, 92, 72), BOX.shoes));
});
const girlFlatX = [592, 704, 811, 921, 1025];
girlFlatX.forEach((x, i) => {
  save(`f-shoe-flats-${i}.png`, placeBox(crop(rest, x, 668, 92, 70), BOX.shoes));
});

function stack(parts) {
  const out = new PNG({ width: FW, height: FH });
  for (let i = 0; i < FW * FH * 4; i += 4) {
    out.data[i] = 255;
    out.data[i + 1] = 0;
    out.data[i + 2] = 255;
    out.data[i + 3] = 0;
  }
  for (const p of parts) {
    const png = PNG.sync.read(fs.readFileSync(path.join(OUT, p)));
    for (let i = 0; i < FW * FH; i++) {
      const o = i * 4;
      if (png.data[o + 3] < 16) continue;
      out.data[o] = png.data[o];
      out.data[o + 1] = png.data[o + 1];
      out.data[o + 2] = png.data[o + 2];
      out.data[o + 3] = png.data[o + 3];
    }
  }
  return out;
}

save("_t-boy-hoodie.png", stack(["m-skin-2.png", "m-shoe-sneakers-0.png", "m-bot-pants-0.png", "m-top-hoodie-0.png", "m-hair-messy-0.png"]));
save("_t-boy-tee.png", stack(["m-skin-5.png", "m-shoe-sneakers-2.png", "m-bot-shorts-1.png", "m-top-tee-0.png", "m-hair-afro-2.png"]));
save("_t-girl-hoodie.png", stack(["f-skin-2.png", "f-shoe-sneakers-0.png", "f-bot-skirt-0.png", "f-top-hoodie-0.png", "f-hair-pony-0.png"]));
save("_t-girl-tee.png", stack(["f-skin-6.png", "f-shoe-flats-0.png", "f-bot-pants-2.png", "f-top-tee-0.png", "f-hair-bob-5.png"]));

const names = fs.readdirSync(OUT).filter((f) => f.endsWith(".png"));
console.log("wrote", names.length, "files");

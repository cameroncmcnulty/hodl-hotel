const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const SRC = "C:/Users/camer/.grok/sessions/C%3A%5CUsers%5Ccamer/01a0318d-2002-7f90-a78b-d6097a8442c5/assets";
const OUT = path.join(__dirname, "../public/art/look");
fs.mkdirSync(OUT, { recursive: true });

const FW = 128;
const FH = 264;

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
      if (data[(y * w + x) * 4 + 3] < 16) continue;
      if (x < minx) minx = x;
      if (y < miny) miny = y;
      if (x > maxx) maxx = x;
      if (y > maxy) maxy = y;
    }
  }
  if (maxx < minx) return png;
  minx = Math.max(0, minx);
  miny = Math.max(0, miny);
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
          if (data[np * 4 + 3] < 16) {
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
      if (n < 90 || bh < 10 || (bw > bh * 3 && bh < 18) || (n < 140 && bh < 16)) {
        for (let k = 0; k < pts.length; k += 2) data[(pts[k + 1] * w + pts[k]) * 4 + 3] = 0;
      }
    }
  }
  return trim(png);
}

function half(src) {
  const tw = Math.max(1, Math.floor(src.width / 2));
  const th = Math.max(1, Math.floor(src.height / 2));
  const out = new PNG({ width: tw, height: th });
  for (let y = 0; y < th; y++) {
    for (let x = 0; x < tw; x++) {
      const si = (y * 2 * src.width + x * 2) * 4;
      const di = (y * tw + x) * 4;
      out.data[di] = src.data[si];
      out.data[di + 1] = src.data[si + 1];
      out.data[di + 2] = src.data[si + 2];
      out.data[di + 3] = src.data[si + 3];
    }
  }
  return out;
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

function stamp(dst, src, x, y) {
  const dx = Math.round(x);
  const dy = Math.round(y);
  for (let yy = 0; yy < src.height; yy++) {
    for (let xx = 0; xx < src.width; xx++) {
      const tx = dx + xx,
        ty = dy + yy;
      if (tx < 0 || ty < 0 || tx >= dst.width || ty >= dst.height) continue;
      const si = (yy * src.width + xx) * 4;
      if (src.data[si + 3] < 16) continue;
      const di = (ty * dst.width + tx) * 4;
      dst.data[di] = src.data[si];
      dst.data[di + 1] = src.data[si + 1];
      dst.data[di + 2] = src.data[si + 2];
      dst.data[di + 3] = src.data[si + 3];
    }
  }
}

function centerX(src) {
  return Math.round((FW - src.width) / 2);
}

function layer(src, y, opts = {}) {
  const piece = opts.half ? half(stripText(src)) : stripText(src);
  const out = blank();
  stamp(out, piece, centerX(piece) + (opts.dx || 0), y);
  if (opts.clipBottom) {
    for (let yy = opts.clipBottom; yy < FH; yy++) {
      for (let xx = 0; xx < FW; xx++) out.data[(yy * FW + xx) * 4 + 3] = 0;
    }
  }
  return out;
}

function save(name, png) {
  fs.writeFileSync(path.join(OUT, name), PNG.sync.write(png));
}

const base = readPng("image-f3be7263-9d53-4bf3-94d0-4ac5cdcf5a0b.png");
const hair = readPng("image-a720e9a5-d7ba-4c3f-ad17-e594d43ef408.png");
const rest = readPng("image-a2b32d70-d9da-4c7a-bb07-291fa6e9de74.png");

const BODY_Y = 8;
const boyX = [24, 168, 308, 454, 592, 736, 880, 1024];
const girlX = [24, 166, 309, 452, 592, 736, 880, 1024];
for (let i = 0; i < 8; i++) {
  save(`m-skin-${i}.png`, layer(crop(base, boyX[i], 58, 118, 252), BODY_Y));
  save(`f-skin-${i}.png`, layer(crop(base, girlX[i], 432, 120, 252), BODY_Y));
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
    save(`m-hair-${boyHairNames[si]}-${ci}.png`, layer(crop(hair, x, y0, 100, y1 - y0), 6));
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
    save(`f-hair-${girlHairNames[si]}-${ci}.png`, layer(crop(hair, x, y0, 88, y1 - y0), 6));
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
    save(`${g}-top-${kind}-${ci}.png`, layer(crop(hair, x, y0, 92, y1 - y0), kind === "hoodie" ? 84 : 92));
  });
});

const boyPantsX = [32, 134, 238, 341, 440];
boyPantsX.forEach((x, i) => {
  save(`m-bot-pants-${i}.png`, layer(crop(rest, x, 90, 86, 130), 112));
});
const boyShortX = [28, 128, 235, 336, 439];
boyShortX.forEach((x, i) => {
  save(`m-bot-shorts-${i}.png`, layer(crop(rest, x, 308, 88, 80), 140, { clipBottom: 216 }));
});
const girlSkirtX = [601, 704, 816, 921, 1025];
girlSkirtX.forEach((x, i) => {
  save(`f-bot-skirt-${i}.png`, layer(crop(rest, x, 82, 92, 70), 138));
});
const girlPantsX = [604, 712, 816, 928, 1032];
girlPantsX.forEach((x, i) => {
  save(`f-bot-pants-${i}.png`, layer(crop(rest, x, 188, 86, 130), 112));
});
const girlShortX = [599, 704, 816, 920, 1029];
girlShortX.forEach((x, i) => {
  save(`f-bot-shorts-${i}.png`, layer(crop(rest, x, 370, 90, 62), 140, { clipBottom: 216 }));
});
const boyShoeX = [16, 125, 228, 336, 440];
boyShoeX.forEach((x, i) => {
  save(`m-shoe-sneakers-${i}.png`, layer(crop(rest, x, 588, 100, 80), 218, { half: true }));
});
const girlSneakX = [593, 704, 813, 918, 1026];
girlSneakX.forEach((x, i) => {
  save(`f-shoe-sneakers-${i}.png`, layer(crop(rest, x, 544, 92, 72), 218, { half: true }));
});
const girlFlatX = [592, 704, 811, 921, 1025];
girlFlatX.forEach((x, i) => {
  save(`f-shoe-flats-${i}.png`, layer(crop(rest, x, 668, 92, 70), 220, { half: true }));
});

function stack(parts) {
  const out = blank();
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

save("_t-boy-hoodie.png", stack(["m-skin-2.png", "m-bot-pants-0.png", "m-shoe-sneakers-0.png", "m-top-hoodie-0.png", "m-hair-messy-0.png"]));
save("_t-boy-tee.png", stack(["m-skin-5.png", "m-bot-shorts-1.png", "m-shoe-sneakers-2.png", "m-top-tee-0.png", "m-hair-afro-2.png"]));
save("_t-girl-hoodie.png", stack(["f-skin-2.png", "f-bot-skirt-0.png", "f-shoe-sneakers-0.png", "f-top-hoodie-0.png", "f-hair-pony-0.png"]));
save("_t-girl-tee.png", stack(["f-skin-6.png", "f-bot-pants-2.png", "f-shoe-flats-0.png", "f-top-tee-0.png", "f-hair-bob-5.png"]));
save("_t-boy-spikes.png", stack(["m-skin-0.png", "m-bot-shorts-3.png", "m-shoe-sneakers-1.png", "m-top-hoodie-3.png", "m-hair-spikes-3.png"]));
save("_t-girl-waves.png", stack(["f-skin-3.png", "f-bot-skirt-1.png", "f-shoe-flats-4.png", "f-top-hoodie-1.png", "f-hair-waves-4.png"]));

console.log("wrote", fs.readdirSync(OUT).filter((f) => f.endsWith(".png")).length);

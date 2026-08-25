const fs = require("fs");
const path = require("path");
const jpeg = require("jpeg-js");

function shrink(file, quality, maxW) {
  const src = fs.readFileSync(file);
  const img = jpeg.decode(src, { maxMemoryUsageInMB: 256, useTArray: true });
  let { width, height, data } = img;
  if (width > maxW) {
    const nw = maxW;
    const nh = Math.round((height * maxW) / width);
    const out = Buffer.alloc(nw * nh * 4);
    for (let y = 0; y < nh; y++) {
      const sy = Math.min(height - 1, Math.floor((y * height) / nh));
      for (let x = 0; x < nw; x++) {
        const sx = Math.min(width - 1, Math.floor((x * width) / nw));
        const si = (sy * width + sx) * 4;
        const di = (y * nw + x) * 4;
        out[di] = data[si];
        out[di + 1] = data[si + 1];
        out[di + 2] = data[si + 2];
        out[di + 3] = 255;
      }
    }
    width = nw;
    height = nh;
    data = out;
  }
  const encoded = jpeg.encode({ data: Buffer.from(data), width, height }, quality);
  fs.writeFileSync(file, encoded.data);
  console.log(path.basename(file), width + "x" + height, encoded.data.length);
}

const art = path.join(__dirname, "..", "public", "art");
shrink(path.join(art, "landing-bg.jpg"), 72, 1600);
shrink(path.join(art, "landing-mobile.jpg"), 72, 900);
fs.copyFileSync(path.join(art, "landing-bg.jpg"), path.join(art, "hotel-hero.jpg"));

const fs = require("fs");
const path = require("path");

function walk(d, out = []) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(jpg|jpeg|png|webp|gif)$/i.test(f)) out.push({ p, size: st.size });
  }
  return out;
}

const rows = walk(path.join(__dirname, "..", "public"));
rows.sort((a, b) => b.size - a.size);
for (const r of rows) console.log(String(r.size).padStart(10), r.p);
console.log("count", rows.length);

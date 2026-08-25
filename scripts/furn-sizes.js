const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "public", "art", "furn");
let png = 0,
  jpg = 0;
for (const f of fs.readdirSync(dir)) {
  const s = fs.statSync(path.join(dir, f)).size;
  if (f.endsWith(".png")) png += s;
  else jpg += s;
  if (f.endsWith(".png") && s > 400000) console.log(s, f);
}
console.log("png total", png, "jpg total", jpg);

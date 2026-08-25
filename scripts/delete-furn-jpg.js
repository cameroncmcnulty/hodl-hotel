const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "public", "art", "furn");
let n = 0;
for (const f of fs.readdirSync(dir)) {
  if (/\.jpe?g$/i.test(f)) {
    const png = path.join(dir, f.replace(/\.jpe?g$/i, ".png"));
    if (fs.existsSync(png)) {
      fs.unlinkSync(path.join(dir, f));
      n++;
    }
  }
}
console.log("removed", n, "jpegs");

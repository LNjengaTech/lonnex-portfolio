// Fails on pre-release dependency versions or unpinned tags. Warns on ranges.
import { readFileSync } from "node:fs";
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const pre = /(alpha|beta|rc|canary|next|dev|experimental|nightly)/i;
const tags = new Set(["latest", "next", "canary", "beta", "alpha", "rc", "*"]);
let fail = false;
for (const group of ["dependencies", "devDependencies", "optionalDependencies"]) {
  for (const [name, ver] of Object.entries(pkg[group] || {})) {
    if (pre.test(ver) || tags.has(ver)) { console.error(`PRE-RELEASE/TAG: ${name}@${ver}`); fail = true; }
    else if (/^[\^~]/.test(ver)) console.warn(`unpinned range: ${name}@${ver} (use exact versions)`);
  }
}
if (fail) process.exit(1);
console.log("check:versions OK");

// Fails if colour literals or Tailwind default-palette classes appear outside app/globals.css
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = ["app", "components", "lib"];
const EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".mdx"]);
const ALLOW = new Set([join("app", "globals.css")]);
const hex = /#[0-9a-fA-F]{3,8}\b/;
const fn = /\b(rgb|rgba|hsl|hsla|oklch)\(/;
const palette = /\b(bg|text|border|ring|fill|stroke|from|to|via|outline|divide|shadow)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/;
const bad = [];

function walk(dir) {
  let entries = [];
  try { entries = readdirSync(dir); } catch { return; }
  for (const name of entries) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (EXT.has(extname(p)) && !ALLOW.has(p)) {
      readFileSync(p, "utf8").split("\n").forEach((line, i) => {
        if (hex.test(line) || fn.test(line) || palette.test(line)) bad.push(`${p}:${i + 1}  ${line.trim().slice(0, 90)}`);
      });
    }
  }
}
ROOTS.forEach(walk);
if (bad.length) {
  console.error("Colour literals found outside app/globals.css:\n" + bad.join("\n"));
  process.exit(1);
}
console.log("check:tokens OK");

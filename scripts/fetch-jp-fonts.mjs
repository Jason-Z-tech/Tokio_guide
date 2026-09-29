// Lädt die japanischen Schriften nur mit den Zeichen, die auf der Seite vorkommen.
// Aufruf (nach dem Hinzufügen neuer Kanji/Kana):  node scripts/fetch-jp-fonts.mjs
// Braucht Internet, nur Node.js ab Version 18, keine Pakete.
// Die Schriften stehen unter der SIL Open Font License (siehe assets/fonts/OFL-*.txt).
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const files = [
  ...readdirSync(root).filter((f) => f.endsWith(".html")).map((f) => join(root, f)),
  join(root, "css", "style.css"),
  join(root, "scripts", "build-layout.mjs"),
];

// Hiragana, Katakana, CJK-Zeichen und japanische Satzzeichen
const JP = /[　-ヿ㐀-䶿一-鿿＀-￯]/gu;
const chars = new Set();
for (const file of files) {
  for (const ch of readFileSync(file, "utf8").match(JP) ?? []) chars.add(ch);
}
const jpText = [...chars].sort().join("");

let latin = "";
for (let c = 0x20; c < 0x7f; c++) latin += String.fromCharCode(c);
latin += "ÄÖÜäöüßéèàç·–—„“‚‘«»°×";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36";

async function fetchSubset(family, text, out) {
  const url = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url, { headers: { "User-Agent": UA } })).text();
  const fontUrl = css.match(/url\((https:[^)]+)\)/)?.[1];
  if (!fontUrl) throw new Error(`Keine Schrift-URL für ${family}:\n${css.slice(0, 300)}`);
  const buf = Buffer.from(await (await fetch(fontUrl, { headers: { "User-Agent": UA } })).arrayBuffer());
  writeFileSync(join(root, "assets", "fonts", out), buf);
  console.log(`${out}: ${(buf.length / 1024).toFixed(1)} KB`);
}

console.log(`${chars.size} japanische Zeichen gefunden.`);
await fetchSubset("Zen+Kaku+Gothic+New:wght@700", jpText + "·", "zen-kaku-gothic-new-700-subset.woff2");
await fetchSubset("DotGothic16", latin + jpText, "dotgothic16-subset.woff2");

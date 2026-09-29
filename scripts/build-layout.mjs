// Schreibt Kopf, Navigation, Stationsband und Fusszeile in alle HTML-Seiten.
// Aufruf:  node scripts/build-layout.mjs
// Die Seiten bleiben normales HTML (kein Build nötig zum Veröffentlichen);
// ersetzt wird nur der Inhalt zwischen <!-- layout:NAME --> und <!-- /layout:NAME -->.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Reihenfolge = Fahrtrichtung für „vorherige / nächste Station".
export const STATIONS = [
  { file: "index.html", name: "Start", short: "Start", line: "s", code: "S", kanji: "東京", group: null },
  { file: "sehenswuerdigkeiten.html", name: "Sehenswürdigkeiten", short: "Sehenswürdigkeiten", line: "s", code: "S", kanji: "名所", group: "entdecken", hint: "16 Orte mit Stempelheft" },
  { file: "viertel.html", name: "Stadtviertel", short: "Viertel", line: "v", code: "V", kanji: "街", group: "entdecken", hint: "Von Shibuya bis Yanaka" },
  { file: "essen.html", name: "Essen & Trinken", short: "Essen", line: "e", code: "E", kanji: "食事", group: "entdecken", hint: "Ramen-Automat, Izakaya, Konbini" },
  { file: "ausfluege.html", name: "Tagesausflüge", short: "Ausflüge", line: "t", code: "T", kanji: "日帰り", group: "entdecken", hint: "Kamakura, Nikko, Hakone, Fuji" },
  { file: "kalender.html", name: "Jahreszeiten & Feste", short: "Kalender", line: "j", code: "J", kanji: "季節", group: "planen", hint: "Was ist los in welchem Monat?" },
  { file: "routen.html", name: "Reiserouten", short: "Routen", line: "r", code: "R", kanji: "旅程", group: "planen", hint: "1, 3 oder 5 Tage" },
  { file: "anreise.html", name: "Anreise & Geld", short: "Anreise", line: "a", code: "A", kanji: "到着", group: "planen", hint: "Ab Zürich, Einreise, Flughafen, Suica, Yen" },
  { file: "tipps.html", name: "Tipps & Knigge", short: "Tipps", line: "k", code: "K", kanji: "心得", group: "planen", hint: "Was man in Tokio wissen sollte" },
  { file: "packliste.html", name: "Packliste", short: "Packliste", line: "z", code: "P", kanji: "持ち物", group: "planen", hint: "Zum Abhaken" },
  { file: "sprache.html", name: "Sprach-Spickzettel", short: "Sprache", line: "z", code: "W", kanji: "言葉", group: "unterwegs", hint: "Phrasen mit Aussprache" },
  { file: "notfall.html", name: "Sicherheit & Notfall", short: "Notfall", line: "z", code: "N", kanji: "緊急", group: "unterwegs", hint: "Nummern, Erdbeben, Botschaft" },
];

const EXTRA_PAGES = [
  { file: "datenschutz.html" },
  { file: "quellen.html" },
  { file: "404.html" },
];

const GROUPS = [
  { id: "entdecken", name: "Entdecken", kanji: "発見", line: "s" },
  { id: "planen", name: "Planen", kanji: "計画", line: "a" },
  { id: "unterwegs", name: "Unterwegs", kanji: "移動", line: "z" },
];

const NAV_MAIN = ["sehenswuerdigkeiten.html", "viertel.html", "essen.html", "ausfluege.html", "anreise.html"];

const ICON = {
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="5" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><path d="M5 8v8M10 6h10M10 12h10M10 18h10"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  sun: '<svg class="theme-icon--sun" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8L6 18M18 6l1.8-1.8"/></svg>',
  moon: '<svg class="theme-icon--moon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
  prev: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const current = (file, target) => (file === target ? ' aria-current="page"' : "");

function head() {
  return `
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; font-src 'self'; style-src 'self'; script-src 'self'; connect-src 'none'; media-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'; upgrade-insecure-requests">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta name="color-scheme" content="light dark">
  <meta name="theme-color" content="#f4f1ea" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#0e1115" media="(prefers-color-scheme: dark)">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="assets/fonts/atkinson-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="assets/fonts/archivo-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="css/style.css">
  <script src="js/theme.js"></script>
  <script src="js/site.js" defer></script>
  `;
}

function header(file) {
  const navItems = NAV_MAIN.map((f) => {
    const s = STATIONS.find((x) => x.file === f);
    return `<li class="line-${s.line}"><a href="${s.file}"${current(file, s.file)}>${esc(s.short)}</a></li>`;
  }).join("\n          ");

  const groups = GROUPS.map((g) => {
    const items = STATIONS.filter((s) => s.group === g.id)
      .map(
        (s) =>
          `<li class="line-${s.line}"><a href="${s.file}"${current(file, s.file)}>${esc(s.name)}<small>${esc(s.hint)}</small></a></li>`
      )
      .join("\n            ");
    return `
        <section class="route-line line-${g.line}">
          <h3><span class="code code--sm"><span class="code__l">${g.name[0]}</span></span> ${g.name} <span lang="ja">${g.kanji}</span></h3>
          <ol>
            ${items}
          </ol>
        </section>`;
  }).join("");

  return `
  <a class="skip-link" href="#inhalt">Zum Inhalt springen</a>
  <header class="site-header">
    <div class="wrap site-header__inner">
      <a class="brand" href="index.html"${current(file, "index.html")}>
        <span class="brand__mark" lang="ja" aria-hidden="true">東京</span>
        <span>Tokio Guide<span class="brand__sub">Nächster Halt: Tokio</span></span>
      </a>
      <nav class="line-nav" aria-label="Hauptlinien">
        <ol>
          ${navItems}
        </ol>
      </nav>
      <div class="header-actions">
        <button class="icon-btn icon-btn--round js-only" type="button" data-theme-toggle aria-pressed="false">
          ${ICON.sun}${ICON.moon}<span class="visually-hidden">Dunkles Design einschalten</span>
        </button>
        <button class="icon-btn js-only" type="button" data-open-map aria-haspopup="dialog" aria-expanded="false" aria-controls="linienplan">
          ${ICON.menu}<span>Linienplan</span>
        </button>
      </div>
    </div>
  </header>
  <dialog class="route-map" id="linienplan" aria-labelledby="linienplan-titel">
    <div class="route-map__head">
      <h2 id="linienplan-titel">Linienplan <span lang="ja">路線図</span></h2>
      <button class="icon-btn icon-btn--round" type="button" data-close-map>${ICON.close}<span class="visually-hidden">Linienplan schliessen</span></button>
    </div>
    <nav class="route-map__body" aria-label="Alle Seiten">
      <section class="route-line line-s">
        <h3><span class="code code--sm"><span class="code__l">0</span></span> Start</h3>
        <ol>
          <li class="line-s"><a href="index.html"${current(file, "index.html")}>Startseite<small>Abfahrtstafel &amp; Liniennetz</small></a></li>
        </ol>
      </section>${groups}
    </nav>
  </dialog>
  `;
}

function band(file) {
  const i = STATIONS.findIndex((s) => s.file === file);
  if (i < 0) return "";
  const prev = STATIONS[i - 1];
  const next = STATIONS[i + 1];
  const link = (s, rel) =>
    s
      ? `<a href="${s.file}" rel="${rel}">${rel === "prev" ? ICON.prev : ""}<span><span class="dir">${rel === "prev" ? "前 · vorher" : "次 · nächste"}</span><br>${esc(s.name)}</span>${rel === "next" ? ICON.next : ""}</a>`
      : "";
  return `
      <nav class="station__band" aria-label="Nachbarstationen">
        ${link(prev, "prev")}
        ${link(next, "next")}
      </nav>
      `;
}

function footer(file) {
  const col = (g) =>
    `<div>
          <h2>${g.name}</h2>
          <ul>
            ${STATIONS.filter((s) => s.group === g.id)
              .map((s) => `<li><a href="${s.file}"${current(file, s.file)}>${esc(s.name)}</a></li>`)
              .join("\n            ")}
          </ul>
        </div>`;
  return `
  <footer class="site-footer">
    <div class="wrap">
      <div class="site-footer__grid">
        <div>
          <p class="footer-brand">Tokio Guide <span lang="ja">東京</span></p>
          <p class="site-footer__note">Ein privater, nicht-kommerzieller Reiseführer für Tokio – ohne Werbung, ohne Tracking, ohne Affiliate-Links. Angaben ohne Gewähr: Preise und Öffnungszeiten vor der Reise auf den verlinkten offiziellen Seiten prüfen.</p>
        </div>
        ${GROUPS.map(col).join("\n        ")}
      </div>
      <div class="site-footer__bottom">
        <p><a href="datenschutz.html"${current(file, "datenschutz.html")}>Datenschutz</a> · <a href="quellen.html"${current(file, "quellen.html")}>Quellen &amp; Lizenzen</a> · <a href="https://github.com/Jason-Z-tech/Tokio_guide/issues">Fehler melden (GitHub)</a></p>
        <p>Stand der Inhalte: September 2026</p>
      </div>
    </div>
  </footer>
  `;
}

const BLOCKS = { head, header, band, footer };

let changed = 0;
for (const { file } of [...STATIONS, ...EXTRA_PAGES]) {
  const path = join(root, file);
  if (!existsSync(path)) {
    console.warn(`fehlt: ${file}`);
    continue;
  }
  let html = readFileSync(path, "utf8");
  const before = html;
  for (const [name, render] of Object.entries(BLOCKS)) {
    const re = new RegExp(`(<!-- layout:${name} -->)[\\s\\S]*?(<!-- /layout:${name} -->)`);
    if (re.test(html)) html = html.replace(re, `$1${render(file)}$2`);
  }
  if (html !== before) {
    writeFileSync(path, html);
    changed++;
  }
}
console.log(`Layout aktualisiert: ${changed} Datei(en).`);

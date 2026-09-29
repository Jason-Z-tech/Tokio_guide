// Klickt alle Seiten mit echten Mausklicks durch – auf Desktop, Tablet und Handy.
// Aufruf: node tests/e2e.mjs            (lokale Kopie)
//         node tests/e2e.mjs --url https://jason-z-tech.github.io/Tokio_guide/

import path from 'node:path';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { launchBrowser } from './browser.mjs';
import { startServer } from '../scripts/serve.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const urlArg = process.argv.indexOf('--url');
// Ohne --url startet ein lokaler Server (file:// würde die Schriften blockieren).
const server = urlArg > 0 ? null : await startServer(8700 + Math.floor(Math.random() * 200));
const BASE = urlArg > 0 ? process.argv[urlArg + 1].replace(/\/?$/, '/') : `http://127.0.0.1:${server.address().port}/`;
const url = (file, hash = '') => new URL(file, BASE).href + hash;

const PAGES = readdirSync(ROOT).filter((f) => f.endsWith('.html')).sort();

const VIEWPORTS = [
  { label: 'Desktop', width: 1280, height: 900 },
  { label: 'Tablet', width: 820, height: 1180, mobile: true },
  { label: 'Handy', width: 390, height: 844, mobile: true },
];

let passed = 0;
const failures = [];
function check(condition, message) {
  if (condition) passed++;
  else failures.push(message);
}

/* ---------- Statische Prüfungen (ohne Browser) ---------- */
function testLinks() {
  const ids = new Map();
  for (const file of PAGES) {
    const html = readFileSync(path.join(ROOT, file), 'utf8');
    const list = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    const dupes = list.filter((id, i) => list.indexOf(id) !== i);
    check(dupes.length === 0, `[Links] ${file}: doppelte IDs ${[...new Set(dupes)].join(', ')}`);
    ids.set(file, new Set(list));
  }
  for (const file of PAGES) {
    const html = readFileSync(path.join(ROOT, file), 'utf8');
    for (const [, href] of html.matchAll(/\shref="([^"]+)"/g)) {
      if (/^(https?:|mailto:|tel:)/.test(href)) {
        check(!/[?&](utm_|gclid|fbclid|gad_source)/.test(href), `[Links] ${file}: Tracking-Parameter in ${href}`);
        continue;
      }
      const [target, hash] = href.split('#');
      const targetFile = target || file;
      if (!targetFile.endsWith('.html')) {
        check(existsSync(path.join(ROOT, targetFile)), `[Links] ${file}: Datei fehlt ${targetFile}`);
        continue;
      }
      check(ids.has(targetFile), `[Links] ${file}: Seite fehlt ${targetFile}`);
      if (hash && ids.has(targetFile)) check(ids.get(targetFile).has(hash), `[Links] ${file}: Anker fehlt ${targetFile}#${hash}`);
    }
    for (const [, src] of html.matchAll(/\ssrc="([^"]+)"/g)) {
      check(!/^https?:/.test(src), `[Links] ${file}: externe Quelle ${src}`);
      if (!/^https?:/.test(src)) check(existsSync(path.join(ROOT, src)), `[Links] ${file}: Datei fehlt ${src}`);
    }
    check(!/\sstyle="/.test(html), `[CSP] ${file}: style-Attribut (wird von der CSP blockiert)`);
    check(!/\son[a-z]+="/.test(html), `[CSP] ${file}: Inline-Eventhandler`);
    check(!/<script>(?!<\/script>)/.test(html), `[CSP] ${file}: Inline-Skript`);
    check(!/ß/.test(html.replace(/<[^>]+>/g, '')), `[Text] ${file}: «ß» statt «ss» (Schweizer Schreibweise)`);
  }
}

/* ---------- Jede Seite: lädt fehlerfrei, eine h1, kein Überlauf ---------- */
async function testPages(page, vp) {
  for (const file of PAGES) {
    const tag = `[${vp.label} · ${file}]`;
    page.errors.length = 0;
    await page.goto(url(file));
    const info = await page.eval(`(() => ({
      h1: document.querySelectorAll('h1').length,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      title: document.title,
      lang: document.documentElement.lang,
      js: document.documentElement.classList.contains('js'),
    }))()`);
    check(info.h1 === 1, `${tag} genau eine h1 erwartet, gefunden: ${info.h1}`);
    check(info.overflow <= 0, `${tag} läuft seitlich über (${info.overflow}px)`);
    check(info.title.length > 5, `${tag} Titel fehlt`);
    check(info.lang === 'de-CH', `${tag} lang="de-CH" fehlt`);
    check(info.js, `${tag} theme.js hat nicht geladen`);
    check(page.errors.length === 0, `${tag} Browser-Fehler: ${page.errors.join(' | ')}`);
  }
}

/* ---------- Menü (Linienplan) und Hell/Dunkel ---------- */
async function testMenuAndTheme(page, vp) {
  const tag = `[${vp.label} · Menü]`;
  await page.goto(url('tipps.html'));
  await page.click('[data-open-map]');
  check(await page.eval(`document.getElementById('linienplan').open`), `${tag} Linienplan öffnet nicht`);
  check(await page.eval(`document.querySelector('[data-open-map]').getAttribute('aria-expanded') === 'true'`), `${tag} aria-expanded nicht gesetzt`);
  check(await page.eval(`!!document.querySelector('#linienplan a[aria-current="page"][href="tipps.html"]')`), `${tag} aktuelle Seite nicht markiert`);
  await page.key('Escape');
  check(await page.eval(`!document.getElementById('linienplan').open`), `${tag} Esc schliesst den Linienplan nicht`);
  await page.click('[data-open-map]');
  await page.click('[data-close-map]');
  check(await page.eval(`!document.getElementById('linienplan').open`), `${tag} Schliessen-Knopf wirkt nicht`);
  // Navigation über den Plan
  await page.click('[data-open-map]');
  await page.click('#linienplan a[href="essen.html"]');
  await new Promise((r) => setTimeout(r, 400));
  check(await page.eval(`location.pathname.endsWith('essen.html')`), `${tag} Link im Linienplan führt nicht zur Seite`);

  const t = `[${vp.label} · Design]`;
  const before = await page.eval(`getComputedStyle(document.body).backgroundColor`);
  await page.click('[data-theme-toggle]');
  const after = await page.eval(`getComputedStyle(document.body).backgroundColor`);
  check(before !== after, `${t} Umschalter ändert die Farbe nicht`);
  await page.reload();
  check((await page.eval(`getComputedStyle(document.body).backgroundColor`)) === after, `${t} Wahl bleibt nach Neuladen nicht erhalten`);
  await page.click('[data-theme-toggle]');
  check((await page.eval(`getComputedStyle(document.body).backgroundColor`)) === before, `${t} Zurückschalten klappt nicht`);
}

/* ---------- Sehenswürdigkeiten: Filter & Stempelheft ---------- */
const visibleSpots = (page) => page.eval(`[...document.querySelectorAll('[data-filter-list] > *')].filter((c) => !c.hidden).map((c) => c.id)`);

async function testSpots(page, vp) {
  const tag = `[${vp.label} · Sehenswürdigkeiten]`;
  await page.goto(url('sehenswuerdigkeiten.html'));
  const all = await visibleSpots(page);
  check(all.length === 16, `${tag} 16 Orte erwartet, sichtbar: ${all.length}`);

  const cats = await page.eval(`[...document.querySelectorAll('[data-filter-kategorie]')].map((b) => b.dataset.filterKategorie)`);
  for (const cat of cats) {
    await page.click(`[data-filter-kategorie="${cat}"]`);
    const shown = await visibleSpots(page);
    const expected = await page.eval(`[...document.querySelectorAll('[data-filter-list] > *')].filter((c) => ${JSON.stringify(cat)} === 'alle' || c.dataset.kategorie === ${JSON.stringify(cat)}).length`);
    check(shown.length === expected && shown.length > 0, `${tag} Kategorie ${cat}: ${shown.length} statt ${expected}`);
    const status = await page.eval(`document.querySelector('[data-filter-status]').textContent`);
    check(status.startsWith(`${shown.length} von 16`), `${tag} Status «${status}» passt nicht zu ${shown.length}`);
  }
  await page.click('[data-filter-kategorie="alle"]');

  await page.click('[data-filter-tag="gratis"]');
  const free = await visibleSpots(page);
  check(free.includes('sensoji') && free.includes('meiji') && !free.includes('skytree'), `${tag} Filter «Eintritt frei» falsch: ${free.join(',')}`);
  await page.click('[data-filter-tag="gratis"]');

  await page.type('[data-filter-search]', 'ueno');
  const ueno = await visibleSpots(page);
  check(ueno.length === 2 && ueno.includes('ueno-zoo') && ueno.includes('nationalmuseum'), `${tag} Suche «ueno» findet ${ueno.join(',')}`);
  await page.type('[data-filter-search]', 'senso ji');
  check((await visibleSpots(page)).join() === 'sensoji', `${tag} Suche «senso ji» findet Senso-ji nicht`);
  await page.type('[data-filter-search]', 'xyzxyz');
  check(await page.eval(`!document.querySelector('[data-filter-empty]').hidden`), `${tag} Leerzustand erscheint nicht`);
  await page.click('[data-filter-reset]');
  check((await visibleSpots(page)).length === 16, `${tag} «Filter zurücksetzen» zeigt nicht alle`);
  check(await page.eval(`document.querySelector('[data-filter-search]').value === ''`), `${tag} Suche nicht geleert`);

  // Stempel
  await page.eval(`localStorage.removeItem('tokio-stempel')`);
  await page.reload();
  await page.click('[data-stamp="sensoji"]');
  await page.click('[data-stamp="teamlab"]');
  check(await page.eval(`document.querySelector('[data-stamp="sensoji"]').getAttribute('aria-pressed') === 'true'`), `${tag} Stempel wird nicht gesetzt`);
  check((await page.eval(`document.querySelector('[data-stamp-count]').textContent`)) === '2 / 16', `${tag} Stempelzähler falsch`);
  check(await page.eval(`document.querySelector('[data-stamp-slot="teamlab"]').classList.contains('is-stamped')`), `${tag} Stempelfeld nicht markiert`);
  await page.reload();
  check((await page.eval(`document.querySelector('[data-stamp-count]').textContent`)) === '2 / 16', `${tag} Stempel nach Neuladen verloren`);
  await page.click('[data-stamp="teamlab"]');
  check((await page.eval(`document.querySelector('[data-stamp-count]').textContent`)) === '1 / 16', `${tag} Stempel lässt sich nicht entfernen`);

  await page.goto(url('index.html'));
  check((await page.eval(`document.querySelector('[data-stamp-count]').textContent`)) === '1 / 16', `${tag} Startseite zeigt Stempelstand nicht`);
  await page.eval(`localStorage.removeItem('tokio-stempel')`);
}


/* ---------- Kalender, Routen, Packliste, Sprache ---------- */
const visibleMonths = (page) => page.eval(`[...document.querySelectorAll('[data-months] > li[data-month]')].filter((m) => !m.hidden).map((m) => m.dataset.month)`);

async function testTools(page, vp) {
  let tag = `[${vp.label} · Kalender]`;
  await page.goto(url('kalender.html'));
  check((await visibleMonths(page)).length === 12, `${tag} 12 Monate erwartet`);
  check((await page.eval(`document.querySelectorAll('.month.is-now').length`)) === 1, `${tag} aktueller Monat nicht markiert`);
  await page.click('[data-month-filter="winter"]');
  check((await visibleMonths(page)).length === 3, `${tag} Winter zeigt nicht 3 Monate`);
  await page.click('[data-month-filter="maerz"]');
  const march = await visibleMonths(page);
  check(march.length === 1, `${tag} Monatsfilter März zeigt ${march.length}`);
  await page.click('[data-month-filter="alle"]');
  check((await visibleMonths(page)).length === 12, `${tag} «Alle» zeigt nicht alle Monate`);

  tag = `[${vp.label} · Routen]`;
  await page.goto(url('routen.html', '#tage-5'));
  check(await page.eval(`document.getElementById('tab-tage-5').getAttribute('aria-selected') === 'true' && !document.getElementById('tage-5').hidden && document.getElementById('tag-1').hidden`), `${tag} #tage-5 öffnet das Tab nicht`);
  await page.click('#tab-tag-1');
  check(await page.eval(`!document.getElementById('tag-1').hidden && document.getElementById('tage-5').hidden`), `${tag} Klick auf Tab wirkt nicht`);
  await page.key('ArrowRight');
  check(await page.eval(`document.activeElement.id === 'tab-tage-3' && !document.getElementById('tage-3').hidden`), `${tag} Pfeiltaste wechselt das Tab nicht`);

  tag = `[${vp.label} · Packliste]`;
  await page.goto(url('packliste.html'));
  await page.eval(`localStorage.removeItem('tokio-packliste')`);
  await page.reload();
  const first = await page.eval(`document.querySelector('[data-packlist] input[type=checkbox]').id`);
  await page.click(`label[for="${first}"], #${first}`);
  check(await page.eval(`document.getElementById('${first}').checked`), `${tag} Abhaken klappt nicht`);
  await page.reload();
  check(await page.eval(`document.getElementById('${first}').checked`), `${tag} Häkchen nach Neuladen verloren`);
  check(/^1 von/.test(await page.eval(`document.querySelector('[data-pack-status]').textContent.trim()`)), `${tag} Fortschritt zeigt nicht «1 von …»`);
  await page.eval(`window.confirm = () => true`);
  await page.click('[data-pack-reset]');
  check(await page.eval(`!document.getElementById('${first}').checked`), `${tag} Zurücksetzen klappt nicht`);

  tag = `[${vp.label} · Sprache]`;
  await page.goto(url('sprache.html'));
  const firstShow = await page.eval(`(() => { const b = document.querySelector('[data-show]'); b.id ||= 'e2e-show'; return '#' + b.id; })()`);
  await page.click(firstShow);
  check(await page.eval(`document.querySelector('[data-show-dialog]').open && document.querySelector('[data-show-jp]').textContent.length > 0`), `${tag} Zeigen-Dialog öffnet nicht`);
  await page.key('Escape');
  check(await page.eval(`!document.querySelector('[data-show-dialog]').open`), `${tag} Esc schliesst den Dialog nicht`);
  // Headless-Chrome hat keine lokale japanische Stimme: Anhören-Knöpfe müssen dann versteckt sein.
  await new Promise((r) => setTimeout(r, 1800));
  const voices = await page.eval(`speechSynthesis.getVoices().filter((v) => v.lang.startsWith('ja') && v.localService).length`);
  if (voices === 0) check(await page.eval(`[...document.querySelectorAll('[data-speak]')].every((b) => b.hidden || b.offsetParent === null)`), `${tag} Anhören-Knöpfe sichtbar ohne lokale Stimme`);
}

/* ---------- Ablauf ---------- */
testLinks();
for (const vp of VIEWPORTS) {
  const page = await launchBrowser(vp);
  try {
    console.log(`[${vp.label}] läuft …`);
    await testPages(page, vp);
    await testMenuAndTheme(page, vp);
    await testSpots(page, vp);
    await testTools(page, vp);
  } catch (err) {
    failures.push(`[${vp.label}] Abbruch: ${err.message}`);
  } finally {
    await page.close();
  }
}

server?.close();
console.log(`\n${passed} Prüfungen bestanden, ${failures.length} fehlgeschlagen.`);
if (failures.length) {
  console.log(failures.map((f) => `  ✗ ${f}`).join('\n'));
  process.exitCode = 1;
}

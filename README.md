# Tokio Guide

Ein privater, nicht-kommerzieller Reiseführer für Tokio – für Reisende aus der Schweiz, Stand September 2026.
Ohne Werbung, ohne Tracking, ohne Affiliate-Links.

Das Design heisst **«Nächster Halt · 次は»**: Die Seite ist wie das Tokioter Bahnnetz aufgebaut.
Jede Rubrik ist eine Linie mit eigener Farbe, jede Seite eine Station mit Stationsschild.

| Linie | Seite | Inhalt |
|---|---|---|
| S | `sehenswuerdigkeiten.html` | 16 Orte mit Filter und Stempelheft |
| V | `viertel.html` | Stadtviertel |
| E | `essen.html` | Essen & Trinken |
| T | `ausfluege.html` | Tagesausflüge |
| J | `kalender.html` | Jahreszeiten & Feste |
| R | `routen.html` | Reiserouten für 1, 3 und 5 Tage |
| A | `anreise.html` | Anreise ab Zürich, Einreise, Flughafen, Suica, Geld |
| K | `tipps.html` | Tipps & Knigge |
| Z | `packliste.html`, `sprache.html`, `notfall.html` | Service für unterwegs |

## Starten

`index.html` doppelklicken – das reicht zum Lesen. Damit auch die Schriften laden (wie später online), die Vorschau starten:

```powershell
node scripts/serve.mjs
```

und http://localhost:8080 öffnen. Keine Installation und kein Build nötig.

## Veröffentlichen (GitHub Pages)

Die Seite wird wie `dyna-kompass` von GitHub Pages direkt aus dem Branch `main` ausgeliefert
(Einstellung: *Settings → Pages → Deploy from a branch → main / (root)*).

```powershell
git add -A
git commit -m "Inhalte aktualisiert"
git push
```

GitHub Pages unterstützt keine eigenen HTTP-Header; die Sicherheitsregeln (Content-Security-Policy)
stehen deshalb als `<meta>`-Tag in jeder Seite. `.nojekyll` sorgt dafür, dass GitHub die Dateien unverändert ausliefert.

## Seiten bearbeiten

Kopf, Menü («Linienplan»), das farbige Band mit vorheriger/nächster Station und die Fusszeile sind in
allen Seiten gleich. Sie werden aus `scripts/build-layout.mjs` erzeugt. Nach einer Änderung an Menü oder Seitenliste:

```powershell
node scripts/build-layout.mjs
```

Das Skript ersetzt nur den Inhalt zwischen `<!-- layout:… -->` und `<!-- /layout:… -->`. Alles andere bleibt, wie es ist.

**Neue japanische Zeichen?** Die japanischen Schriften enthalten nur die Zeichen, die auf der Seite vorkommen
(klein und schnell). Nach neuen Kanji oder Kana einmal laden (braucht Internet):

```powershell
node scripts/fetch-jp-fonts.mjs
```

**Fotos ergänzen:** Nur Bilder mit passender Lizenz (eigene Fotos, Unsplash, Pexels o. Ä.).
Als WebP oder AVIF, höchstens ca. 1600 px breit, nach `assets/img/`. Quelle und Lizenz auf `quellen.html` eintragen.

## Testen

```powershell
node tests/e2e.mjs
```

Startet ein unsichtbares Chrome (oder Edge) und klickt auf Desktop-, Tablet- und Handy-Breite alle Seiten durch:
Menü, Hell/Dunkel, Filter, Stempelheft, Kalender, Routen-Tabs, Packliste und Sprach-Karten. Prüft ausserdem,
dass alle internen Links und Anker existieren, jede Seite genau eine Hauptüberschrift hat,
nichts seitlich überläuft und der Browser keine Fehler meldet.
Benötigt nur Node.js (ab Version 18), keine Pakete.

## Aufbau

```
index.html, *.html      Seiten
css/style.css           ein Stylesheet für alles (Farben als Variablen, Hell/Dunkel)
js/theme.js             Hell/Dunkel ohne Aufblitzen (im <head>)
js/site.js              Menü, Design-Umschalter, Stempelheft, Uhr
js/filter.js            Filter der Sehenswürdigkeiten
js/kalender.js, js/tabs.js, js/packliste.js, js/sprache.js
assets/fonts/           Schriften (SIL Open Font License, Lizenztexte daneben)
scripts/                Layout- und Schrift-Skripte
tests/                  Browser-Test
```

## Rechtliches

Datenschutzerklärung: `datenschutz.html`. Quellen und Lizenzen: `quellen.html`.
Alle Angaben ohne Gewähr – Preise und Öffnungszeiten ändern sich, deshalb verlinkt der Guide auf die offiziellen Seiten.

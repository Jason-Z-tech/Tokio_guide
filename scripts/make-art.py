# Erzeugt die Illustrationen (SVG) für Sehenswürdigkeiten und Ausflüge.
# Eigene Werke, frei verwendbar (CC0). Aufruf: python scripts/make-art.py
import math, os

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "art")
INK = "#15171c"; PAPER = "#efe9dd"; WHITE = "#fbf8f2"
RED = "#d7282f"; TEAL = "#008a75"; ORANGE = "#e07b00"; GREEN = "#4a8a1f"
BLUE = "#0a7fab"; GOLD = "#b8914a"; PINK = "#d9608a"; SKY = "#bcd9e6"

def svg(name, body, sun=RED, sun_xy=(250, 58), sun_r=34, ground=True, bg=PAPER):
    parts = [f'<rect width="320" height="180" fill="{bg}"/>']
    if sun:
        parts.append(f'<circle cx="{sun_xy[0]}" cy="{sun_xy[1]}" r="{sun_r}" fill="{sun}"/>')
    parts.append(body)
    if ground:
        parts.append(f'<rect y="160" width="320" height="20" fill="{INK}"/>')
        parts.append(f'<rect y="156" width="320" height="4" fill="{sun or RED}"/>')
    s = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" '
         'role="img" preserveAspectRatio="xMidYMid slice">' + "".join(parts) + "</svg>\n")
    with open(os.path.join(OUT, f"{name}.svg"), "w", encoding="utf-8") as f:
        f.write(s)

def skyline(x0=0, x1=320, base=156, color="#cfc6b5", seed=1):
    out, x, i = [], x0, seed
    while x < x1:
        w = 14 + (i * 7) % 18; h = 20 + (i * 13) % 46
        out.append(f'<rect x="{x}" y="{base-h}" width="{w}" height="{h}" fill="{color}"/>')
        x += w + 3; i += 1
    return "".join(out)

def roof(cx, y, w, h, color=INK, lift=6):
    # geschwungenes japanisches Dach
    l, r = cx - w / 2, cx + w / 2
    return (f'<path d="M{l-6} {y+h} Q{cx-w/4} {y+h-2} {cx-w/6} {y} L{cx+w/6} {y} '
            f'Q{cx+w/4} {y+h-2} {r+6} {y+h} Q{r} {y+h-lift/2} {r-4} {y+h+2} L{l+4} {y+h+2} '
            f'Q{l} {y+h-lift/2} {l-6} {y+h}Z" fill="{color}"/>')

# 1 Senso-ji: Laterne im Tor + Pagode
b = skyline(seed=3)
b += '<g>'  # Pagode
for i in range(5):
    y = 50 + i * 20; w = 40 + i * 6
    b += roof(250, y, w, 8) + f'<rect x="{250-w/2+10}" y="{y+10}" width="{w-20}" height="10" fill="{RED}"/>'
b += f'<rect x="248" y="30" width="4" height="22" fill="{INK}"/></g>'
b += f'<rect x="40" y="40" width="12" height="116" fill="{RED}"/><rect x="148" y="40" width="12" height="116" fill="{RED}"/>'
b += roof(100, 22, 150, 16)
b += f'<rect x="72" y="56" width="56" height="70" rx="22" fill="{RED}"/><rect x="74" y="54" width="52" height="8" fill="{INK}"/><rect x="74" y="120" width="52" height="8" fill="{INK}"/>'
b += f'<path d="M86 70h28M86 84h28M86 98h28M86 112h28" stroke="{INK}" stroke-width="2" opacity=".35"/>'
svg("sensoji", b, sun=None)

# 2 Skytree
b = skyline(seed=5)
b += f'<path d="M150 156 L160 30 L170 156Z" fill="{INK}"/><rect x="159" y="8" width="2" height="24" fill="{INK}"/>'
b += f'<rect x="146" y="70" width="28" height="12" rx="4" fill="{INK}"/><rect x="149" y="50" width="22" height="8" rx="3" fill="{INK}"/>'
b += f'<path d="M150 156 L160 30 L170 156" fill="none" stroke="{SKY}" stroke-width="1.2" stroke-dasharray="3 5"/>'
b += f'<rect x="146" y="74" width="28" height="3" fill="{SKY}"/>'
svg("skytree", b, sun=BLUE, sun_xy=(90, 60), sun_r=30)

# 3 Sumida Aquarium: Quallen + Pinguin
b = f'<rect width="320" height="156" fill="#1c3b4a"/>'
for cx, cy, r, c in [(80, 60, 26, "#f2b8c6"), (160, 90, 18, "#bfe3ec"), (230, 50, 22, "#f7d9a8")]:
    b += f'<path d="M{cx-r} {cy} A{r} {r} 0 0 1 {cx+r} {cy} Q{cx} {cy+8} {cx-r} {cy}Z" fill="{c}"/>'
    for k in range(-2, 3):
        x = cx + k * r / 3
        b += f'<path d="M{x} {cy+3} q4 12 0 24 q-4 12 0 24" stroke="{c}" stroke-width="2" fill="none"/>'
b += f'<ellipse cx="270" cy="128" rx="14" ry="24" fill="{INK}"/><ellipse cx="272" cy="132" rx="8" ry="16" fill="{WHITE}"/><circle cx="270" cy="104" r="9" fill="{INK}"/><path d="M277 104 l8 3 -8 2z" fill="{ORANGE}"/>'
svg("sumida-aquarium", b, sun=None)

# 4 Edo-Tokyo Museum: Bau auf vier Beinen
b = skyline(seed=7)
b += f'<rect x="70" y="40" width="180" height="56" fill="{INK}"/><path d="M60 40 L260 40 L240 26 L80 26Z" fill="{INK}"/>'
for x in (92, 136, 176, 220):
    b += f'<rect x="{x}" y="96" width="12" height="60" fill="{INK}"/>'
b += f'<rect x="80" y="52" width="160" height="6" fill="{TEAL}"/><rect x="80" y="80" width="160" height="4" fill="{GOLD}"/>'
svg("edo-museum", b, sun=TEAL, sun_xy=(282, 44), sun_r=22)

# 5 Ueno Zoo: Eisbär im Park
b = ''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{GREEN}"/>' for x, y, r in [(40, 110, 30), (80, 96, 34), (286, 104, 32)])
b += f'<rect x="76" y="120" width="8" height="36" fill="{INK}"/><rect x="283" y="124" width="7" height="32" fill="{INK}"/>'
b += f'<path d="M120 156 q0 -52 60 -52 q46 0 56 26 q10 0 14 10 q-8 6 -16 4 l-6 12 z" fill="{WHITE}" stroke="{INK}" stroke-width="3"/>'
b += f'<circle cx="238" cy="126" r="2.5" fill="{INK}"/><circle cx="222" cy="112" r="5" fill="{WHITE}" stroke="{INK}" stroke-width="3"/>'
svg("ueno-zoo", b, sun=ORANGE, sun_xy=(180, 50), sun_r=26)

# 6 Tokyo National Museum
b = roof(160, 44, 190, 20)
b += f'<rect x="72" y="66" width="176" height="90" fill="{WHITE}" stroke="{INK}" stroke-width="3"/>'
for x in range(86, 240, 22):
    b += f'<rect x="{x}" y="80" width="10" height="76" fill="{INK}" opacity=".85"/>'
b += f'<rect x="146" y="112" width="28" height="44" fill="{INK}"/>'
svg("nationalmuseum", b, sun=GOLD, sun_xy=(270, 40), sun_r=22)

# 7 Meiji-Schrein: grosses Torii im Wald
b = ''.join(f'<path d="M{x} 156 l{w/2} -{h} l{w/2} {h}z" fill="{GREEN}" opacity="{o}"/>' for x, w, h, o in [(-10, 70, 110, .9), (40, 60, 90, .7), (230, 70, 118, .9), (270, 60, 96, .7)])
b += f'<rect x="104" y="58" width="14" height="98" fill="#6b4a2e"/><rect x="202" y="58" width="14" height="98" fill="#6b4a2e"/>'
b += f'<path d="M70 44 Q160 32 250 44 L246 56 Q160 46 74 56Z" fill="#6b4a2e"/><rect x="92" y="70" width="136" height="9" fill="#6b4a2e"/>'
svg("meiji", b, sun=None)

# 8 Shibuya Sky: Hochhaus mit Dachterrasse + Zebrastreifen
b = skyline(seed=11)
b += f'<rect x="120" y="30" width="76" height="126" fill="{INK}"/><path d="M116 30h84v-6h-84z" fill="{INK}"/>'
for y in range(40, 150, 10):
    b += f'<rect x="126" y="{y}" width="64" height="3" fill="#3a3f48"/>'
b += f'<circle cx="138" cy="20" r="4" fill="{INK}"/><rect x="136" y="23" width="4" height="7" fill="{INK}"/><circle cx="176" cy="20" r="4" fill="{INK}"/><rect x="174" y="23" width="4" height="7" fill="{INK}"/>'
b += ''.join(f'<rect x="{x}" y="164" width="10" height="12" fill="{WHITE}"/>' for x in range(20, 310, 20))
svg("shibuya-sky", b, sun=ORANGE, sun_xy=(250, 70), sun_r=36)

# 9 Tokyo Tower
b = skyline(seed=13)
b += f'<path d="M110 156 L152 56 L168 56 L210 156 L192 156 L160 80 L128 156Z" fill="{RED}"/>'
b += f'<path d="M152 56 L156 14 L164 14 L168 56Z" fill="{RED}"/><rect x="159" y="2" width="2" height="14" fill="{INK}"/>'
b += f'<rect x="140" y="64" width="40" height="8" fill="{WHITE}"/><rect x="150" y="30" width="20" height="6" fill="{WHITE}"/>'
b += f'<path d="M126 120 h68 M136 96 h48" stroke="{WHITE}" stroke-width="5"/>'
svg("tokyo-tower", b, sun=None)

# 10 Zojo-ji: Tempeltor, dahinter der Turm
b = f'<path d="M230 156 L248 70 L256 70 L274 156Z" fill="{RED}" opacity=".55"/><path d="M248 70 L251 36 L253 36 L256 70Z" fill="{RED}" opacity=".55"/>'
b += roof(120, 34, 170, 18) + roof(120, 76, 150, 14)
b += f'<rect x="56" y="54" width="128" height="22" fill="{RED}"/><rect x="60" y="92" width="120" height="64" fill="{RED}"/>'
b += f'<rect x="100" y="104" width="40" height="52" fill="{INK}"/>'
svg("zojoji", b, sun=None)

# 11 Hamarikyu: Teehaus am Teich vor Hochhäusern
b = skyline(color="#c9c0ae", seed=17)
b += f'<rect y="126" width="320" height="30" fill="{SKY}"/>'
b += roof(110, 86, 100, 14) + f'<rect x="72" y="102" width="76" height="24" fill="{WHITE}" stroke="{INK}" stroke-width="3"/>'
b += f'<path d="M160 126 Q210 100 260 126" stroke="#6b4a2e" stroke-width="6" fill="none"/>'
svg("hamarikyu", b, sun=PINK, sun_xy=(262, 50), sun_r=24)

# 12 teamLab: Lichtkreise
b = f'<rect width="320" height="180" fill="#101217"/>'
cols = [PINK, "#f4c542", TEAL, BLUE, ORANGE, "#9fd36b", WHITE]
for i in range(26):
    x = (i * 53) % 330; y = 20 + (i * 37) % 150; r = 4 + (i * 5) % 16
    b += f'<circle cx="{x}" cy="{y}" r="{r}" fill="{cols[i % len(cols)]}" opacity=".85"/>'
svg("teamlab", b, sun=None, ground=False, bg="#101217")

# 13 Sunshine Aquarium: Pinguin über den Dächern
b = skyline(seed=19)
b += f'<path d="M70 70 q60 -30 150 -8" stroke="{BLUE}" stroke-width="16" fill="none" opacity=".35"/>'
b += f'<g transform="rotate(-28 170 70)"><ellipse cx="170" cy="70" rx="40" ry="16" fill="{INK}"/><ellipse cx="174" cy="74" rx="28" ry="8" fill="{WHITE}"/><circle cx="206" cy="66" r="3" fill="{WHITE}"/><path d="M212 68 l12 2 -12 3z" fill="{ORANGE}"/></g>'
svg("sunshine-aquarium", b, sun=BLUE, sun_xy=(60, 46), sun_r=20)

# 14 Tokyo Dome City: speichenloses Riesenrad + Achterbahn
b = f'<circle cx="110" cy="84" r="58" fill="none" stroke="{INK}" stroke-width="8"/>'
for k in range(12):
    a = k * math.pi / 6; x = 110 + 58 * math.cos(a); y = 84 + 58 * math.sin(a)
    b += f'<rect x="{x-5:.1f}" y="{y-4:.1f}" width="10" height="8" rx="2" fill="{RED}"/>'
b += f'<path d="M180 156 L180 60 Q210 20 240 90 T300 70 L300 156" stroke="{BLUE}" stroke-width="6" fill="none"/>'
b += f'<ellipse cx="160" cy="150" rx="60" ry="12" fill="{WHITE}" stroke="{INK}" stroke-width="3"/>'
svg("tokyo-dome-city", b, sun=None)

# 15 Ghibli Museum: Haus im Grünen (bewusst ohne Figuren)
b = ''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}"/>' for x, y, r, c in [(60, 90, 44, GREEN), (270, 84, 48, GREEN), (230, 60, 26, "#6fa83a")])
b += f'<rect x="100" y="70" width="110" height="86" fill="{ORANGE}"/><rect x="120" y="40" width="40" height="30" fill="{PINK}"/>'
b += f'<circle cx="190" cy="54" r="16" fill="{SKY}" stroke="{INK}" stroke-width="3"/><path d="M190 38 v32 M174 54 h32" stroke="{INK}" stroke-width="2"/>'
b += f'<rect x="126" y="92" width="18" height="24" fill="{SKY}" stroke="{INK}" stroke-width="3"/><rect x="164" y="112" width="26" height="44" fill="{INK}"/>'
svg("ghibli", b, sun=None)

# 16 Disneyland: Feuerwerk über dem Wasser (ohne Markenmotive)
b = f'<rect width="320" height="180" fill="#1a2140"/>'
for cx, cy, c in [(80, 60, "#f4c542"), (170, 44, PINK), (250, 70, SKY)]:
    for k in range(12):
        a = k * math.pi / 6
        b += f'<line x1="{cx+8*math.cos(a):.1f}" y1="{cy+8*math.sin(a):.1f}" x2="{cx+30*math.cos(a):.1f}" y2="{cy+30*math.sin(a):.1f}" stroke="{c}" stroke-width="3" stroke-linecap="round"/>'
b += f'<rect y="132" width="320" height="24" fill="#26315c"/>' + skyline(base=132, color="#0f142b", seed=23)
svg("disneyland", b, sun=None, bg="#1a2140")

# Ausflüge
# Kamakura: sitzender Buddha
G = "#6e7a6a"
b = f'<path d="M50 156 q4 -34 40 -40 q-6 -26 22 -34 q28 8 22 34 q36 6 40 40z" fill="{G}"/>'
b += f'<circle cx="112" cy="58" r="22" fill="{G}"/><circle cx="112" cy="34" r="9" fill="{G}"/>'
b += f'<ellipse cx="112" cy="140" rx="50" ry="10" fill="#5b6658"/><path d="M100 60 q12 6 24 0" stroke="#4d574b" stroke-width="2" fill="none"/>'
b += f'<rect x="210" y="118" width="80" height="38" fill="{WHITE}" stroke="{INK}" stroke-width="3"/>' + roof(250, 100, 96, 14)
svg("kamakura", b, sun=RED, sun_xy=(250, 56), sun_r=30)

b = f'<rect x="60" y="80" width="200" height="76" fill="{RED}"/>' + roof(160, 50, 240, 20) + roof(160, 88, 200, 12, color=GOLD)
b += ''.join(f'<rect x="{x}" y="108" width="14" height="48" fill="{INK}"/>' for x in (80, 120, 186, 226)) + f'<rect x="140" y="108" width="40" height="48" fill="{GOLD}"/>'
svg("nikko", b, sun=None)

b = f'<path d="M0 120 L90 50 L170 110 L230 70 L320 120 L320 156 L0 156Z" fill="{GREEN}"/><rect y="126" width="320" height="30" fill="{SKY}"/>'
b += f'<path d="M120 124 h80 l-10 14 h-60z" fill="{RED}"/><rect x="156" y="96" width="4" height="28" fill="{INK}"/><path d="M160 98 l22 12 -22 6z" fill="{WHITE}"/>'
svg("hakone", b, sun=ORANGE, sun_xy=(262, 40), sun_r=22)

b = f'<path d="M20 156 L130 50 Q160 36 190 50 L300 156Z" fill="#3d5a80"/><path d="M130 50 Q160 36 190 50 L176 64 L166 58 L156 66 L146 58 L136 64Z" fill="{WHITE}"/>'
b += f'<rect y="136" width="320" height="20" fill="{SKY}"/><path d="M40 146 h240" stroke="{WHITE}" stroke-width="2" opacity=".7"/>'
svg("kawaguchiko", b, sun=RED, sun_xy=(262, 44), sun_r=20)

print("Illustrationen erstellt:", len(os.listdir(OUT)))

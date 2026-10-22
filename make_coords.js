// Writes images/coordinates.svg: the two graph-paper lines (N 51 09.872,
// E 004 56.741) redrawn with the chart's letters. Run: node make_coords.js
//
// The lines were drawn by someone else and sent to Michael to translate; the
// steps are traced from a photo of the sheet. Every letter keeps
// the direction it was drawn in, except where the drawn letter differs from the chart
// (G drawn as the chart's W, and W as G); those are redrawn, choosing directions so the
// line still never crosses itself and changing as few letters as possible.
const fs = require('fs');
const path = require('path');
const { STEP, OPP, LETTERS, READ, read, points } = require('./gernreich.js');

// As drawn (G and W the other way round from the chart).
const LEFT = `N N SE E N N NW NW E N NW N E NE NE NE
  SE N NE NE N NW NW N E NE SE E E NE NE NE
  NE NE W NW N E NW W NW NW NW W NW SW SW W N NE N NW NE NE N NE NE N NE NE E NW
  NE NE E NE NW NW E N NW NW W W NW N`.split(/\s+/);
// Written upside down: each step here is turned through 180 degrees on the paper.
const RIGHT = `S SW SE S SW NW N W NE NW SW SW SE S
  S S SE S SE NE S SE S S E SE S S SE SE W S SW S E SE SE W SW S SW SW W SE SW SW W SW
  SE E SE NE NE E S SW S SE SW SW S SW S S SE S S SE SE SE W S SE S W SW SW SW`.split(/\s+/);
const LEFT_WORDS = ['FIFTYONE', 'ZERONINE', 'EIGHTHUNDREDSEVENTYTWO'];
const RIGHT_WORDS = ['DOUBLEO', 'FOURFIFTYSIXSEVENHUNDREDFORTYONE'];

const swapGW = l => (l === 'G' ? 'W' : l === 'W' ? 'G' : l);
const hisRead = steps => steps.reduce((s, d, i) => (i % 2 ? s + swapGW(READ[steps[i - 1] + ' ' + d]) : s), '');

// Redraw `text` with the chart's letters, keeping his direction for each letter where
// it is the same shape, and never revisiting a point or crossing a diagonal.
function redraw(text, his) {
  const key = (x, y) => x + ',' + y;
  const seen = new Set([key(0, 0)]), diag = new Set(), out = [];
  let best = null, bestCost = Infinity;
  const ok = (x, y, d) => {
    const [dx, dy] = STEP[d], nx = x + dx, ny = y + dy;
    if (seen.has(key(nx, ny))) return false;
    return !(dx && dy && diag.has(key(Math.min(x, nx), Math.min(y, ny)) + (dx === dy ? '/' : '\\')));
  };
  const mark = (x, y, d, on) => {
    const [dx, dy] = STEP[d], nx = x + dx, ny = y + dy;
    on ? seen.add(key(nx, ny)) : seen.delete(key(nx, ny));
    if (dx && dy) { const k = key(Math.min(x, nx), Math.min(y, ny)) + (dx === dy ? '\\' : '/'); on ? diag.add(k) : diag.delete(k); }
  };
  (function go(i, x, y, cost) {
    if (cost >= bestCost) return;
    if (i === text.length) { best = out.slice(); bestCost = cost; return; }
    const [a, b] = LETTERS[text[i]];
    const ways = [[a, b], [OPP[b], OPP[a]]].map(w => [w, w[0] === his[2 * i] && w[1] === his[2 * i + 1] ? 0 : 1])
      .sort((p, q) => p[1] - q[1]);
    for (const [[s1, s2], c] of ways) {
      if (!ok(x, y, s1)) continue;
      mark(x, y, s1, true);
      const mx = x + STEP[s1][0], my = y + STEP[s1][1];
      if (ok(mx, my, s2)) {
        mark(mx, my, s2, true); out.push(s1, s2);
        go(i + 1, mx + STEP[s2][0], my + STEP[s2][1], cost + c);
        out.length -= 2; mark(mx, my, s2, false);
      }
      mark(x, y, s1, false);
    }
  })(0, 0, 0, 0);
  return best;
}

const turn = steps => steps.map(d => OPP[d]);
if (hisRead(LEFT) !== LEFT_WORDS.join('')) throw new Error('left trace reads ' + hisRead(LEFT));
if (hisRead(turn(RIGHT)) !== RIGHT_WORDS.join('')) throw new Error('right trace reads ' + hisRead(turn(RIGHT)));
const left = redraw(LEFT_WORDS.join(''), LEFT);
const right = turn(redraw(RIGHT_WORDS.join(''), turn(RIGHT)));
if (read(left) !== LEFT_WORDS.join('') || read(turn(right)) !== RIGHT_WORDS.join('')) throw new Error('redraw does not read back');

// Place the lines as on the sheet: the right line starts 25 squares right of and 50
// squares above the left line's start.
const lines = [
  { pts: points(left), ox: 0, oy: 0, breaks: [16, 32] },
  { pts: points(right), ox: 25, oy: -50, breaks: [14] },
];
const all = lines.flatMap(l => l.pts.map(([x, y]) => [x + l.ox, y + l.oy]));
const minX = Math.min(...all.map(p => p[0])) - 2, maxX = Math.max(...all.map(p => p[0])) + 2;
const minY = Math.min(...all.map(p => p[1])) - 2, maxY = Math.max(...all.map(p => p[1])) + 2;
const S = 12, w = (maxX - minX) * S, h = (maxY - minY) * S;
const X = x => ((x - minX) * S).toFixed(1), Y = y => ((y - minY) * S).toFixed(1);
const svg = [];
svg.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Two lines of the Gernreich writing on graph paper: on the left FIFTY ONE, ZERO NINE, EIGHT HUNDRED SEVENTY TWO; on the right, upside down, DOUBLE O FOUR, FIFTY SIX, SEVEN HUNDRED FORTY ONE">`);
svg.push('<style>.bg{fill:#fcfcfb}.g{stroke:#e4e2da;stroke-width:1}.p{fill:none;stroke:#0b0b0b;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}.d{fill:#e34948}.b{fill:#0b0b0b}' +
  '@media (prefers-color-scheme: dark){.bg{fill:#1a1a19}.g{stroke:#2c2c2a}.p{stroke:#f0efec}.d{fill:#e66767}.b{fill:#f0efec}}</style>');
svg.push(`<rect class="bg" width="${w}" height="${h}" rx="10"/>`);
const grid = [];
for (let x = minX + 1; x < maxX; x++) grid.push(`M${X(x)} 0V${h}`);
for (let y = minY + 1; y < maxY; y++) grid.push(`M0 ${Y(y)}H${w}`);
svg.push(`<path class="g" d="${grid.join('')}"/>`);
for (const { pts, ox, oy, breaks } of lines) {
  const P = pts.map(([x, y]) => [x + ox, y + oy]);
  svg.push(`<path class="p" d="${P.map((p, i) => (i ? 'L' : 'M') + X(p[0]) + ' ' + Y(p[1])).join('')}"/>`);
  svg.push(`<circle class="d" cx="${X(P[0][0])}" cy="${Y(P[0][1])}" r="5"/>`);
  for (const s of breaks) svg.push(`<circle class="b" cx="${X(P[s][0])}" cy="${Y(P[s][1])}" r="3.6"/>`);
  // arrowhead along the last step
  const [ax, ay] = P[P.length - 1], [bx, by] = P[P.length - 2];
  const ang = Math.atan2(ay - by, ax - bx), L = 10, sp = 0.5;
  const tip = [(ax - minX) * S, (ay - minY) * S];
  const wing = s => [tip[0] - L * Math.cos(ang + s * sp), tip[1] - L * Math.sin(ang + s * sp)];
  svg.push(`<path class="p" d="M${wing(1).map(v => v.toFixed(1)).join(' ')}L${tip.map(v => v.toFixed(1)).join(' ')}L${wing(-1).map(v => v.toFixed(1)).join(' ')}"/>`);
}
svg.push('</svg>');
fs.writeFileSync(path.join(__dirname, 'images', 'coordinates.svg'), svg.join('\n') + '\n');
const changed = (a, b) => a.reduce((n, d, i) => n + (i % 2 && (d !== b[i] || a[i - 1] !== b[i - 1]) ? 1 : 0), 0);
const which = (a, b, t) => t.split("").filter((_, i) => a[2 * i] !== b[2 * i] || a[2 * i + 1] !== b[2 * i + 1]).join(" ");
console.log(`redrawn letters, left: ${which(left, LEFT, LEFT_WORDS.join(""))}`);
console.log(`wrote images/coordinates.svg ${w}x${h}; letters redrawn: left ${changed(left, LEFT)}, right ${changed(right, RIGHT)}`);

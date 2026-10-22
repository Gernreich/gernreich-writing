// Writes images/article-1-claude.svg: Article 1 of the Universal Declaration of
// Human Rights as one line of the Gernreich writing, by Claude Code. The line
// works back and forth in rows, each word in its own colour. Run: node make_article.js
const fs = require('fs');
const path = require('path');
const { LETTERS, STEP, OPP, letters, points, read } = require('./gernreich.js');

const TEXT = 'All human beings are born free and equal in dignity and rights. They are endowed ' +
  'with reason and conscience and should act towards one another in a spirit of brotherhood.';
const words = TEXT.split(/\s+/).map(letters);
const lets = words.flat();

// A serpentine track: rows WIDTH units long, ROW units apart, run left to right,
// then right to left. Each letter can only be traced one way or the other, so the
// line cannot follow the track exactly; a beam search keeps the BEAM routes that
// stay closest to it without ever crossing or revisiting the line, letter by letter.
const WIDTH = 24, ROW = 6, ADV = 1.2, BEAM = 300;
function target(i) {
  const t = i * ADV, lap = WIDTH + ROW;
  const r = Math.floor(t / lap), u = t - r * lap;
  const y0 = r * ROW;
  if (u < WIDTH) return r % 2 ? [WIDTH - u, y0] : [u, y0];
  return [r % 2 ? 0 : WIDTH, y0 + (u - WIDTH)];
}
function beam() {
  const key = (x, y) => x + ',' + y;
  let states = [{ x: 0, y: 0, seen: new Set([key(0, 0)]), diag: new Set(), steps: [], err: 0 }];
  lets.forEach((l, i) => {
    const [a, b] = LETTERS[l], next = [];
    for (const s of states) for (const way of [[a, b], [OPP[b], OPP[a]]]) {
      let x = s.x, y = s.y, ok = true;
      const seen = new Set(s.seen), diag = new Set(s.diag);
      for (const d of way) {
        const [dx, dy] = STEP[d], nx = x + dx, ny = y + dy;
        if (seen.has(key(nx, ny))) { ok = false; break; }
        if (dx && dy) {
          const sq = key(Math.min(x, nx), Math.min(y, ny));
          if (diag.has(sq + (dx === dy ? '/' : '\\'))) { ok = false; break; }
          diag.add(sq + (dx === dy ? '\\' : '/'));
        }
        seen.add(key(nx, ny)); x = nx; y = ny;
      }
      if (!ok) continue;
      const [tx, ty] = target(i + 1);
      next.push({ x, y, seen, diag, steps: s.steps.concat(way), err: s.err + (x - tx) ** 2 + (y - ty) ** 2 });
    }
    next.sort((p, q) => p.err - q.err);
    states = next.slice(0, BEAM);
    if (!states.length) throw new Error('no crossing-free path at letter ' + i);
  });
  return states[0].steps;
}
const steps = beam();
if (read(steps) !== lets.join('')) throw new Error('does not read back');

const pts = points(steps);
const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
const minX = Math.min(...xs), minY = Math.min(...ys);
const S = 18, PAD = 30;
const W = (Math.max(...xs) - minX) * S + 2 * PAD, H = (Math.max(...ys) - minY) * S + 2 * PAD;
const X = x => ((x - minX) * S + PAD).toFixed(1), Y = y => ((y - minY) * S + PAD).toFixed(1);

// eight hues that hold up on white and on near-black, in turn by word
const LIGHT = ['#2a78d6', '#e34948', '#1e9e6a', '#c26a00', '#8a4fd8', '#0f8ea0', '#d23f8c', '#6b7f00'];
const DARK = ['#5aa0ef', '#f07574', '#3cc48b', '#eda100', '#a97ff0', '#2fb9cc', '#ef6aac', '#a3bd1f'];
const out = [];
out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Article 1 of the Universal Declaration of Human Rights written as one line in the Gernreich writing, each word in its own colour">`);
out.push('<style>.bg{fill:#fcfcfb}.p{fill:none;stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}.ink{fill:#0b0b0b}' +
  LIGHT.map((c, i) => `.c${i}{stroke:${c}}`).join('') +
  '@media (prefers-color-scheme: dark){.bg{fill:#1a1a19}.ink{fill:#f0efec}' +
  DARK.map((c, i) => `.c${i}{stroke:${c}}`).join('') + '}</style>');
out.push(`<rect class="bg" width="${W}" height="${H}" rx="10"/>`);
let k = 0;
words.forEach((w, wi) => {
  const seg = pts.slice(k, k + 2 * w.length + 1);
  out.push(`<path class="p c${wi % LIGHT.length}" d="${seg.map((p, j) => (j ? 'L' : 'M') + X(p[0]) + ' ' + Y(p[1])).join('')}"><title>${TEXT.split(/\s+/)[wi]}</title></path>`);
  k += 2 * w.length;
});
out.push(`<circle class="ink" cx="${X(pts[0][0])}" cy="${Y(pts[0][1])}" r="6"/>`);
const [ex, ey] = pts[pts.length - 1], [px, py] = pts[pts.length - 2];
const ang = Math.atan2(ey - py, ex - px) * 180 / Math.PI;
out.push(`<path class="ink" transform="translate(${X(ex)} ${Y(ey)}) rotate(${ang.toFixed(0)})" d="M4 0 L-8 -6 L-8 6 Z"/>`);
out.push('</svg>');
fs.writeFileSync(path.join(__dirname, 'images', 'article-1-claude.svg'), out.join('\n') + '\n');
console.log(`wrote images/article-1-claude.svg ${W}x${H}, ${lets.length} letters, ${words.length} words`);

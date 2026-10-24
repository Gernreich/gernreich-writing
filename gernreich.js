// The Gernreich writing: every letter is two unit steps on a square grid.
// Shared by index.html (the writer, the reader and the alphabet) and by
// node, which checks it (see the end of the file).

const STEP = {
  E: [1, 0], W: [-1, 0], N: [0, -1], S: [0, 1],
  NE: [1, -1], NW: [-1, -1], SE: [1, 1], SW: [-1, 1],
};
const OPP = { E: 'W', W: 'E', N: 'S', S: 'N', NE: 'SW', SW: 'NE', NW: 'SE', SE: 'NW' };

// Each letter as drawn in the chart, as its two steps in one direction of travel.
// Traced the other way it is OPP[second], OPP[first]. y grows downwards.
const LETTERS = {
  KH: ['N', 'SE'], 'Ř': ['E', 'SW'], Z: ['SE', 'N'], Q: ['SW', 'E'],
  J: ['S', 'NE'], X: ['W', 'SE'], K: ['NE', 'S'], V: ['SE', 'W'],
  B: ['S', 'E'], W: ['N', 'E'], P: ['E', 'S'], Y: ['S', 'W'],
  G: ['E', 'E'], F: ['S', 'S'], M: ['SE', 'SW'], C: ['SE', 'NE'], U: ['NE', 'SE'], L: ['SW', 'SE'],
  D: ['SW', 'S'], H: ['E', 'SE'], S: ['S', 'SW'], I: ['SE', 'E'],
  R: ['SE', 'S'], N: ['E', 'NE'], O: ['S', 'SE'], A: ['NE', 'E'],
  T: ['SE', 'SE'], E: ['NE', 'NE'],
};

// The chart's groups: the squared distance between a letter's two ends.
function span2(letter) {
  const [a, b] = LETTERS[letter];
  const x = STEP[a][0] + STEP[b][0], y = STEP[a][1] + STEP[b][1];
  return x * x + y * y;
}

// Ordered pair of steps -> letter, both directions of travel.
const READ = {};
for (const [l, [a, b]] of Object.entries(LETTERS)) {
  READ[a + ' ' + b] = l;
  READ[OPP[b] + ' ' + OPP[a]] = l;
}

// Text -> letters. KH is one letter; anything not in the alphabet is dropped.
function letters(text) {
  const t = text.toUpperCase(), out = [];
  for (let i = 0; i < t.length; i++) {
    if (t[i] === 'K' && t[i + 1] === 'H') { out.push('KH'); i++; }
    else if (LETTERS[t[i]]) out.push(t[i]);
  }
  return out;
}

// Steps -> text. An odd last step is shown as an unfinished letter.
function read(steps) {
  let s = '';
  for (let i = 0; i + 1 < steps.length; i += 2) s += READ[steps[i] + ' ' + steps[i + 1]] || '?';
  return s;
}

// Letters -> steps. Each letter can be traced either way; the choice is the
// writer's. Search for a choice that never revisits a grid point or crosses an
// earlier diagonal, preferring the one that moves right (writing runs left to
// right), and fall back to the plain forward direction if the search runs long.
// prefer(x, y, i), if given, ranks where letter i should end: lower is better.
function write(lets, budget = 40000, prefer) {
  const key = (x, y) => x + ',' + y;
  const seen = new Set([key(0, 0)]), diag = new Set();
  const out = [];
  let nodes = 0;
  function ok(x, y, d) {
    const [dx, dy] = STEP[d], nx = x + dx, ny = y + dy;
    if (seen.has(key(nx, ny))) return false;
    // a diagonal crosses the other diagonal of the same unit square
    if (dx && dy && diag.has(key(Math.min(x, nx), Math.min(y, ny)) + (dx === dy ? '/' : '\\'))) return false;
    return true;
  }
  function mark(x, y, d, on) {
    const [dx, dy] = STEP[d], nx = x + dx, ny = y + dy;
    on ? seen.add(key(nx, ny)) : seen.delete(key(nx, ny));
    if (dx && dy) {
      const k = key(Math.min(x, nx), Math.min(y, ny)) + (dx === dy ? '\\' : '/');
      on ? diag.add(k) : diag.delete(k);
    }
  }
  function go(i, x, y) {
    if (i === lets.length) return true;
    if (++nodes > budget) return false;
    const [a, b] = LETTERS[lets[i]];
    const ways = [[a, b], [OPP[b], OPP[a]]];
    const end = w => [x + STEP[w[0]][0] + STEP[w[1]][0], y + STEP[w[0]][1] + STEP[w[1]][1]];
    const rank = prefer ? w => prefer(...end(w), i) : w => -end(w)[0];
    ways.sort((p, q) => rank(p) - rank(q));
    for (const [s1, s2] of ways) {
      if (!ok(x, y, s1)) continue;
      mark(x, y, s1, true);
      const mx = x + STEP[s1][0], my = y + STEP[s1][1];
      if (ok(mx, my, s2)) {
        mark(mx, my, s2, true);
        out.push(s1, s2);
        if (go(i + 1, mx + STEP[s2][0], my + STEP[s2][1])) return true;
        out.length -= 2;
        mark(mx, my, s2, false);
      }
      mark(x, y, s1, false);
    }
    return false;
  }
  if (go(0, 0, 0)) return { steps: out, clean: true };
  return { steps: lets.flatMap(l => LETTERS[l]), clean: false };
}

// Steps -> grid points, starting at the origin.
function points(steps) {
  const p = [[0, 0]];
  for (const d of steps) { const [x, y] = p[p.length - 1]; p.push([x + STEP[d][0], y + STEP[d][1]]); }
  return p;
}

// Letters -> steps for one long line that works back and forth in rows. The rows
// are WIDTH units long and ROW units apart, run left to right, then right to left.
// Each letter can only be traced one way or the other, so the line cannot follow
// the track exactly; a beam search keeps the BEAM routes that stay closest to it
// without ever crossing or revisiting the line, letter by letter. rand, if given,
// varies the track and how closely each letter is held to it, so every call draws
// the text a different way; without it the drawing is always the same.
function snake(lets, rand) {
  const r = rand || (() => 0.5);
  const WIDTH = rand ? 18 + Math.floor(13 * r()) : 24, ROW = rand ? 5 + Math.floor(3 * r()) : 6;
  const ADV = rand ? 1.05 + 0.3 * r() : 1.2, BEAM = 300;
  const key = (x, y) => x + ',' + y;
  function target(i) {
    const t = i * ADV, lap = WIDTH + ROW;
    const n = Math.floor(t / lap), u = t - n * lap;
    const y0 = n * ROW;
    if (u < WIDTH) return n % 2 ? [WIDTH - u, y0] : [u, y0];
    return [n % 2 ? 0 : WIDTH, y0 + (u - WIDTH)];
  }
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
      const [tx, ty] = target(i + 1), d2 = (x - tx) ** 2 + (y - ty) ** 2;
      next.push({ x, y, seen, diag, steps: s.steps.concat(way), err: s.err + (rand ? d2 * (0.25 + 1.5 * r()) + 20 * r() : d2) });
    }
    next.sort((p, q) => p.err - q.err);
    states = next.slice(0, BEAM);
    if (!states.length) throw new Error('no crossing-free path at letter ' + i);
  });
  return states[0].steps;
}

// Text and its steps (from snake) -> an SVG of the one line, each word in its own
// colour, from a dot at the start to an arrow at the end. Returns { svg, W, H }.
function snakeSVG(text, steps, label) {
  const titles = text.split(/\s+/).filter(t => letters(t).length);
  const words = titles.map(letters);
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
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${label}">`);
  out.push('<style>.bg{fill:#fcfcfb}.p{fill:none;stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}.ink{fill:#0b0b0b}' +
    LIGHT.map((c, i) => `.c${i}{stroke:${c}}`).join('') +
    '@media (prefers-color-scheme: dark){.bg{fill:#1a1a19}.ink{fill:#f0efec}' +
    DARK.map((c, i) => `.c${i}{stroke:${c}}`).join('') + '}</style>');
  out.push(`<rect class="bg" width="${W}" height="${H}" rx="10"/>`);
  let k = 0;
  words.forEach((w, wi) => {
    const seg = pts.slice(k, k + 2 * w.length + 1);
    out.push(`<path class="p c${wi % LIGHT.length}" d="${seg.map((p, j) => (j ? 'L' : 'M') + X(p[0]) + ' ' + Y(p[1])).join('')}"><title>${titles[wi]}</title></path>`);
    k += 2 * w.length;
  });
  out.push(`<circle class="ink" cx="${X(pts[0][0])}" cy="${Y(pts[0][1])}" r="6"/>`);
  const [ex, ey] = pts[pts.length - 1], [px, py] = pts[pts.length - 2];
  const ang = Math.atan2(ey - py, ex - px) * 180 / Math.PI;
  out.push(`<path class="ink" transform="translate(${X(ex)} ${Y(ey)}) rotate(${ang.toFixed(0)})" d="M4 0 L-8 -6 L-8 6 Z"/>`);
  out.push('</svg>');
  return { svg: out.join('\n') + '\n', W, H };
}

if (typeof module !== 'undefined') module.exports = { STEP, OPP, LETTERS, READ, span2, letters, read, write, points, snake, snakeSVG };

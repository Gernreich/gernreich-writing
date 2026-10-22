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

if (typeof module !== 'undefined') module.exports = { STEP, OPP, LETTERS, READ, span2, letters, read, write, points };

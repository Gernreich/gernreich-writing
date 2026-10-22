// Writes images/alphabet.svg, the alphabet chart redrawn from the table in
// gernreich.js, so the chart and the writer cannot disagree. Run: node make_chart.js
const fs = require('fs');
const path = require('path');
const { LETTERS, span2, points } = require('./gernreich.js');

const CELL = 86, U = 22, LABEL = 118, TOP = 74, ROWH = 112;
const groups = {};
for (const l of Object.keys(LETTERS)) (groups[span2(l)] ||= []).push(l);
const order = Object.keys(groups).map(Number).sort((a, b) => a - b);
const W = LABEL + 8 * CELL + 16, H = TOP + order.length * ROWH + 18;

const out = [];
out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="The Gernreich writing: 28 letters, each two steps on a square grid, in five rows by the squared distance between the letter's ends">`);
out.push(`<style>
  .bg { fill: #fcfcfb; } .t { fill: #0b0b0b; } .s { fill: #6b6a66; } .dot { fill: #c9c8c1; }
  .g { fill: none; stroke: #0b0b0b; stroke-width: 3.2; stroke-linecap: round; stroke-linejoin: round; }
  .end { fill: #0b0b0b; } .rule { stroke: #e2e1db; stroke-width: 1; }
  text { font-family: ui-sans-serif, -apple-system, "Segoe UI", system-ui, sans-serif; }
  @media (prefers-color-scheme: dark) {
    .bg { fill: #1a1a19; } .t { fill: #f0efec; } .s { fill: #a3a29a; } .dot { fill: #4a4a45; }
    .g { stroke: #f0efec; } .end { fill: #f0efec; } .rule { stroke: #3a3a37; }
  }
</style>`);
out.push(`<rect class="bg" width="${W}" height="${H}" rx="10"/>`);
out.push(`<text class="t" x="24" y="38" font-size="22" font-weight="700">Gernreich writing</text>`);
out.push(`<text class="s" x="24" y="58" font-size="13">Every letter is two steps on a square grid. Rows: the squared distance between a letter's ends.</text>`);

order.forEach((g, r) => {
  const y0 = TOP + r * ROWH;
  if (r) out.push(`<line class="rule" x1="20" x2="${W - 20}" y1="${y0}" y2="${y0}"/>`);
  out.push(`<text class="t" x="24" y="${y0 + 50}" font-size="20" font-weight="700">${g}</text>`);
  out.push(`<text class="s" x="24" y="${y0 + 70}" font-size="12">unit${g > 1 ? 's' : ''}², ${groups[g].length} letters</text>`);
  groups[g].forEach((l, i) => {
    const pts = points(LETTERS[l]);
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const ox = LABEL + i * CELL + CELL / 2, oy = y0 + 44;
    const X = x => (ox + (x - cx) * U).toFixed(1), Y = y => (oy + (y - cy) * U).toFixed(1);
    // the grid points around the letter
    for (let gx = Math.ceil(cx - 1.5); gx <= cx + 1.5; gx++)
      for (let gy = Math.ceil(cy - 1.5); gy <= cy + 1.5; gy++)
        out.push(`<circle class="dot" cx="${X(gx)}" cy="${Y(gy)}" r="1.8"/>`);
    out.push(`<path class="g" d="${pts.map((p, k) => (k ? 'L' : 'M') + X(p[0]) + ' ' + Y(p[1])).join('')}"/>`);
    for (const p of [pts[0], pts[2]]) out.push(`<circle class="end" cx="${X(p[0])}" cy="${Y(p[1])}" r="3"/>`);
    out.push(`<text class="t" x="${ox}" y="${y0 + 100}" font-size="15" font-weight="650" text-anchor="middle">${l}</text>`);
  });
});
out.push('</svg>');
fs.writeFileSync(path.join(__dirname, 'images', 'alphabet.svg'), out.join('\n') + '\n');
console.log('wrote images/alphabet.svg', W + 'x' + H);

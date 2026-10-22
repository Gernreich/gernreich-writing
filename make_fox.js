// Writes images/fox.svg: THE QUICK RED FOX JUMPED OVER THE LAZY BROWN DOG in the
// chart's letters, a word to a line, each starting at a dot. Run: node make_fox.js
const fs = require('fs');
const path = require('path');
const { letters, write, points, read } = require('./gernreich.js');

const TEXT = 'the quick red fox jumped over the lazy brown dog';
const S = 22, PAD = 26, GAP = 2, MAXW = 30;
let x = 0, y = 0, rowH = 0, W = 0;
const placed = [];
for (const word of TEXT.split(' ')) {
  const lets = letters(word), r = write(lets);
  if (!r.clean || read(r.steps) !== lets.join('')) throw new Error('cannot write ' + word);
  const pts = points(r.steps);
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const minX = Math.min(...xs), minY = Math.min(...ys);
  const bw = Math.max(...xs) - minX, bh = Math.max(...ys) - minY;
  if (x > 0 && x + bw > MAXW) { x = 0; y += rowH + GAP; rowH = 0; }
  placed.push(pts.map(p => [p[0] - minX + x, p[1] - minY + y]));
  W = Math.max(W, x + bw); x += bw + GAP; rowH = Math.max(rowH, bh);
}
const w = W * S + 2 * PAD, h = (y + rowH) * S + 2 * PAD;
const P = v => (v * S + PAD).toFixed(1);
const out = [];
out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="The quick red fox jumped over the lazy brown dog, in the Gernreich writing, a word to a line">`);
out.push('<style>.bg{fill:#fcfcfb}.p{fill:none;stroke:#0b0b0b;stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round}.d{fill:#e34948}' +
  '@media (prefers-color-scheme: dark){.bg{fill:#1a1a19}.p{stroke:#f0efec}.d{fill:#e66767}}</style>');
out.push(`<rect class="bg" width="${w}" height="${h}" rx="10"/>`);
for (const pts of placed) {
  out.push(`<path class="p" d="${pts.map((p, i) => (i ? 'L' : 'M') + P(p[0]) + ' ' + P(p[1])).join('')}"/>`);
  out.push(`<circle class="d" cx="${P(pts[0][0])}" cy="${P(pts[0][1])}" r="5"/>`);
}
out.push('</svg>');
fs.writeFileSync(path.join(__dirname, 'images', 'fox.svg'), out.join('\n') + '\n');
console.log(`wrote images/fox.svg ${w}x${h}`);

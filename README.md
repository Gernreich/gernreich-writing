# Gernreich writing

**[← All projects](https://gernreich.github.io/)**

**[Read the writeup, write and read the script](https://gernreich.github.io/gernreich-writing/)**

A script in which every letter is two steps on a square grid, and every word is
one unbroken line. A pen on the grid can step in eight directions; two steps
that don't double back make exactly 28 shapes, and the alphabet uses all of
them: A–Z, KH, and a 28th drawn in the chart as a marked R (Ř). Each shape can
be traced either way, so the writer picks a direction for each letter to keep
the line going; a reader needs only the starting dot.

**Whose work this is.** The Gernreich writing, its alphabet and the drawings in
`images/` that are not SVG, and `originals/angular.DRW` (TopDraw 2.00, NeXT), are
Michael Carnright's. `gernreich.js` (writer and reader), the redrawn chart
`images/alphabet.svg` and the second Article 1 drawing
`images/article-1-claude.svg` are by Claude Code.

| Path | What |
|---|---|
| `index.html` | the writeup, with a live writer and reader |
| `gernreich.js` | the alphabet table, `write` (text to path) and `read` (path to text) |
| `make_chart.js` | draws `images/alphabet.svg` from the table |
| `make_article.js` | draws `images/article-1-claude.svg`: Article 1 of the Universal Declaration of Human Rights as one line |
| `test.js` | `node test.js`: the table, Michael's samples read back, round trips, and both SVGs reproduce |
| `images/` | the original chart and samples (ONE, GOUD, the fox sentence, Article 1, the map loop, the name in Ogham) |
| `originals/angular.DRW` | the drawing the chart came from |

The fox sentence and the Article 1 drawing were drawn with G and W the other way
round from the chart, and Article 1 also swaps T and E. The chart is the
reference.

Released under [CC0 1.0](LICENSE).

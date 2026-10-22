# Gernreich writing

**[← All projects](https://gernreich.github.io/)**

**[Read the writeup, write and read the script](https://gernreich.github.io/gernreich-writing/)**

A script in which every letter is two steps on a square grid, and every word is
one unbroken line. A pen on the grid can step in eight directions; two steps
that don't double back make exactly 28 shapes, and the alphabet uses all of
them, assigned so that the distance between a letter's two ends follows how
common it is in English: T and E, the most common, reach furthest, which keeps
a sentence moving across the page and makes it easier to write. The letters
are A–Z, KH, and a 28th drawn in the chart as a marked R (Ř). Each shape can
be traced either way, so the writer picks a direction for each letter to keep
the line going; a reader needs only the starting dot.

**Whose work this is.** The Gernreich writing, its alphabet and the drawings in
`images/` that are not SVG, and `originals/angular.DRW` (TopDraw 2.00, NeXT), are
Michael Carnright's. `gernreich.js` (writer and reader), the redrawn chart
`images/alphabet.svg`, `images/fox.svg` and the Article 1 drawing
`images/article-1-claude.svg` are by Claude Code.

| Path | What |
|---|---|
| `index.html` | the writeup, with a live writer and reader |
| `gernreich.js` | the alphabet table, `write` (text to path) and `read` (path to text) |
| `make_chart.js` | draws `images/alphabet.svg` from the table |
| `make_article.js` | draws `images/article-1-claude.svg`: Article 1 of the Universal Declaration of Human Rights as one line |
| `test.js` | `node test.js`: the table, Michael's samples read back, round trips, and both SVGs reproduce |
| `make_fox.js` | draws `images/fox.svg`: the fox sentence, a word to a line |
| `images/` | the original chart and samples (ONE, GOUD) |
| `originals/angular.DRW` | the drawing the chart came from |

Released under [CC0 1.0](LICENSE).

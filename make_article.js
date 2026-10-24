// Writes images/article-1-claude.svg: Article 1 of the Universal Declaration of
// Human Rights as one line of the Gernreich writing, by Claude Code. The line
// works back and forth in rows, each word in its own colour (snake and snakeSVG in
// gernreich.js; the page redraws it a different way with each click).
// Run: node make_article.js
const fs = require('fs');
const path = require('path');
const { letters, read, snake, snakeSVG } = require('./gernreich.js');

const TEXT = 'All human beings are born free and equal in dignity and rights. They are endowed ' +
  'with reason and conscience and should act towards one another in a spirit of brotherhood.';
const lets = letters(TEXT);
const steps = snake(lets);
if (read(steps) !== lets.join('')) throw new Error('does not read back');

const { svg, W, H } = snakeSVG(TEXT, steps, 'Article 1 of the Universal Declaration of Human Rights written as one line in the Gernreich writing, each word in its own colour');
fs.writeFileSync(path.join(__dirname, 'images', 'article-1-claude.svg'), svg);
console.log(`wrote images/article-1-claude.svg ${W}x${H}, ${lets.length} letters, ${TEXT.split(/\s+/).length} words`);

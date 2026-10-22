// node test.js: checks the alphabet, the writer and the reader, and that the two
// SVGs are what make_chart.js and make_article.js draw now.
const fs = require('fs');
const { execFileSync } = require('child_process');
const g = require('./gernreich.js');
let fails = 0;
const check = (name, ok) => { console.log((ok ? 'ok   ' : 'FAIL ') + name); if (!ok) fails++; };

check('28 letters, 56 ordered pairs of steps, each read as one letter',
  Object.keys(g.LETTERS).length === 28 && Object.keys(g.READ).length === 56);
const groups = {};
for (const l in g.LETTERS) (groups[g.span2(l)] ||= []).push(l);
check('the chart\'s groups: 1, 2, 4, 5, 8 units² with 8, 4, 6, 8, 2 letters',
  JSON.stringify(Object.keys(groups).map(k => [+k, groups[k].length])) === '[[1,8],[2,4],[4,6],[5,8],[8,2]]');

// paths traced from Michael's drawings, read with the chart
const traced = {
  'ONE (one.bmp, first)': ['S SE E NE NE NE', 'ONE'],
  'ONE (one.bmp, second)': ['NW N SW W NE NE', 'ONE'],
  'GOUD (gold.GIF)': ['E E S SE NE SE N NE', 'GOUD'],
  'QUICK (fox)': ['SW E NE SE SE E SE NE NE S', 'QUICK'],
  'JUMPED (fox)': ['S NE NE SE SE SW E S NE NE N NE', 'JUMPED'],
  'LAZY (fox)': ['SW SE NE E SE N E N', 'LAZY'],
  'DOG (fox, G drawn as W)': ['SW S S SE N E', 'DOW'],
};
for (const [k, [steps, want]] of Object.entries(traced)) check(k + ' reads ' + want, g.read(steps.split(' ')) === want);

const article = 'All human beings are born free and equal in dignity and rights. They are endowed ' +
  'with reason and conscience and should act towards one another in a spirit of brotherhood.';
for (const t of ['the quick red fox jumped over the lazy brown dog', 'Michael Carnright', article]) {
  const L = g.letters(t), w = g.write(L);
  check(`writes "${t.slice(0, 30)}..." without crossing, and reads it back`, w.clean && g.read(w.steps) === L.join(''));
}
check('KH is one letter', g.letters('khaki').join(',') === 'KH,A,K,I');

for (const [script, file] of [['make_chart.js', 'images/alphabet.svg'], ['make_fox.js', 'images/fox.svg'], ['make_article.js', 'images/article-1-claude.svg']]) {
  const before = fs.readFileSync(file, 'utf8');
  execFileSync('node', [script], { stdio: 'ignore' });
  check(`${file} is what ${script} draws`, fs.readFileSync(file, 'utf8') === before);
}
console.log(fails ? `${fails} failed` : 'all passed');
process.exit(fails ? 1 : 0);

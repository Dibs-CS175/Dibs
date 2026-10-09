// Counts remaining `// STUB(<area>)` markers under lib/ and prints them per area.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const AREAS = [
  'users',
  'listings',
  'orders',
  'messages',
  'ratings',
  'reports',
  'pricing',
  'summerHold',
  'logistics',
  'goods',
  'impact',
];
const counts = Object.fromEntries(AREAS.map((a) => [a, 0]));
const where = Object.fromEntries(AREAS.map((a) => [a, []]));

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(name)) scan(p);
  }
}

function scan(file) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const m = line.match(/\/\/ STUB\(([A-Za-z]+)\)/);
    if (!m) return;
    const area = m[1];
    if (!(area in counts)) {
      counts[area] = 0;
      where[area] = [];
    }
    counts[area] += 1;
    where[area].push(`${relative(ROOT, file)}:${i + 1}`);
  });
}

walk(join(ROOT, 'lib'));

const verbose = process.argv.includes('--list');
let total = 0;
console.log('Remaining stubs by area\n');
for (const [area, n] of Object.entries(counts)) {
  total += n;
  console.log(`  ${area.padEnd(12)} ${String(n).padStart(3)}`);
  if (verbose) for (const w of where[area]) console.log(`      ${w}`);
}
console.log(`\n  ${'total'.padEnd(12)} ${String(total).padStart(3)}`);
if (!verbose) console.log('\nRun `npm run stubs -- --list` to see each stub location.');

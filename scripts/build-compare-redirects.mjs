#!/usr/bin/env node
// Writes the /compare/ 301s into vercel.json from src/data/compare-redirects.json.
// The programmatic /compare/<a>-vs-<b>/ pages were removed on Nov 21, 2026. Each
// old pair URL whose two brands have an editorial X-vs-Y article redirects to that
// article; everything else under /compare/ (other pairs, the hub, ?a= links) goes
// to the fallback. Run after adding an article to compare-redirects.json:
//
//   node scripts/build-compare-redirects.mjs          # rewrite vercel.json
//   node scripts/build-compare-redirects.mjs --check  # fail if vercel.json is stale
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { COMPARISONS, COMPARE_FALLBACK } from '../src/lib/db.mjs';

const VERCEL = join(import.meta.dirname, '..', 'vercel.json');
const MARK = '/compare/';
const isCompare = (r) => r.source === '/compare' || r.source.startsWith(MARK);

const specific = COMPARISONS.filter((c) => c.article)
  .sort((x, y) => (x.slug < y.slug ? -1 : x.slug > y.slug ? 1 : 0)) // byte order: same on every machine
  .flatMap((c) => [
    { source: c.oldUrl, destination: c.article, permanent: true },
    { source: c.oldUrl.slice(0, -1), destination: c.article, permanent: true },
  ]);
const generated = [
  ...specific,
  { source: '/compare', destination: COMPARE_FALLBACK, permanent: true },
  { source: '/compare/:path*', destination: COMPARE_FALLBACK, permanent: true },
];

const raw = readFileSync(VERCEL, 'utf8');
const config = JSON.parse(raw);
const kept = (config.redirects || []).filter((r) => !isCompare(r));
// Host canonicalisation stays first so it runs before anything else.
config.redirects = [kept[0], ...generated, ...kept.slice(1)].filter(Boolean);
const out = JSON.stringify(config, null, 2) + '\n';

if (process.argv.includes('--check')) {
  // Compare the rule sets, not the text, so formatting or ordering differences
  // between machines never fail a deploy.
  const key = (rs) => rs.map((r) => JSON.stringify(r)).sort().join('\n');
  const current = JSON.parse(raw).redirects || [];
  if (key(current) !== key(config.redirects)) {
    const have = new Set(current.map((r) => JSON.stringify(r)));
    const want = new Set(config.redirects.map((r) => JSON.stringify(r)));
    const missing = [...want].filter((r) => !have.has(r));
    const extra = [...have].filter((r) => !want.has(r));
    console.error(`vercel.json /compare/ redirects are stale (${missing.length} missing, ${extra.length} extra): run node scripts/build-compare-redirects.mjs`);
    for (const r of missing.slice(0, 5)) console.error(`  missing: ${r}`);
    for (const r of extra.slice(0, 5)) console.error(`  extra:   ${r}`);
    // On Vercel a stale file cannot be fixed by the deploy itself, so warn
    // instead of blocking it; locally and in the publish gates it fails.
    if (!process.env.VERCEL) process.exit(1);
  } else {
    console.log(`[compare-redirects] vercel.json up to date (${generated.length} rules).`);
  }
} else {
  writeFileSync(VERCEL, out);
  console.log(`[compare-redirects] Wrote ${generated.length} /compare/ rules to vercel.json (${specific.length / 2} pairs to articles).`);
}

#!/usr/bin/env node
// Per-search-engine traffic report from a Vercel Analytics snapshot.
//
//   node scripts/engine-report.mjs content/analytics/vercel/2026-11-22
//
// The folder holds two JSON files saved by the daily run straight from the
// Vercel MCP tool `aggregate_pageviews` (see .claude/skills/daily-publish/SKILL.md,
// step 0a): `daily.json` (by day + referrerHostname) and `pages.json`
// (by requestPath + referrerHostname). Either the raw tool result
// ({ result: { data: [...] } }) or a bare array of rows is accepted.
//
// Prints, for each engine: visitors per day (to spot a drop), the page types
// that earn its visits, and its top pages. The daily run uses this to decide
// how many of the day's slots go to each engine and which page types to write.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
if (!dir) {
  console.error('usage: node scripts/engine-report.mjs <snapshot-folder>');
  process.exit(1);
}

const load = (name) => {
  const f = join(dir, name);
  if (!existsSync(f)) return [];
  const j = JSON.parse(readFileSync(f, 'utf8'));
  return Array.isArray(j) ? j : j.result?.data ?? j.data ?? [];
};

// Bing powers DuckDuckGo, Yahoo, Ecosia and much of Startpage/Brave's tail,
// so those are reported on their own and together as "Bing family".
const ENGINE = {
  'google.com': 'Google',
  'search.google.com': 'Google',
  'com.google.android.googlequicksearchbox': 'Google',
  'bing.com': 'Bing',
  'duckduckgo.com': 'DuckDuckGo',
  'search.yahoo.com': 'Yahoo',
  'ecosia.org': 'Ecosia',
  'search.brave.com': 'Brave',
  'startpage.com': 'Startpage',
};
const BING_FAMILY = new Set(['Bing', 'DuckDuckGo', 'Yahoo', 'Ecosia']);

function pageType(path) {
  const p = path.replace(/\/$/, '');
  if (p === '' ) return 'homepage';
  if (p.startsWith('/compare/')) return 'compare pair';
  if (p.startsWith('/protein-powder/')) return 'label page';
  if (p.startsWith('/brands/')) return 'brand hub';
  if (p.startsWith('/glossary/')) return 'glossary';
  if (/^\/is-.*-good$/.test(p)) return '"is X good"';
  if (/-vs-/.test(p)) return 'editorial X vs Y';
  if (/(aldi|costco|walmart|target|sams-club|trader-joes|sprouts|cvs|walgreens|whole-foods|kirkland|amazon)/.test(p)) return 'store guide';
  if (/review$/.test(p)) return 'brand review';
  if (/^\/best-protein-powder-(for|without|with)-/.test(p)) return 'audience/diet guide';
  if (p.startsWith('/best-')) return 'type/flavour guide';
  return 'informational';
}

const pages = load('pages.json');
const daily = load('daily.json');
if (!pages.length && !daily.length) {
  console.error(`No data in ${dir} (expected pages.json and/or daily.json).`);
  process.exit(1);
}

const engines = {};
const get = (e) => (engines[e] ??= { visitors: 0, days: {}, types: {}, pages: [] });

for (const r of daily) {
  const e = ENGINE[r.referrerHostname];
  if (!e) continue;
  const d = (r.timestamp || '').slice(0, 10);
  get(e).days[d] = (get(e).days[d] || 0) + (r.visitors || 0);
}
for (const r of pages) {
  const e = ENGINE[r.referrerHostname];
  if (!e) continue;
  const x = get(e);
  const v = r.visitors || 0;
  x.visitors += v;
  const t = pageType(r.requestPath);
  x.types[t] = (x.types[t] || 0) + v;
  x.pages.push([v, r.requestPath]);
}

const order = Object.entries(engines).sort((a, b) => b[1].visitors - a[1].visitors);
const family = { visitors: 0, types: {} };
for (const [e, x] of order) {
  if (!BING_FAMILY.has(e)) continue;
  family.visitors += x.visitors;
  for (const [t, v] of Object.entries(x.types)) family.types[t] = (family.types[t] || 0) + v;
}

const fmtTypes = (types, total) =>
  Object.entries(types)
    .sort((a, b) => b[1] - a[1])
    .map(([t, v]) => `    ${String(v).padStart(4)}  ${t} (${total ? Math.round((100 * v) / total) : 0}%)`)
    .join('\n');

for (const [e, x] of order) {
  console.log(`\n== ${e}: ${x.visitors} visitors from search`);
  const days = Object.keys(x.days).sort();
  if (days.length) {
    console.log('  per day: ' + days.map((d) => `${d.slice(5)} ${x.days[d]}`).join(' | '));
    const vals = days.map((d) => x.days[d]);
    const half = Math.floor(vals.length / 2);
    const first = vals.slice(0, half).reduce((a, b) => a + b, 0) / Math.max(half, 1);
    const last2 = vals.slice(-2).reduce((a, b) => a + b, 0) / 2;
    if (first >= 4 && last2 < first * 0.4) {
      console.log(`  !! DROP: last two days average ${last2.toFixed(1)}/day vs ${first.toFixed(1)}/day earlier.`);
    }
  }
  console.log('  page types:');
  console.log(fmtTypes(x.types, x.visitors));
  console.log('  top pages:');
  x.pages.sort((a, b) => b[0] - a[0]).slice(0, 10).forEach(([v, p]) => console.log(`    ${String(v).padStart(4)}  ${p}`));
}

console.log(`\n== Bing family (Bing + DuckDuckGo + Yahoo + Ecosia): ${family.visitors} visitors`);
console.log(fmtTypes(family.types, family.visitors));

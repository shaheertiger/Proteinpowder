#!/usr/bin/env node
// Pull Bing Webmaster Tools data for the site and report what is working on Bing.
//
//   node scripts/bing-fetch.mjs            # fetch, save, report
//   node scripts/bing-fetch.mjs --report content/analytics/bing/2026-11-22   # report a saved snapshot
//
// Needs the Bing Webmaster API key in the `apikey` environment variable (set on the
// cloud environment; never commit it). Saves the raw API responses to
// content/analytics/bing/<today>/{queries,pages,traffic}.json so later runs can
// compare, then prints:
//   - clicks/impressions per day (to spot a drop or a rise)
//   - top queries and pages for the last 7 and 28 days
//   - page-one queries with impressions but no clicks (title/description fixes)
//   - queries with impressions and no page targeting them (new-article candidates)
//   - pages whose impressions are rising week over week (expand these)
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SITES = ['https://www.best-proteinpowder.com/', 'https://best-proteinpowder.com/'];
const API = 'https://ssl.bing.com/webmaster/api.svc/json';
const today = new Date().toISOString().slice(0, 10);

const args = process.argv.slice(2);
const reportDir = args.includes('--report') ? args[args.indexOf('--report') + 1] : null;

// Bing returns dates as "/Date(1700000000000-0800)/".
const toDate = (s) => {
  const m = /\/Date\((-?\d+)/.exec(s || '');
  return m ? new Date(Number(m[1])).toISOString().slice(0, 10) : null;
};

async function call(method, site, key) {
  const url = `${API}/${method}?siteUrl=${encodeURIComponent(site)}&apikey=${encodeURIComponent(key)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${res.status}: ${text.slice(0, 200)}`);
  const j = JSON.parse(text);
  return Array.isArray(j.d) ? j.d : [];
}

async function fetchAll() {
  const key = process.env.apikey || process.env.BING_API_KEY;
  if (!key) {
    console.error('No Bing key: set the `apikey` environment variable. Skipping Bing data.');
    process.exit(2);
  }
  let lastErr;
  for (const site of SITES) {
    try {
      const [queries, pages, traffic] = await Promise.all([
        call('GetQueryStats', site, key),
        call('GetPageStats', site, key),
        call('GetRankAndTrafficStats', site, key),
      ]);
      const dir = join('content/analytics/bing', today);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, 'queries.json'), JSON.stringify(queries, null, 1));
      writeFileSync(join(dir, 'pages.json'), JSON.stringify(pages, null, 1));
      writeFileSync(join(dir, 'traffic.json'), JSON.stringify(traffic, null, 1));
      console.log(`Saved Bing data for ${site} to ${dir} (${queries.length} query rows, ${pages.length} page rows, ${traffic.length} days).`);
      return dir;
    } catch (e) {
      lastErr = e;
    }
  }
  console.error(`Bing API failed for every site URL: ${lastErr?.message}`);
  process.exit(3);
}

function aggregate(rows, field, sinceDays) {
  const dates = rows.map((r) => toDate(r.Date)).filter(Boolean).sort();
  const end = dates.at(-1);
  if (!end) return new Map();
  const cutoff = new Date(Date.parse(end) - (sinceDays - 1) * 864e5).toISOString().slice(0, 10);
  const m = new Map();
  for (const r of rows) {
    const d = toDate(r.Date);
    if (!d || d < cutoff) continue;
    const k = r[field];
    const x = m.get(k) || { clicks: 0, impressions: 0, posSum: 0 };
    x.clicks += r.Clicks || 0;
    x.impressions += r.Impressions || 0;
    x.posSum += (r.AvgImpressionPosition || 0) * (r.Impressions || 0);
    m.set(k, x);
  }
  for (const x of m.values()) x.pos = x.impressions ? x.posSum / x.impressions : 0;
  return m;
}

function windowed(rows, field, from, to) {
  const m = new Map();
  for (const r of rows) {
    const d = toDate(r.Date);
    if (!d || d < from || d > to) continue;
    m.set(r[field], (m.get(r[field]) || 0) + (r.Impressions || 0));
  }
  return m;
}

const pageSlugs = existsSync('src/pages')
  ? readdirSync('src/pages').filter((f) => f.endsWith('.astro')).map((f) => f.replace('.astro', ''))
  : [];
const hasPage = (q) => {
  const words = q.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/)
    .filter((w) => w.length > 2 && !['protein', 'powder', 'review', 'reviews', 'best', 'the', 'and', 'for', 'good'].includes(w));
  if (!words.length) return true;
  return pageSlugs.some((s) => words.every((w) => s.includes(w)));
};

const row = (k, x) => `${String(x.clicks).padStart(4)} cl ${String(x.impressions).padStart(6)} imp  pos ${x.pos.toFixed(1).padStart(5)}  ${k}`;

function report(dir) {
  const read = (f) => (existsSync(join(dir, f)) ? JSON.parse(readFileSync(join(dir, f), 'utf8')) : []);
  const queries = read('queries.json');
  const pages = read('pages.json');
  const traffic = read('traffic.json');

  console.log(`\n== Bing Webmaster data (${dir})`);
  if (traffic.length) {
    const t = traffic.map((r) => [toDate(r.Date), r.Clicks || 0, r.Impressions || 0]).filter((r) => r[0]).sort();
    console.log('Last 14 days (clicks/impressions): ' + t.slice(-14).map(([d, c, i]) => `${d.slice(5)} ${c}/${i}`).join(' | '));
    const last7 = t.slice(-7).reduce((a, r) => a + r[2], 0);
    const prev7 = t.slice(-14, -7).reduce((a, r) => a + r[2], 0);
    console.log(`Impressions last 7 days ${last7} vs previous 7 ${prev7}${prev7 && last7 < prev7 * 0.5 ? '  !! DROP' : ''}`);
  }

  for (const [label, days] of [['7 days', 7], ['28 days', 28]]) {
    const q = [...aggregate(queries, 'Query', days)].sort((a, b) => b[1].clicks - a[1].clicks || b[1].impressions - a[1].impressions);
    const p = [...aggregate(pages, 'Query', days)].sort((a, b) => b[1].clicks - a[1].clicks || b[1].impressions - a[1].impressions);
    console.log(`\n-- Top queries, ${label}`);
    q.slice(0, 15).forEach(([k, x]) => console.log('  ' + row(k, x)));
    console.log(`\n-- Top pages, ${label}`);
    p.slice(0, 15).forEach(([k, x]) => console.log('  ' + row(k.replace(/^https?:\/\/[^/]+/, ''), x)));
  }

  const q28 = [...aggregate(queries, 'Query', 28)];
  console.log('\n-- Page one, impressions, no clicks (rewrite title/description to answer the query)');
  q28.filter(([, x]) => x.clicks === 0 && x.impressions >= 10 && x.pos <= 10)
    .sort((a, b) => b[1].impressions - a[1].impressions).slice(0, 10)
    .forEach(([k, x]) => console.log('  ' + row(k, x)));

  console.log('\n-- Queries with impressions and no page that targets them (new-article candidates)');
  q28.filter(([k, x]) => x.impressions >= 5 && !hasPage(k))
    .sort((a, b) => b[1].impressions - a[1].impressions).slice(0, 15)
    .forEach(([k, x]) => console.log('  ' + row(k, x)));

  const dates = pages.map((r) => toDate(r.Date)).filter(Boolean).sort();
  if (dates.length) {
    const end = dates.at(-1);
    const d = (n) => new Date(Date.parse(end) - n * 864e5).toISOString().slice(0, 10);
    const cur = windowed(pages, 'Query', d(6), end);
    const prev = windowed(pages, 'Query', d(13), d(7));
    console.log('\n-- Rising pages (impressions this week vs last; expand these and link new pages from them)');
    [...cur].map(([k, v]) => [k, v, prev.get(k) || 0]).filter(([, v, p]) => v >= 10 && v >= p * 1.5)
      .sort((a, b) => b[1] - b[2] - (a[1] - a[2])).slice(0, 10)
      .forEach(([k, v, p]) => console.log(`  ${String(p).padStart(5)} -> ${String(v).padStart(5)}  ${k.replace(/^https?:\/\/[^/]+/, '')}`));
  }
}

const dir = reportDir || (await fetchAll());
report(dir);

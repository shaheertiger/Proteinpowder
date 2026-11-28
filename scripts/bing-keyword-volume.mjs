#!/usr/bin/env node
// Bing search demand for candidate keywords, from the Bing Webmaster keyword research API.
//
//   node scripts/bing-keyword-volume.mjs "heated blanket" "best heated blanket" ...
//
// Prints Bing impressions over the last 4 weeks for each query (US, en-US). Use it before
// writing a guide: a topic with no Bing data, or far below the site's working pages
// (on thehonestreviewers.com "best solar power bank" ~270 earns ~900 visitors a month),
// will likely get no traffic here. Ported from thehonestreviewers.com on 2026-11-28.
// Reads the key from BING_WEBMASTER_API_KEY or `apikey`; never print or commit it.
const KEY = (process.env.BING_WEBMASTER_API_KEY || process.env.apikey || '').trim();
if (!KEY) {
  console.log('[bing-kw] No Bing key found (BING_WEBMASTER_API_KEY or apikey).');
  process.exit(2);
}
const queries = process.argv.slice(2);
if (!queries.length) {
  console.log('Usage: node scripts/bing-keyword-volume.mjs "<query>" ["<query>" ...]');
  process.exit(1);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (const q of queries) {
  const url = `https://ssl.bing.com/webmaster/api.svc/json/GetKeywordStats?q=${encodeURIComponent(q)}&country=us&language=en-US&apikey=${encodeURIComponent(KEY)}`;
  let line = '';
  for (let t = 0; t < 3 && !line; t++) {
    try {
      const res = await fetch(url);
      if (!res.ok) { await sleep(1000 * (t + 1)); continue; }
      const rows = JSON.parse(await res.text()).d || [];
      const last4 = rows.slice(-4).reduce((sum, r) => sum + (r.Impressions || 0), 0);
      line = `${String(last4).padStart(7)}  ${q}${rows.length ? '' : '  (no Bing data)'}`;
    } catch {
      await sleep(1000 * (t + 1));
    }
  }
  console.log(line || `      ?  ${q}  (API error)`);
  await sleep(300);
}

#!/usr/bin/env node
// Builds src/data/asin-quarantine.json from the verification report.
//
//   node scripts/build-asin-quarantine.mjs
//
// Quarantining is deliberately not deletion. The ASIN stays in product-asins.json
// so it can be reviewed and corrected later; amazonLink() simply declines to use
// it and falls through to a tagged Amazon search for the product name, which is
// a valid Associate link that credits the same tag.
//
// A product is quarantined when the ASIN no longer resolves (the product is gone)
// or when the real Amazon title shares too little vocabulary with our product name
// to believe it is the same item. KEEP holds the ones a human confirmed are fine
// despite a low score, usually because the brand trades under another name.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const report = JSON.parse(readFileSync(join(root, 'scripts', 'affiliate-verify-report.json'), 'utf8'));
const THRESHOLD = 0.5;

// Low-scoring but verified correct: the seller trades under a different name, or
// the title is terse. Checked by hand against the product page.
const KEEP = new Set([
  'radius-360-hand-sander',      // Full Circle manufactures the Radius 360
  'ge-thqlsurge',                // "General Electric" vs "GE", exact model THQLSURGE
  'compare-n-save-concentrate',  // same brand, same herbicide
  'govee-water-leak-sensor',     // GoveeLife is Govee's sub-brand
  'yes4all-adjustable-dumbbells',
  'rubber-horse-stall-mats',     // 4x6, 3/4in spec matches
  'penofin-blue-label',          // Blue Label is Penofin's hardwood formula
  'messmers-uv-plus',
  'ecoflow-delta-pro-solar',
  'rust-oleum-triple-thick',     // Varathane is a Rust-Oleum brand
  'gutter-brush-basic',
  'levoit-core-300s',
]);

const quarantine = {};
for (const r of report) {
  if (KEEP.has(r.id)) continue;
  if (r.status === 'unresolved') {
    quarantine[r.id] = { asin: r.asin, reason: 'dead', note: 'ASIN no longer resolves on Amazon', file: r.file };
  } else if (r.status === 'resolved' && r.score < THRESHOLD) {
    quarantine[r.id] = {
      asin: r.asin,
      reason: 'mismatch',
      note: `Resolves to "${String(r.amazonTitle).slice(0, 110)}"`,
      score: Number(r.score.toFixed(2)),
      file: r.file,
    };
  }
}

writeFileSync(join(root, 'src', 'data', 'asin-quarantine.json'), JSON.stringify(quarantine, null, 2) + '\n');
const dead = Object.values(quarantine).filter((q) => q.reason === 'dead').length;
const mismatch = Object.values(quarantine).filter((q) => q.reason === 'mismatch').length;
console.log(`Quarantined ${Object.keys(quarantine).length} ASINs (${dead} dead, ${mismatch} mismatched).`);
console.log(`Kept ${KEEP.size} low-scoring matches verified correct by hand.`);
console.log(`These now render a tagged Amazon search instead of a /dp/ link.`);

#!/usr/bin/env node
// Merges label-research batches (JSON arrays in the shape documented in
// scripts/db/SCHEMA.md) into src/data/db/products.json, adding the fields the
// site needs that research does not supply: aliases (the ids the hand-written
// roundups use for the same product), search demand, holds and registry checks.
//
//   node scripts/db/import-research.mjs path/to/batch-*.json
//
// Re-running replaces rows by slug and keeps rows that are not in the batches.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(import.meta.dirname, '..', '..', 'src', 'data', 'db', 'products.json');

// Roundup product ids that are the same product as a database row.
const ALIASES = {
  'optimum-nutrition-gold-standard-whey': ['optimum-nutrition-gold-standard-100-whey'],
  'optimum-nutrition-gold-standard-casein': ['optimum-nutrition-gold-standard-100-casein'],
  'dymatize-iso100': ['dymatize-iso100-hydrolyzed', 'wpi-dymatize-iso100'],
  'isopure-zero-carb': ['wpi-isopure-zero-carb', 'isopure-zero-carb-unflavored'],
  'transparent-labs-grass-fed-whey-isolate': ['transparent-labs-grass-fed-whey-protein-isolate', 'wpi-transparent-labs-grass-fed-isolate'],
  'ghost-whey': ['ghost-whey-protein'],
  'naked-whey': ['naked-nutrition-naked-whey'],
  'naked-casein': ['naked-nutrition-naked-casein'],
  'naked-pea': ['naked-nutrition-naked-pea', 'plant-naked-pea'],
  'naked-egg': ['naked-nutrition-naked-egg'],
  'jocko-molk-protein': ['jocko-molk-protein-powder'],
  'levels-grass-fed-whey': ['levels-grass-fed-whey-protein', 'levels-grass-fed-whey-protein-5lb'],
  'ascent-native-fuel-whey': ['ascent-whey-protein'],
  'equip-prime-protein': ['equip-foods-prime-protein', 'equip-foods-prime-protein-unflavored', 'equip-foods-prime-protein-chocolate'],
  'momentous-essential-grass-fed-whey': ['momentous-essential-grass-fed-whey-protein', 'momentous-whey-protein-isolate'],
  'thorne-whey-protein-isolate': ['wpi-thorne-whey-isolate'],
  'klean-athlete-klean-isolate': ['wpi-klean-isolate'],
  'now-sports-whey-isolate': ['now-sports-whey-protein-isolate', 'wpi-now-sports-whey-isolate'],
  'now-sports-pea-protein': ['plant-now-sports-pea-protein'],
  'now-sports-soy-isolate': ['now-sports-soy-protein-isolate'],
  'premier-protein-powder': ['premier-protein-100-whey-chocolate-milkshake', 'premier-protein-100-whey-cafe-latte'],
  'bsn-syntha-6': ['bsn-syntha-6-protein-powder'],
  'pure-protein-whey': ['pure-protein-100-whey'],
  'nutricost-whey-concentrate': ['nutricost-whey-protein-concentrate'],
  'myprotein-impact-whey': ['myprotein-impact-whey-protein'],
  'raw-nutrition-cbum-itholate': ['raw-nutrition-cbum-itholate-protein'],
  'quest-protein-powder': ['quest-protein-powder-chocolate-milkshake', 'quest-protein-powder-vanilla-milkshake', 'quest-protein-powder-salted-caramel', 'quest-protein-powder-peanut-butter'],
  'bloom-whey-protein-isolate': ['bloom-whey-isolate-protein'],
  'devotion-nutrition-protein': ['devotion-angel-food-cake-protein', 'devotion-brownie-batter-protein', 'devotion-buttery-blend-protein', 'devotion-wild-blueberry-protein'],
  'just-ingredients-protein-powder': ['just-ingredients-protein-powder-vanilla', 'just-ingredients-protein-powder-chocolate', 'just-ingredients-protein-powder-strawberry-cream'],
  'clean-simple-eats-whey-protein': ['clean-simple-eats-whey-protein-powder'],
  'puori-pw1-whey': ['puori-pw1-whey-protein', 'puori-pw1-unflavored', 'puori-pw1-dark-chocolate'],
  'ritual-essential-protein-18': ['ritual-essential-protein-daily-shake-chocolate'],
  'unjury-unflavored-protein': ['unjury-unflavored-high-whey-protein'],
  'orgain-organic-plant-protein': ['orgain-organic-protein-plant-based', 'plant-orgain-organic-protein'],
  'truvani-plant-protein': ['truvani-organic-plant-based-protein', 'truvani-organic-plant-based-protein-chocolate'],
  'vega-sport-premium-protein': ['plant-vega-sport-premium'],
  'vega-protein-and-greens': ['vega-protein-supergreens'],
  'garden-of-life-sport-plant-protein': ['garden-of-life-sport-organic-plant-protein', 'garden-of-life-sport-organic-plant-based-protein', 'plant-garden-of-life-sport'],
  'owyn-plant-protein-powder': ['owyn-pro-elite-protein-powder'],
  'kachava-superfood-shake': ['kachava-chocolate', 'kachava-vanilla', 'kachava-strawberry'],
  'anthonys-pea-protein': ['anthonys-premium-pea-protein'],
  'manitoba-harvest-hemp-pro-70': ['manitoba-harvest-hemp-yeah-max-protein'],
  'ballerina-farm-protein-powder': ['ballerina-farm-farmer-protein-vanilla-bean', 'ballerina-farm-farmer-protein-creamy-chocolate', 'ballerina-farm-farmer-protein-maple-cinnamon'],
  'happy-viking-superfood-protein': ['happy-viking-plant-protein-triple-chocolate', 'happy-viking-plant-protein-vanilla-bean'],
  'seeq-clear-whey-isolate': ['seeq-clear-whey-protein-isolate'],
  'oath-protein-powder': ['oath-clear-whey-isolate'],
  'prodough-protein-powder': ['prodough-whey-protein-isolate'],
};

// Semrush US monthly volume for the product or brand name (SEO blueprint, Nov 2026).
// Comparison pages are indexed only when both products clear 1,000.
const DEMAND = {
  'premier-protein-powder': 60500,
  'orgain-organic-plant-protein': 40500,
  'clean-simple-eats-whey-protein': 40500,
  'isopure-zero-carb': 33100,
  'isopure-low-carb': 12100,
  'isopure-infusions': 9900,
  'truvani-plant-protein': 27100,
  'ghost-whey': 22200,
  'just-ingredients-protein-powder': 22200,
  'optimum-nutrition-gold-standard-whey': 18100,
  'vega-sport-premium-protein': 18100,
  'flavcity-protein-smoothie': 18100,
  'musclepharm-combat-protein': 18100,
  'naked-whey': 14800,
  'ryse-loaded-protein': 14800,
  'ascent-native-fuel-whey': 12100,
  'body-fortress-super-advanced-whey': 12100,
  'levels-grass-fed-whey': 12100,
  'dymatize-iso100': 9900,
  'ballerina-farm-protein-powder': 9900,
  'equip-prime-protein': 9900,
  'jocko-molk-protein': 9900,
  'legion-whey-plus': 9900,
};

// Rows held out of the index until a person checks the label in hand.
const HOLD = {
  'legion-whey-plus': "Brand page shows two different labels (22 g/100 kcal panel vs 20 g/90 kcal copy); confirm the current formula.",
  'gnc-amp-wheybolic': 'Label read from search snippets only; protein inferred from the product name. Confirm the panel.',
  'myprotein-impact-whey': 'Brand page contradicts itself (19 g vs 22 g protein); no servings per container recorded.',
};

// Certifications we found on the certifier's own registry for this product.
const REGISTRY_CHECKED = {
  'thorne-whey-protein-isolate': ['NSF Certified for Sport'],
  'klean-athlete-klean-isolate': ['NSF Certified for Sport'],
  'vital-proteins-collagen-peptides': ['NSF Certified for Sport'],
  'muscle-milk-genuine-protein-powder': ['NSF Certified for Sport'],
  'vega-sport-premium-protein': ['NSF Certified for Sport'],
  'garden-of-life-sport-plant-protein': ['NSF Certified for Sport'],
};

// Display names: research rows sometimes carry a descriptor or a rename note in
// the name; keep the name short and move the note to `formerly`.
const NAMES = {
  'naked-pea': ['Naked Pea'],
  'naked-casein': ['Naked Casein'],
  'naked-whey': ['Naked Whey'],
  'naked-egg': ['Naked Egg'],
  'vital-proteins-collagen-peptides': ['Collagen Peptides'],
  'unjury-unflavored-protein': ['Unflavored Protein'],
  'now-sports-egg-white-protein': ['Egg White Protein'],
  'legion-whey-plus': ['Whey+'],
  'isopure-zero-carb': ['Zero Carb'],
  'isopure-low-carb': ['Low Carb'],
  'ascent-native-fuel-whey': ['100% Whey Protein'],
  'ancient-nutrition-bone-broth-protein': ['Bone Broth Protein'],
  'premier-protein-powder': ['100% Whey Protein Powder'],
  'momentous-essential-grass-fed-whey': ['Whey Protein Isolate', 'Essential Grass-Fed Whey'],
  'jay-robb-egg-white-protein': ['Egg White Protein'],
  'seeq-clear-whey-isolate': ['Clear Protein'],
  'equip-prime-protein': ['Prime Protein'],
  'vega-sport-premium-protein': ['Performance Protein + Recovery', 'Vega Sport Premium Protein'],
  'raw-nutrition-cbum-itholate': ['BUM Itholate Protein', 'CBUM Itholate Protein'],
  'vega-protein-and-greens': ['Protein + Supergreens', 'Vega Protein & Greens'],
  'orgain-organic-plant-protein': ['Organic Plant Based Protein Powder'],
  'happy-viking-superfood-protein': ['High Protein Meal'],
  'puori-pw1-whey': ['PW1 Grass-Fed Whey Protein'],
  'quest-protein-powder': ['Protein Powder'],
};

// Corrections to research rows, decided by the editor.
const FIX = {
  // Whey (type unstated) with collagen, colostrum and hemp; whey is the main protein.
  'ballerina-farm-protein-powder': { proteinType: 'whey-blend' },
};

const files = process.argv.slice(2);
if (!files.length) {
  console.error('usage: node scripts/db/import-research.mjs batch-1.json [batch-2.json …]');
  process.exit(1);
}

const existing = (() => {
  try {
    return JSON.parse(readFileSync(OUT, 'utf8')).filter((r) => !r.slug.startsWith('seed-'));
  } catch {
    return [];
  }
})();
const bySlug = new Map(existing.map((r) => [r.slug, r]));

let n = 0;
for (const file of files) {
  for (const raw of JSON.parse(readFileSync(file, 'utf8'))) {
    const row = { ...raw, ...(FIX[raw.slug] || {}) };
    if (NAMES[row.slug]) {
      row.researchName = raw.name;
      row.name = NAMES[row.slug][0];
      if (NAMES[row.slug][1]) row.formerly = NAMES[row.slug][1];
    }
    row.aliases = ALIASES[row.slug] || [];
    row.demand = DEMAND[row.slug] || 0;
    row.hold = HOLD[row.slug] || null;
    row.certVerified = REGISTRY_CHECKED[row.slug] || [];
    row.labelChecked = row.labelChecked || row.price?.checked || '2026-11-01';
    if (row.price && !(row.price.usd > 0 && row.price.servings > 0)) {
      // A price with no servings count cannot give a cost per gram; keep the
      // observation in notes and leave cost unscored.
      row.notes = [row.notes, `Price seen without a servings count: ${JSON.stringify(row.price)}`].filter(Boolean).join(' ');
      row.price = null;
    }
    delete row.discontinued;
    bySlug.set(row.slug, row);
    n++;
  }
}

const rows = [...bySlug.values()].sort((a, b) => a.slug.localeCompare(b.slug));
writeFileSync(OUT, JSON.stringify(rows, null, 2) + '\n');
console.log(`Imported ${n} rows; products.json now has ${rows.length}.`);

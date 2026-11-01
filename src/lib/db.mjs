// The label database: every generated page (product pages, brand hubs, the
// all-powders hub, comparisons) is a view of the rows in src/data/db/*.json.
//
// Plain JS (with JSDoc) rather than TypeScript so the Node build scripts —
// validate-internal-links.js and astro.config.mjs's sitemap filter — can import
// the same route list the pages are generated from.
//
// The Label Score formula lives here and nowhere else. /methodology/ prints the
// same constants, so the page and the numbers cannot drift apart.
import RAW_PRODUCTS from '../data/db/products.json' with { type: 'json' };
import RAW_GLOSSARY from '../data/db/glossary.json' with { type: 'json' };
import BRAND_META from '../data/db/brands.json' with { type: 'json' };

// ---------------------------------------------------------------------------
// Taxonomy
// ---------------------------------------------------------------------------

/** Protein types, with the family used for comparisons and the hub that ranks them. */
export const TYPES = {
  'whey-concentrate': { name: 'Whey concentrate', family: 'whey', amino: 10, hub: '/best-whey-protein-powder/' },
  'whey-blend': { name: 'Whey blend', family: 'whey', amino: 10, hub: '/best-whey-protein-powder/' },
  'whey-isolate': { name: 'Whey isolate', family: 'whey', amino: 10, hub: '/best-whey-protein-isolate/' },
  'whey-hydrolysate': { name: 'Whey hydrolysate', family: 'whey', amino: 10, hub: '/best-whey-protein-isolate/' },
  'milk-blend': { name: 'Milk protein blend', family: 'whey', amino: 10, hub: '/best-whey-protein-powder/' },
  casein: { name: 'Casein', family: 'casein', amino: 10, hub: '/best-casein-protein-powder/' },
  'egg-white': { name: 'Egg white', family: 'animal', amino: 10, hub: '/best-egg-white-protein-powder/' },
  beef: { name: 'Beef protein isolate', family: 'animal', amino: 5, hub: '/best-beef-protein-powder/' },
  'bone-broth': { name: 'Bone broth protein', family: 'animal', amino: 2, hub: '/best-bone-broth-protein-powder/' },
  collagen: { name: 'Collagen peptides', family: 'animal', amino: 0, hub: '/best-collagen-protein-powder/' },
  soy: { name: 'Soy isolate', family: 'plant', amino: 10, hub: '/best-soy-protein-powder/' },
  'plant-blend': { name: 'Plant blend', family: 'plant', amino: 8, hub: '/best-plant-based-protein-powder/' },
  pea: { name: 'Pea protein', family: 'plant', amino: 7, hub: '/best-pea-protein-powder/' },
  rice: { name: 'Brown rice protein', family: 'plant', amino: 5, hub: '/best-plant-based-protein-powder/' },
  hemp: { name: 'Hemp protein', family: 'plant', amino: 5, hub: '/best-hemp-protein-powder/' },
};

const DAIRY_FREE_TYPES = new Set(['egg-white', 'beef', 'bone-broth', 'collagen', 'soy', 'plant-blend', 'pea', 'rice', 'hemp']);
const PLANT_TYPES = new Set(['soy', 'plant-blend', 'pea', 'rice', 'hemp']);

export const ARTIFICIAL_SWEETENERS = ['sucralose', 'acesulfame potassium', 'aspartame', 'saccharin', 'neotame', 'advantame'];

/** Certifications that test finished product for banned substances or contaminants. */
export const CERT_TIERS = {
  'Informed Choice': 10,
  'Informed Sport': 10,
  'NSF Certified for Sport': 10,
  BSCG: 10,
  'NSF Contents Certified': 6,
  'Clean Label Project': 6,
  'Labdoor tested': 6,
};

/** Registry where a reader can check a certification for themselves. */
export const CERT_REGISTRY = {
  'Informed Choice': 'https://choice.wetestyoutrust.com/',
  'Informed Sport': 'https://sport.wetestyoutrust.com/',
  'NSF Certified for Sport': 'https://www.nsfsport.com/certified-products/',
  'NSF Contents Certified': 'https://info.nsf.org/Certified/Dietary/',
  BSCG: 'https://www.bscg.org/certified-drug-free/',
  'Clean Label Project': 'https://cleanlabelproject.org/',
  'USDA Organic': 'https://organic.ams.usda.gov/integrity/',
  'Non-GMO Project': 'https://www.nongmoproject.org/find-non-gmo/',
};

/**
 * Diet and attribute filters. Each has a test against a product row and, where
 * one exists, the hand-written best-of that ranks it.
 */
export const DIETS = [
  { slug: 'vegan', name: 'Vegan', hub: '/best-plant-based-protein-powder/', test: (p) => PLANT_TYPES.has(p.proteinType) || has(p.claims, 'vegan') },
  { slug: 'dairy-free', name: 'Dairy-free', hub: '/best-lactose-free-protein-powder/', test: (p) => DAIRY_FREE_TYPES.has(p.proteinType) && !has(p.allergens, 'milk') },
  { slug: 'low-carb', name: 'Low carb (≤3 g)', hub: '/best-low-carb-protein-powder/', test: (p) => p.carbsG != null && p.carbsG <= 3 },
  { slug: 'low-sugar', name: 'Sugar ≤1 g', hub: null, test: (p) => p.sugarG != null && p.sugarG <= 1 },
  { slug: 'no-artificial-sweeteners', name: 'No artificial sweeteners', hub: '/best-clean-protein-powder/', test: (p) => Array.isArray(p.sweeteners) && !p.sweeteners.some(isArtificial) },
  { slug: 'unflavored', name: 'Unflavored', hub: '/best-unflavored-protein-powder/', test: (p) => /unflavou?red|natural/i.test(p.labelFlavor || '') && (p.sweeteners || []).length === 0 },
  { slug: 'organic', name: 'USDA Organic', hub: '/best-organic-protein-powder/', test: (p) => has(p.certifications, 'USDA Organic') },
  { slug: 'certified', name: 'Third-party certified', hub: null, test: (p) => certPoints(p) === 10 },
];

/** Goals a row can qualify for, from its numbers alone. */
export const GOALS = [
  {
    slug: 'weight-loss',
    name: 'weight loss',
    hub: '/best-protein-powder-for-weight-loss/',
    test: (p) => p.calories != null && p.calories <= 140 && p.proteinG >= 20 && (p.sugarG ?? 99) <= 3,
    why: (p) => `${p.proteinG} g of protein for ${p.calories} calories and ${fmt(p.sugarG)} g of sugar is a lean ratio, so a scoop adds protein without adding much else.`,
    whyNot: (p) => `At ${p.calories} calories and ${fmt(p.sugarG)} g of sugar per serving for ${p.proteinG} g of protein, it is not one of the leaner options; for weight loss you want roughly 20 g+ of protein in 140 calories or fewer.`,
  },
  {
    slug: 'muscle-gain',
    name: 'muscle gain',
    hub: '/best-protein-powder-for-muscle-gain/',
    test: (p) => p.proteinG >= 24 && TYPES[p.proteinType]?.amino >= 8,
    why: (p) => `${p.proteinG} g of a ${TYPES[p.proteinType].name.toLowerCase()} protein per serving clears the 20–40 g per-meal dose research links to maximal muscle protein synthesis.`,
    whyNot: (p) =>
      TYPES[p.proteinType]?.amino < 8
        ? `${TYPES[p.proteinType].name} has an incomplete or low-leucine amino acid profile, so gram for gram it does less for muscle building than whey, casein, egg or soy.`
        : `${p.proteinG} g per serving is on the low side; you would need more than one scoop to reach the 25–40 g dose most lifters aim for.`,
  },
  {
    slug: 'meal-replacement',
    name: 'meal replacement',
    hub: null,
    test: (p) => p.calories != null && p.calories >= 200 && (p.fiberG ?? 0) >= 3,
    why: (p) => `With ${p.calories} calories and ${fmt(p.fiberG)} g of fiber per serving it carries enough energy and bulk to stand in for a light meal.`,
    whyNot: (p) => `At ${p.calories} calories it is a protein supplement, not a meal; add a carbohydrate and fat source (fruit, oats, nut butter) if you use it to replace a meal.`,
  },
];

// ---------------------------------------------------------------------------
// Label Score — the published formula
// ---------------------------------------------------------------------------

export const SCORE = {
  density: { max: 40, floor: 0.5, ceiling: 0.9, label: 'Protein density' },
  cost: { max: 25, best: 0.75, worst: 3.0, label: 'Cost per 25 g protein' },
  clean: { max: 15, label: 'Sugar and additives' },
  cert: { max: 10, label: 'Third-party certification' },
  amino: { max: 10, label: 'Amino acid completeness' },
};

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const round1 = (x) => Math.round(x * 10) / 10;

function certPoints(p) {
  return Math.max(0, ...(p.certifications || []).map((c) => CERT_TIERS[c] || 0));
}

function cleanPoints(p) {
  const s = p.sugarG;
  const sugar = s == null ? 4 : s <= 1 ? 8 : s <= 3 ? 5 : s <= 6 ? 2 : 0;
  const artificial = (p.sweeteners || []).filter(isArtificial).length;
  const flagged = (p.flaggedAdditives || []).length;
  const additives = Math.max(0, 7 - 2 * artificial - flagged);
  return { points: sugar + additives, sugar, additives, artificial, flagged };
}

/**
 * Returns the five components and the total. When no price has been checked the
 * cost component is left out and the other four are scaled up to 100, and the
 * score is marked provisional.
 */
export function labelScore(p) {
  const density = round1(clamp01((p.proteinPct - SCORE.density.floor) / (SCORE.density.ceiling - SCORE.density.floor)) * SCORE.density.max);
  const cost = p.costPer25 == null ? null : round1(clamp01((SCORE.cost.worst - p.costPer25) / (SCORE.cost.worst - SCORE.cost.best)) * SCORE.cost.max);
  const clean = cleanPoints(p);
  const cert = certPoints(p);
  const amino = TYPES[p.proteinType]?.amino ?? 0;
  const parts = [
    { key: 'density', label: SCORE.density.label, points: density, max: SCORE.density.max },
    { key: 'cost', label: SCORE.cost.label, points: cost, max: SCORE.cost.max },
    { key: 'clean', label: SCORE.clean.label, points: clean.points, max: SCORE.clean.max },
    { key: 'cert', label: SCORE.cert.label, points: cert, max: SCORE.cert.max },
    { key: 'amino', label: SCORE.amino.label, points: amino, max: SCORE.amino.max },
  ];
  const scored = parts.filter((x) => x.points != null);
  const got = scored.reduce((a, x) => a + x.points, 0);
  const possible = scored.reduce((a, x) => a + x.max, 0);
  return { total: Math.round((got / possible) * 100), parts, provisional: cost == null };
}

// ---------------------------------------------------------------------------
// Rows
// ---------------------------------------------------------------------------

export function slugify(s) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function has(list, value) {
  return Array.isArray(list) && list.some((x) => String(x).toLowerCase() === value.toLowerCase());
}

export function isArtificial(sweetener) {
  const s = String(sweetener).toLowerCase();
  return ARTIFICIAL_SWEETENERS.some((a) => s.includes(a)) || /\bace-?k\b/.test(s);
}

export function fmt(n, digits = 1) {
  if (n == null) return '–';
  return Number.isInteger(n) ? String(n) : n.toFixed(digits).replace(/\.0$/, '');
}

export function money(n) {
  return n == null ? '–' : `$${n.toFixed(2)}`;
}

// A panel may omit sugar, fat or fiber (collagen and bone broth panels often do);
// those show as "not printed". Protein, serving and calories are the minimum.
const REQUIRED = ['proteinG', 'servingSizeG', 'calories'];

function enrich(raw) {
  const p = { ...raw };
  p.brandSlug = slugify(p.brand);
  p.fullName = p.name.toLowerCase().startsWith(p.brand.toLowerCase()) ? p.name : `${p.brand} ${p.name}`;
  p.url = `/protein-powder/${p.slug}/`;
  p.proteinPct = p.proteinG && p.servingSizeG ? p.proteinG / p.servingSizeG : 0;
  p.per100 = (v) => (v == null || !p.servingSizeG ? null : round1((v / p.servingSizeG) * 100));
  const price = p.price;
  p.costPerServing = price?.usd && price?.servings ? price.usd / price.servings : null;
  p.costPer25 = p.costPerServing && p.proteinG ? (p.costPerServing / p.proteinG) * 25 : null;
  p.labelComplete = REQUIRED.every((k) => p[k] != null) && !!p.ingredients && !p.hold;
  p.type = TYPES[p.proteinType];
  p.family = p.type?.family ?? 'other';
  p.diets = DIETS.filter((d) => d.test(p)).map((d) => d.slug);
  p.goals = GOALS.filter((g) => g.test(p)).map((g) => g.slug);
  p.artificial = (p.sweeteners || []).filter(isArtificial);
  p.score = labelScore(p);
  return p;
}

/** Every product with enough data to render, best Label Score first. */
export const PRODUCTS = RAW_PRODUCTS.filter((p) => !p.discontinued && !p.unidentified && p.proteinG && p.servingSizeG && TYPES[p.proteinType])
  .map(enrich)
  .sort((a, b) => b.score.total - a.score.total || a.fullName.localeCompare(b.fullName));

PRODUCTS.forEach((p, i) => (p.rank = i + 1));

export const PRODUCT_BY_SLUG = new Map(PRODUCTS.map((p) => [p.slug, p]));

/** Roundup product ids (the PRODUCTS arrays in the hand-written guides) → database row. */
export const PRODUCT_BY_ALIAS = new Map(PRODUCTS.flatMap((p) => [p.slug, ...(p.aliases || [])].map((a) => [a, p])));

export function median(values) {
  const v = values.filter((x) => x != null).sort((a, b) => a - b);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}

export const MEDIANS = {
  proteinPct: median(PRODUCTS.map((p) => p.proteinPct)),
  costPer25: median(PRODUCTS.map((p) => p.costPer25)),
  proteinG: median(PRODUCTS.map((p) => p.proteinG)),
  calories: median(PRODUCTS.map((p) => p.calories)),
};

/** One-line verdict, generated from where the row sits against the database. */
export function verdict(p) {
  const density = p.proteinPct >= MEDIANS.proteinPct ? 'above-median protein density' : 'below-median protein density';
  let price = 'no price checked yet';
  if (p.costPer25 != null && MEDIANS.costPer25 != null) {
    price = p.costPer25 <= MEDIANS.costPer25 * 0.85 ? 'budget price' : p.costPer25 >= MEDIANS.costPer25 * 1.2 ? 'premium price' : 'mid-price';
  }
  const cert = certPoints(p) === 10 ? 'sport-certified' : null;
  return [density, price, cert].filter(Boolean).join(', ');
}

// ---------------------------------------------------------------------------
// Brands
// ---------------------------------------------------------------------------

export const BRANDS = [...new Set(PRODUCTS.map((p) => p.brandSlug))]
  .map((slug) => {
    const products = PRODUCTS.filter((p) => p.brandSlug === slug);
    const meta = BRAND_META[slug] || {};
    return {
      slug,
      name: products[0].brand,
      url: `/brands/${slug}/`,
      products,
      review: meta.review || null,
      website: meta.website || null,
      about: meta.about || null,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

export const BRAND_BY_SLUG = new Map(BRANDS.map((b) => [b.slug, b]));

// ---------------------------------------------------------------------------
// Comparisons
// ---------------------------------------------------------------------------

/**
 * Every pair in the same protein family. A pair is indexable only when both
 * products have real search demand (the `demand` field, Semrush US monthly
 * volume for the product or brand name); the rest render for readers who reach
 * them from the compare blocks but stay out of the index and the sitemap.
 */
export const COMPARISONS = (() => {
  const out = [];
  for (let i = 0; i < PRODUCTS.length; i++) {
    for (let j = i + 1; j < PRODUCTS.length; j++) {
      const a = PRODUCTS[i];
      const b = PRODUCTS[j];
      if (a.family !== b.family || a.brandSlug === b.brandSlug) continue;
      // Alphabetical slug order so there is exactly one URL per pair.
      const [x, y] = [a, b].sort((m, n) => m.slug.localeCompare(n.slug));
      out.push({
        slug: `${x.slug}-vs-${y.slug}`,
        url: `/compare/${x.slug}-vs-${y.slug}/`,
        a: x,
        b: y,
        indexable: (x.demand || 0) >= 1000 && (y.demand || 0) >= 1000 && x.labelComplete && y.labelComplete,
      });
    }
  }
  return out;
})();

export const COMPARISON_BY_SLUG = new Map(COMPARISONS.map((c) => [c.slug, c]));

export function comparisonFor(a, b) {
  const [x, y] = [a, b].sort((m, n) => m.slug.localeCompare(n.slug));
  return COMPARISON_BY_SLUG.get(`${x.slug}-vs-${y.slug}`) || null;
}

/** The four compare blocks on a product page: five rows each, computed from the database. */
export function compareBlocks(p) {
  const others = PRODUCTS.filter((o) => o.slug !== p.slug);
  const byScore = (a, b) => b.score.total - a.score.total;
  const cheaper = p.costPer25 == null ? [] : others.filter((o) => o.costPer25 != null && o.costPer25 < p.costPer25 && o.family === p.family).sort(byScore).slice(0, 5);
  const more = others.filter((o) => o.proteinG > p.proteinG && o.family === p.family).sort(byScore).slice(0, 5);
  const brand = others.filter((o) => o.brandSlug === p.brandSlug).sort(byScore).slice(0, 5);
  const plant = p.family === 'plant'
    ? others.filter((o) => o.family === 'plant' && o.proteinType !== p.proteinType).sort(byScore).slice(0, 5)
    : others.filter((o) => o.family === 'plant').sort(byScore).slice(0, 5);
  return [
    { key: 'cheaper', heading: 'Cheaper per gram of protein', rows: cheaper },
    { key: 'more', heading: 'More protein per scoop', rows: more },
    { key: 'brand', heading: `More from ${p.brand}`, rows: brand },
    { key: 'plant', heading: p.family === 'plant' ? 'Other plant proteins' : 'Plant-based alternatives', rows: plant },
  ].filter((b) => b.rows.length);
}

// ---------------------------------------------------------------------------
// Glossary
// ---------------------------------------------------------------------------

export const GLOSSARY = [...RAW_GLOSSARY].sort((a, b) => a.term.localeCompare(b.term)).map((g) => ({ ...g, url: `/glossary/${g.slug}/` }));
export const GLOSSARY_BY_SLUG = new Map(GLOSSARY.map((g) => [g.slug, g]));

// ---------------------------------------------------------------------------
// Routes (shared with the link validator and the sitemap filter)
// ---------------------------------------------------------------------------

/** Every route the database generates, with whether it may be indexed. */
export function generatedRoutes() {
  return [
    ...PRODUCTS.map((p) => ({ path: p.url, indexable: p.labelComplete })),
    ...BRANDS.map((b) => ({ path: b.url, indexable: true })),
    ...COMPARISONS.map((c) => ({ path: c.url, indexable: c.indexable })),
    ...GLOSSARY.map((g) => ({ path: g.url, indexable: true })),
  ];
}

/** Paths kept out of the sitemap because the page carries noindex. */
export function noindexPaths() {
  return new Set(generatedRoutes().filter((r) => !r.indexable).map((r) => r.path));
}

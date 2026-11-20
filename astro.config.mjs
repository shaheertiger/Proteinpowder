import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { SITE_URL } from './site.config.mjs';
import markdownTwins from './src/integrations/markdown-twins.mjs';
import { noindexPaths } from './src/lib/db.mjs';

// Generated pages that carry noindex (comparison pairs without search demand,
// product pages with an incomplete label) stay out of the sitemap.
const NOINDEX = noindexPaths();

// Database hubs: the all-powders table, the brand index, the compare tool,
// the glossary index and the methodology page every score links to.
const databaseHubs = new Set(['protein-powder', 'brands', 'compare', 'glossary', 'methodology']);

// One sitemap per generated template (sitemap-products-0.xml and so on), so
// Search Console reports indexing per template. Everything else falls through to
// sitemap-pages-0.xml.
const chunkFor = (prefix) => (item) => (new URL(item.url).pathname.startsWith(prefix) ? item : undefined);

// Pillar pages (the "best-*" roundups the clusters are built to support). They get
// the highest sitemap priority after the home page and the guide index.
const pillarGuides = new Set([
  'best-protein-powder',
  'best-whey-protein-isolate',
  'best-plant-based-protein-powder',
  'best-protein-powder-for-muscle-gain',
  'best-protein-powder-for-weight-loss',
  'best-protein-powder-for-women',
  'best-tasting-protein-powder',
  'best-whey-protein-powder',
]);

// Supporting guides that target high-volume search terms. They get a higher
// sitemap priority than the 0.5 default so crawlers reach them sooner. The daily
// publishing run adds each new slug here (see .claude/skills/daily-publish).
const priorityGuides = new Set([
  // Extra batch (2026-11-20): 5 Google + 5 Bing articles.
  'best-marshmallow-protein-powder',
  'best-micellar-casein-protein-powder',
  'bucked-up-protein-powder-review',
  'transparent-labs-mass-gainer-review',
  'dymatize-super-mass-gainer-review',
  // Daily batch (2026-11-20): 5 Google + 5 Bing articles.
  'premier-protein-vs-optimum-nutrition',
  'ryse-vs-ghost-protein',
  'gladiator-protein-powder-review',
  'designs-for-sport-beef-protein-review',
  'best-dole-whip-protein-powder',
  'shaklee-protein-powder-review',
  'ora-protein-powder-review',
  'isopure-clear-protein-powder-review',
  'six-star-protein-powder-review',
  'cvs-protein-powder',
  // Chocolate whey guide (2026-11-19).
  'best-chocolate-whey-protein-powder',
  // Daily batch (2026-11-19): 5 Google + 5 Bing articles.
  'optimum-nutrition-vs-body-fortress',
  'optimum-nutrition-vs-muscle-milk',
  'glo-protein-powder-review',
  'xo-jacqui-protein-powder-review',
  'best-horchata-protein-powder',
  'lineage-protein-powder-review',
  'bobby-approved-protein-powder-review',
  'blessed-protein-powder-review',
  'naked-mass-protein-powder-review',
  'equate-protein-powder',
  // Daily batch (2026-11-18): 5 Google + 5 Bing articles.
  'collagen-vs-protein-powder',
  'mass-gainer-vs-protein-powder',
  'pure-protein-vs-premier-protein',
  'muscletech-protein-powder-review',
  'homemade-protein-powder',
  'swanson-senior-muscle-retention-protein-review',
  'serious-mass-protein-powder-review',
  'bulksupplements-protein-powder-review',
  '1up-protein-powder-review',
  'sprouts-protein-powder',
  // Daily batch (2026-11-17): 5 Google + 5 Bing articles.
  'creatine-vs-protein-powder',
  'casein-vs-whey-protein-powder',
  'best-protein-drink-for-seniors',
  '1st-phorm-protein-powder-review',
  'syntha-6-protein-powder-review',
  'pro-jym-protein-powder-review',
  'alani-nu-protein-powder-review',
  'pb2-protein-powder-review',
  'bobs-red-mill-protein-powder-review',
  'sams-club-protein-powder',
  // Daily batch (2026-11-16): 5 Google + 5 Bing articles.
  'premier-protein-vs-ensure',
  'muscle-milk-vs-premier-protein',
  'best-premier-protein-flavor',
  'inno-supps-protein-powder-review',
  'promix-protein-powder-review',
  'herbalife-protein-powder-review',
  'mre-lite-protein-powder-review',
  'arbonne-protein-powder-review',
  'kos-protein-powder-review',
  'trader-joes-protein-powder',
  // Daily batch (2026-11-15): brand reviews and the expiry guide.
  'lgxnds-protein-powder-review',
  'wheybolic-protein-powder-review',
  'nutricost-protein-powder-review',
  'musclepharm-combat-protein-powder-review',
  'kirkland-protein-powder-review',
  'does-protein-powder-expire',
  'c4-protein-powder-review',
  'bodytech-protein-powder-review',
  'body-fortress-protein-powder-review',
  'be-well-by-kelly-protein-powder-review',
  // November 2026: Amazon buyer's guide batch.
  'best-protein-water',
  'best-pumpkin-spice-protein-powder',
  'best-creatine-monohydrate',
  'best-portable-blender-for-protein-shakes',
  'best-protein-powder-for-ninja-creami',
  'best-protein-cereal',
  'best-protein-cookies',
  'best-protein-chips',
  'best-protein-pasta',
  'best-protein-hot-chocolate',
  // November 2026: Amazon buyer's guide batch (20 guides).
  'best-dairy-free-protein-powder',
  'best-soy-free-protein-powder',
  'best-kosher-protein-powder',
  'best-low-fodmap-protein-powder',
  'best-low-histamine-protein-powder',
  'best-anti-inflammatory-protein-powder',
  'best-protein-powder-for-hair-loss',
  'best-whole-food-protein-powder',
  'best-matcha-protein-powder',
  'best-banana-protein-powder',
  'best-cinnamon-protein-powder',
  'best-protein-powder-without-stevia',
  'best-protein-pancake-mix',
  'best-protein-shaker-bottle',
  'best-bulk-protein-powder',
  'best-all-in-one-protein-powder',
  'best-low-sodium-protein-powder',
  'best-almond-protein-powder',
  'best-low-calorie-protein-powder',
  'best-protein-powder-for-body-recomposition',
  // November 2026: second buyer's guide batch.
  'best-protein-bars',
  'best-birthday-cake-protein-powder',
  'best-protein-powder-with-creatine',
  'best-protein-powder-with-fiber',
  'best-protein-powder-with-probiotics',
  'best-whey-protein-concentrate',
  'best-protein-powder-for-vegetarians',
  'best-pumpkin-seed-protein-powder',
  'best-protein-powder-for-acne',
  'best-greens-protein-powder',
  'how-much-protein-do-i-need',
  'protein-calculator',
  'whey-vs-whey-isolate',
  'whey-vs-plant-protein',
  'is-protein-powder-safe',
  'when-to-take-protein-powder',
  // October 2026: keyword-research batch — goal, flavor, format and brand pages.
  'protein-powder-comparison',
  'do-protein-supplements-build-muscle',
  'best-protein-powder-for-men',
  'best-protein-powder-for-weight-gain',
  'best-protein-powder-for-smoothies',
  'best-unflavored-protein-powder',
  'best-protein-drink',
  'best-clear-protein-powder',
  'best-pea-protein-powder',
  'best-clean-protein-powder',
  // October 2026: Amazon-affiliate keyword batch — category roundups and brand reviews.
  'best-bone-broth-protein-powder',
  'best-collagen-protein-powder',
  'best-organic-protein-powder',
  'best-casein-protein-powder',
  'best-beef-protein-powder',
  'best-hemp-protein-powder',
  'best-soy-protein-powder',
  'best-chocolate-protein-powder',
  'best-vanilla-protein-powder',
  'best-cheap-protein-powder',
  'amazon-protein-powder',
  'fruity-pebbles-protein-powder',
  'myprotein-review',
  'muscleblaze-protein-review',
  'orgain-protein-powder-review',
  'isopure-protein-powder-review',
  'equip-protein-powder-review',
  'flavcity-protein-powder-review',
  'clean-simple-eats-protein-powder-review',
  'ryse-protein-powder-review',
  'just-ingredients-protein-powder-review',
  'truvani-protein-powder-review',
  'kachava-review',
  'premier-protein-powder-review',
  'ghost-protein-powder-review',
  'optimum-nutrition-protein-powder-review',
  'seeq-protein-powder-review',
  'huel-protein-powder-review',
  'levels-protein-powder-review',
  'garden-of-life-protein-powder-review',
  'vega-protein-powder-review',
  'transparent-labs-protein-powder-review',
  'ascent-protein-powder-review',
  'naked-nutrition-protein-powder-review',
  'momentous-protein-powder-review',
  'legion-protein-powder-review',
  'jocko-protein-powder-review',
  'owyn-protein-powder-review',
  'muscle-milk-protein-powder-review',
  'sunwarrior-protein-powder-review',
  'dymatize-protein-powder-review',
  'pure-protein-powder-review',
  'bloom-protein-powder-review',
  'thorne-protein-powder-review',
  'devotion-protein-powder-review',
  'pescience-protein-powder-review',
  'puori-protein-powder-review',
  'cbum-protein-powder-review',
  'quest-protein-powder-review',
  'unjury-protein-powder-review',
  'paleovalley-bone-broth-protein-review',
  'ballerina-farm-protein-powder-review',
  'happy-viking-protein-powder-review',
  'gnc-protein-powder-review',
  'ritual-protein-powder-review',
  'oath-protein-powder-review',
  'prodough-protein-powder-review',
  // November 2026: twenty more buyer's guides.
  'best-protein-powder-before-bed',
  'best-protein-powder-without-artificial-sweeteners',
  'best-sugar-free-protein-powder',
  'best-gluten-free-protein-powder',
  'best-hydrolyzed-whey-protein',
  'best-brown-rice-protein-powder',
  'best-protein-powder-for-oatmeal',
  'best-protein-powder-packets',
  'best-protein-powder-for-pregnancy',
  'best-protein-powder-for-breastfeeding',
  'best-protein-powder-for-menopause',
  'best-protein-powder-for-pcos',
  'best-cookies-and-cream-protein-powder',
  'best-strawberry-protein-powder',
  'best-peanut-butter-protein-powder',
  'best-salted-caramel-protein-powder',
  'best-protein-powder-for-kids',
  'best-protein-powder-for-runners',
  'best-protein-powder-for-recovery',
  'best-nsf-certified-protein-powder',
  // November 2026: SEO blueprint Tier 1 and Tier 2 best-ofs.
  'best-lactose-free-protein-powder',
  'best-protein-powder-for-sensitive-stomach',
  'best-egg-white-protein-powder',
  'best-protein-powder-for-teens',
  'best-protein-powder-for-seniors',
  'best-protein-powder-for-diabetics',
  'best-costco-protein-powder',
  // November 2026: keyword-file buyer's guide batch.
  'best-protein-supplements',
  'best-walmart-protein-powder',
  'best-target-protein-powder',
  'best-aldi-protein-powder',
  // Aldi cluster spokes (2026-11-11).
  'aldi-vs-costco-protein-powder',
  'how-many-servings-in-aldi-protein-powder',
  'is-elevation-protein-powder-good',
  'how-much-is-aldi-protein-powder',
  'best-meal-replacement-shake',
  'best-protein-powder-for-bariatric-surgery',
  'best-protein-powder-for-beginners',
  'best-fat-burning-protein-powder',
  'best-grass-fed-whey-protein',
  'best-paleo-protein-powder',
  'best-low-carb-protein-powder',
  'best-protein-powder-for-glp-1',
  'best-protein-powder-for-coffee',
  'best-protein-powder-for-baking',
  'best-protein-powder-without-heavy-metals',
]);

export default defineConfig({
  site: SITE_URL,
  // Canonical URLs, sitemap entries and internal links all use a trailing slash;
  // Vercel 308-redirects the slash-less form (see trailingSlash in vercel.json).
  trailingSlash: 'always',
  integrations: [
    react(),
    tailwind(),
    sitemap({
      filter: (page) => !NOINDEX.has(new URL(page).pathname),
      chunks: {
        products: chunkFor('/protein-powder/'),
        brands: chunkFor('/brands/'),
        compare: chunkFor('/compare/'),
        glossary: chunkFor('/glossary/'),
      },
      serialize(item) {
        const url = item.url.replace(/\/$/, '');
        const slug = url.slice(SITE_URL.length + 1);
        item.lastmod = new Date().toISOString();

        if (url === SITE_URL) {
          item.changefreq = 'weekly';
          item.priority = 1.0;
        } else if (slug === 'best-of') {
          item.changefreq = 'weekly';
          item.priority = 0.9;
        } else if (databaseHubs.has(slug)) {
          item.changefreq = 'weekly';
          item.priority = 0.9;
        } else if (/^(protein-powder|brands)\//.test(slug)) {
          item.changefreq = 'monthly';
          item.priority = 0.7;
        } else if (pillarGuides.has(slug)) {
          item.changefreq = 'monthly';
          item.priority = 0.9;
        } else if (priorityGuides.has(slug)) {
          item.changefreq = 'monthly';
          item.priority = 0.8;
        } else {
          item.changefreq = 'monthly';
          item.priority = 0.5;
        }

        return item;
      },
    }),
    // Writes a Markdown twin of every page (/slug.md), /llms.txt and
    // /llms-full.txt into dist for AI agents; middleware.ts serves the twins.
    // Keep it after sitemap(): llms-full.txt is indexed from the built sitemap.
    markdownTwins(),
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});

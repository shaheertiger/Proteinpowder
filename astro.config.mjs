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
  'how-much-protein-do-i-need',
  'protein-calculator',
  'whey-vs-whey-isolate',
  'whey-vs-plant-protein',
  'is-protein-powder-safe',
  'when-to-take-protein-powder',
  // October 2026: keyword-research batch — goal, flavor, format and brand pages.
  'protein-powder-comparison',
  'protein-powder-brands',
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

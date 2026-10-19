import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { SITE_URL } from './site.config.mjs';

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
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});

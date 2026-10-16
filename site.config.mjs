// Single source of truth for the site's identity. astro.config.mjs, the build
// scripts (IndexNow, link validation, Search Console report) and src/data/site.ts
// all read from here, so moving the domain is a one-line change.
export const SITE_HOST = 'www.best-proteinpowder.com';
export const SITE_URL = `https://${SITE_HOST}`;
export const SITE_NAME = 'Best Protein Powder';

// IndexNow key. public/<key>.txt must contain exactly this value so search
// engines can verify ownership. Overridable with the INDEXNOW_KEY env var.
export const INDEXNOW_KEY = '0f4b3b0525e94b5f88755b89f9a69d52';

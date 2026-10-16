// Single source of truth for the site's contact and identity details. The
// domain and brand name live in /site.config.mjs so the build scripts share them.
// NOTE: confirm this mailbox exists (or change it) before launch — it is shown
// publicly on /contact/ and used in the Organization schema.
export { SITE_URL, SITE_NAME, SITE_HOST } from '../../site.config.mjs';
export const CONTACT_EMAIL = 'editors@best-proteinpowder.com';
export const FOUNDED = '2026';

// Google Analytics 4 measurement ID for this property (G-XXXXXXXXXX). The tag is
// only rendered when this is set, so an empty value simply means no analytics.
export const GA_MEASUREMENT_ID = '';

// AdSense publisher ID. Ads only serve once this site is added and approved in
// the AdSense account; public/ads.txt must carry the same publisher ID.
export const ADSENSE_CLIENT = 'ca-pub-2128579868272786';

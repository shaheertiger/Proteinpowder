# What earns search traffic on the sister sites, and what Protein lacks (28 Nov 2026)

Sources: Bing Webmaster API (`apikey`; page stats for the last ~35 days, daily traffic) and
Vercel Web Analytics (search-engine referrers, 29 Oct to 28 Nov 2026) for every review site on
the account. Raw Bing files for this site are in `content/analytics/bing/2026-11-28/`.

## Search visitors, last 30 days (Vercel, search referrers)

| Site | Search visitors / 30 d | Bing 28 d clicks / impressions | Engines |
|---|---:|---:|---|
| thehonestreviewers.com | ~20,000 | 5,606 / 215,688 | DuckDuckGo 12.6k, Bing 4.6k, Yahoo 2.3k, Brave 0.5k, Google 29 |
| treadmillreviewsusa.com | ~1,700 | 546 / 27,789 (3 → 164 clicks a week in 12 weeks) | DuckDuckGo 0.9k, Bing 0.6k, Yahoo 0.2k, Google 67 |
| hairgrowthreviews.com | ~560 | 168 / 7,669 | Bing family |
| enthusiastreview.com | ~600 | 199 / 22,196 | Bing family |
| **best-proteinpowder.com** | **~350** | **76 / 4,729** | Google 220 (falling), DDG 135, Bing 61 |

The winners get 95%+ of their search traffic from Bing-powered engines (DuckDuckGo, Bing,
Yahoo, Ecosia, Brave). Google sends almost nothing to any of them.

## Bing clicks per page, by page type (Bing GetPageStats, ~35 days)

| Type | Honest Reviewers | Treadmill | Hair growth | **Protein** |
|---|---|---|---|---|
| **Cost / price** ("how much does X cost", "X cost") | **59.7 per page** (3 pages, 2,621 impr/page) | **14.7 per page** (3 pages) | none | 0 pages of this type had Bing data yet (`how-much-does-protein-powder-cost` is 5 days old) |
| "Best <product category>" roundup | 30.4 (114 pages) | 1.0 | 2.8 (its main format) | 0.5 |
| Question / how-to / chart pages | 23.9 (17 pages) | 1.8 (36 pages) | 1.0 | 1.5 (2 pages) |
| X vs Y | 50.0 (3 pages) | 1.8 | none | 0.5 |
| Brand reviews | 12.3 | 1.3 | 2.4 | 0.8 |

**On both sites that grew on Bing, cost/price pages earn the most clicks per page,** at about
2x (Honest Reviewers) and 8-15x (Treadmill) each site's average page. Top examples:

- `/generac-generator-cost/`: 5,712 Bing impressions, pos 6.0, 469 search visitors / 30 d.
  Title: "Generac Generator Cost in 2026: $6,500–$13,000 Installed". The answer (a price range) is in the title.
- `/how-much-does-it-cost-to-seal-a-driveway/`, `/epoxy-garage-floor-cost/`: pos 3.7-4.0.
- `/how-much-does-a-treadmill-cost/` is the Treadmill site's #1 page (118 visitors, pos 2.8).
  Its next pages are question pages with a number or a chart: `treadmill-incline-percent-vs-degrees`,
  `treadmill-horsepower-guide`, `treadmill-belt-size-guide`, `treadmill-pace-and-speed-chart`,
  `what-speed-should-i-walk-on-a-treadmill`, `how-long-do-treadmills-last`.

Protein has almost none of this type: 293 pages, and only `how-much-does-protein-powder-cost`
(23 Nov), `how-much-is-aldi-protein-powder`, `how-much-is-costco-protein-powder` (27 Nov) and
`how-many-servings-in-aldi-protein-powder` are cost or number-answer pages. The Aldi ones work:
`best-aldi-protein-powder` and its follow-ups are among Protein's best Bing pages.

## Process differences (Honest Reviewers / Treadmill vs Protein)

1. **Bing keyword volume before writing.** Honest Reviewers checks every topic with
   `scripts/bing-keyword-volume.mjs` (Bing `GetKeywordStats`) and drops topics with no Bing
   data. Protein picked topics from Google/Semrush exports. Ported as `npm run bing:kw`.
2. **Real sitemap `lastmod`.** Honest Reviewers and Treadmill give each URL its own last-changed
   date. Protein stamped every URL with the build time, which Bing ignores when every URL shares
   one. Ported in `astro.config.mjs` (+ `scripts/unshallow-for-dates.mjs`). It is a hygiene fix,
   not a proven traffic lever. Honest Reviewers added it on 25 Nov, after its traffic was already there.
3. Same page template, schema (Article, FAQPage, BreadcrumbList) and IndexNow on every site,
   so templates are not the difference.

## Applied on Protein (28 Nov 2026)

Four cost and number-answer pages, each with Semrush demand and no existing page:
`how-much-is-a-scoop-of-protein-powder`, `how-much-protein-powder-per-day`,
`why-is-protein-powder-so-expensive`, `costco-orgain-protein-powder`.
Check their Bing impressions after 14 days (rule P5) before cloning the format further.

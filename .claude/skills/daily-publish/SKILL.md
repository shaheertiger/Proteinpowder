---
name: daily-publish
description: The daily article run. Publishes ten articles a day (five built for Google, five built for Bing, per the rules in this file), wires them into their pillars and the index, runs every gate, and pushes to main. Use when the daily publishing Routine fires, or when asked to run the daily batch manually.
---

# Daily publish run

**Ten articles a day: five built for Google and five built for Bing.** Topic choice
follows the search-engine rules in section 0, which are based on the site's own
Google Search Console and Bing Webmaster data. They replace the old "five articles,
one cluster" rule. `npm run topics` is still used, but only to fill a slot the rules
below can't fill.

**Two of each day's articles come from the X-vs-Y queue (`VS-QUEUE.md`, 47 brand pairs
ranked by demand).** See "X-vs-Y queue" in section 0.

## 0a. Pull the last 7 days of Vercel traffic for every search engine (do this first)

Every run starts from real visits, not just exports. Use the Vercel MCP tool
`aggregate_pageviews` (load it with ToolSearch `select:mcp__Vercel__aggregate_pageviews`
if it is deferred). Project `prj_YjcFnTN8BC1dylJW0y2OuICRSVNE`, team
`team_pAoikpyeUpvHszE2JvWQKq7c`, `since` = 7 days before today 00:00 UTC, `until` =
today 23:59:59 UTC, `limit` 100, and this filter on both calls:

```
referrerHostname in ('google.com','search.google.com','com.google.android.googlequicksearchbox','bing.com','duckduckgo.com','search.yahoo.com','ecosia.org','search.brave.com','startpage.com')
```

1. `by: ["day", "referrerHostname"]`, saved as `content/analytics/vercel/<today>/daily.json`
2. `by: ["requestPath", "referrerHostname"]`, saved as `content/analytics/vercel/<today>/pages.json`

Save the tool's JSON as returned, then run:

```bash
npm run engines -- content/analytics/vercel/<today>
```

It prints each engine's visitors per day (with a `!! DROP` line when an engine
falls off), which page types earn its visits, and its top pages, plus a "Bing family"
total (Bing + DuckDuckGo + Yahoo + Ecosia share Bing's index). Commit the snapshot
with the batch. If the Vercel tool is unavailable, say so in the run report and use
the newest snapshot in `content/analytics/vercel/` instead. Never guess the numbers.

**Then pull Bing Webmaster data (step 0b):**

```bash
npm run bing
```

It uses the Bing Webmaster API key in the `apikey` environment variable (never print
or commit it), saves `content/analytics/bing/<today>/`, and reports Bing's daily
trend, top queries and pages (7 and 28 days), page-one queries with no clicks, queries
with no page, and rising pages. If it exits with "No Bing key" or an API error, say so
in the run report and carry on with Vercel data. Use it this way:

- **Queries with no page** are the first source of Bing-family topics (check each
  against existing slugs; the matcher is loose).
- **Page one, no clicks:** fix 1-2 titles and descriptions a day so the snippet
  answers the exact query (one of the day's slots, not on top of ten).
  Log each change with its baseline in `content/analytics/snippet-changes.md`, and
  fill in the result column for changes that are 14+ days old.
- **Rising pages** are winners: link 1-2 of today's new pages from them and add an
  FAQ for any query they rank for but don't answer.

**How the report sets today's batch (overrides the fixed 5 + 5 split when they conflict):**

- **Split the 10 slots by engine in proportion to the last 7 days of search
  visitors,** with at least 2 slots for any engine family that sent 10+ visitors.
  Google and the Bing family are the two families. If Google shows `!! DROP` or is
  still recovering (see "READ FIRST" below), Google gets 0 new-page slots and the
  batch is 5 Bing-family articles only.
- **Inside each engine, copy the page types that earn its visits.** Write the next
  pages of the engine's top two page types, choosing brands, stores or niches that
  have search volume in the keyword export and no page yet. For the Nov 21 numbers this
  meant: DuckDuckGo = brand reviews of premium/clean brands and "is X good" (74% of
  its visits); Bing = brand reviews (46%), type/diet guides (21%) and store guides (13%);
  Ecosia/Yahoo = the same pages as DuckDuckGo.
- **Grow the winners.** Any page with 3+ visitors from one engine in the week is a
  winner. Before writing new pages, check that each winner links to its newest
  siblings (add an in-body link to 1-2 of today's pages from it), and that today's
  pages link back to it. That is how a new page borrows the winner's standing.
- **An engine whose visits fell 60%+ for two days gets no new pages that day.**
  Write for the engines that are holding up, and say why in the run report.
- Report the engine table (visitors, trend, top page types) at the top of the run report.

## 0. Search-engine rules: 5 for Google, 5 for Bing

These rules come from the November 2026 exports committed in
`content/search-console/2026-11-16/` (`google/` holds the Search Console Pages and
Queries files; `bing/` holds the Bing Webmaster page, keyword and daily overview
files). When a newer export lands, re-check the numbers below and update this
section if the pattern has changed.

### READ FIRST (28 Nov 2026): copy what wins on the sister sites (cost/price + number-answer pages)

The owner said on 28 Nov 2026 to apply what is proven to bring traffic on the other sites. Evidence (Bing API +
Vercel for every review site, `content/analytics/cross-site-2026-11-28.md`): thehonestreviewers.com gets ~20,000
search visitors a month and treadmillreviewsusa.com went from 3 to 164 Bing clicks a week in 12 weeks, both 95%+
from Bing/DuckDuckGo/Yahoo. **On both, cost/price pages earn the most clicks per page** (Honest Reviewers 59.7 per
page, 2x its average; Treadmill 14.7, ~8-15x its average). Next come question pages that answer with a number or a
chart. Protein had almost none.

- **Every run, at least 2 of the day's slots are cost/price or number-answer pages**: "how much is <store/brand>
  protein powder", "<brand> protein powder price", "how many servings / scoops / grams ...", "how long does ... last".
  The Aldi pages are proof this works here. Put the answer (a price range or number) in the title, as
  `generac-generator-cost` does ("$6,500–$13,000 Installed"). Put it in the first clause of the description too.
- **Check Bing demand first:** `npm run bing:kw -- "<keyword>" ...` (Bing `GetKeywordStats`, ported from Honest
  Reviewers). Replace any topic with no Bing data. If the API answers `ThrottleUser`, fall back to the Semrush files
  in `content/keyword-research/` and say so in the run report.
- **Low/no-click pages** get the Honest Reviewers low-click rewrite (title led by the most-searched variant, number or
  yes/no from the page, description answers first, lede answers first). Done for ~220 pages on 28 Nov; logged in
  `content/analytics/snippet-changes.md`. Don't retitle a page again within 14 days of its last change.
- The sitemap now carries real per-page `lastmod` (git dates). Never go back to stamping the build time.

Written 28 Nov: `how-much-is-a-scoop-of-protein-powder`, `how-much-protein-powder-per-day`,
`why-is-protein-powder-so-expensive`, `costco-orgain-protein-powder`. Judge the format by their Bing impressions on
or after 12 Dec (rule P5).

### READ FIRST (27 Nov 2026): double down / stop, from the Bing API + Vercel

The owner said on 27 Nov 2026 to ignore Google: **all daily slots are Bing/DuckDuckGo slots** until the owner says
otherwise; skip the Google rules below. Data: Bing Webmaster API (`apikey`, site `https://best-proteinpowder.com/`,
page/keyword stats to 20 Nov, daily totals to 25 Nov) and Vercel search landings 28 Oct to 27 Nov (DuckDuckGo,
Bing, Yahoo, Ecosia, Brave). Bing: ~1,000-1,500 impressions and 15-25 clicks a week, flat.

| Type | Pages | Non-Google search visitors (30 d) | Per page | Verdict |
|---|---:|---:|---:|---|
| Store guides (`best-aldi`, `best-costco`, `best-walmart`, `how-many-servings-in-aldi-protein-powder`) | 7 | ~17 | **~2.4** | **DOUBLE DOWN** |
| Brand reviews / "is <brand> good" | 106 | ~110 | ~1.0 | **DOUBLE DOWN** (trust brands) |
| "Best protein powder for <X>" guides | 112 | ~35 (whey 17, low-histamine 5) | ~0.3 | Only narrow diet niches |
| X-vs-Y articles | 29 | ~0 | ~0 | **STOP on Bing** |

Top landings: `/best-whey-protein-powder/` 17, `/happy-viking-protein-powder-review/` 17,
`/is-elevation-protein-powder-good/` 14, `/oath-protein-powder-review/` 9, `/best-aldi-protein-powder/` 8,
`/just-ingredients-protein-powder-review/` 7, `/prodough-protein-powder-review/` 6.

**Double down:** every remaining store (Sam's Club, Kroger, Trader Joe's, Target, GNC, Vitamin Shoppe, Meijer, HEB,
Publix, Whole Foods, Amazon house brands) and store follow-ups in the Aldi pattern ("how many servings in <store>
protein", "<store> protein price per scoop"); reviews of premium/clean/influencer brands with trust questions
(Happy Viking, Elevation, Oath, Prodough, Ballerina Farm pattern), "third-party tested" as the first FAQ.

**Stop (do not repeat):**
- **P1. No new X-vs-Y articles for Bing slots.** 29 written, essentially no Bing/DDG landings. This overrides
  "Rules for Bing" item 6 and the 2-a-day X-vs-Y queue below. Write one only if the exact pair is in the Bing
  keyword report.
- **P2. No broad "best protein powder for <goal>" pages** (weight gain 175 impr / 1 click, best-tasting pos 11,
  PCOS 0 clicks). Narrow diet restrictions (low-histamine, low-FODMAP) are the only exception.
- **P3. CTR before volume.** Pages at Bing page one with CTR under 2% get a title/description rewrite (answer in the
  description) before new siblings: `ascent-protein-powder-review` (pos 2.8, 180 impr, 1.1%),
  `happy-viking` (298, 1.7%), `best-protein-powder-for-weight-gain` (175, 0.6%), `best-walmart` (103, 1.0%),
  `best-costco` (63, 0%). Max 3 per run.
- **P4. No `/protein-powder/<product>/` pages as targets**; they get impressions at pos 7-8 and no clicks.
- **P5. A format is proven only after 14 days and 5+ live pages**; don't clone off one click.

### READ FIRST: the Nov 20, 2026 Google drop, and what each engine rewards now

Data: `content/search-console/2026-11-21/` (`google/` is the Nov 17-21 Search Console
export; `vercel/` is Vercel Analytics top pages for Nov 14-21: all referrers, Google
only, DuckDuckGo only). These rules override anything older below when they conflict.

**What happened.** Over Nov 17-19 the site opened ~1,800 templated `/compare/` pairs
to the index (about 450 words each, ~65% word-for-word identical across pairs). The
sitemap went from ~500 to ~2,300 URLs in 72 hours on a site only weeks old. Google
impressions slid 2,058 → 1,859 → 1,528, then fell to **35 on Nov 20**, and Vercel
showed **zero Google visitors** that day. Bing and DuckDuckGo did not move. The site
was technically fine (200s, robots, canonicals), so the cause was the volume of
templated pages, which reads to Google as scaled content. The fix (commit a2488ac)
limited indexable compare pairs to a hand-kept list. On Nov 21 the programmatic
`/compare/` pages were removed outright: every `/compare/` URL now 301s, a pair to the
editorial X-vs-Y article for its two brands where one exists, everything else to
`/protein-powder-comparison/` (`src/data/compare-redirects.json`, written into
`vercel.json` by `node scripts/build-compare-redirects.mjs`; the build fails if
vercel.json is stale). Never recreate `/compare/` pages or link to `/compare/`.

**Hard rules from this:**
- **Never open more than ~20 new indexable URLs in a day,** of any type, programmatic
  or hand-written. A day's batch of 10 articles is the ceiling, not a target.
- **Head-to-heads are hand-written articles only.** When a brand pair shows demand
  (Search Console impressions, or the exact "X vs Y" query in the keyword export),
  write a full X-vs-Y article, add it to `src/data/compare-redirects.json` (url,
  brands, title), and run `node scripts/build-compare-redirects.mjs`. Product cards
  and product pages then link to it automatically. Adding a product to the database
  must never create pages beyond its own `/protein-powder/<slug>/` page.
- **Never change titles or templates on every page of a type in one push** (Nov 19-20
  retitled all 100 product pages at once). Change 10-20 at a time and wait for an export.
- **While Google is recovering** (until a Search Console export shows daily
  impressions back above ~1,500), the daily run publishes **Bing/DuckDuckGo articles
  only, 5 a day,** and skips the Google slots.

**What works, by engine (Nov 14-21):**

| Engine | Visitors (7 d) | What earns the clicks |
|---|---|---|
| Google | 63 (now ~0) | About 20 compare pairs between brands people actually search (Ascent vs Levels 7 visits; Ballerina Farm vs Naked, CSE vs Premier, Naked vs ON, FlavCity vs Levels), then brand reviews (Ryse, Devotion) and narrow guides (egg white, soy, soy-free, without heavy metals). Compare pages: 14 of 28 clicks at 1.8% CTR, but only 115 of 1,807 pairs ever got an impression. |
| DuckDuckGo (Bing's index) | 33, steady | **Trust reviews of premium and "clean" brands:** `is-elevation-protein-powder-good` (top page), Equip, Happy Viking, Levels, Sunwarrior, Ballerina Farm, Thorne, Garden of Life, Owyn, Paleovalley, Truvani, Puori, Vega. Also low-histamine and without-heavy-metals guides. |
| Bing | 24, up 60% | **Store guides and dietary niches:** best-aldi (top), best-low-histamine, best-low-fodmap, best-whey-protein-powder, plus reviews of brands with a trust question (Ghost, Just Ingredients, Elevation). |

**So for the Bing/DuckDuckGo slots:**
- DuckDuckGo: brand reviews of premium, clean, plant, organic or practitioner brands
  (search volume 300+ is enough), plus "is <brand> good" pages for brands with no
  review yet. Lead with third-party testing, heavy metals, sweeteners and the clean
  label question. These readers are checking trust, not price.
- Bing: one store guide per batch while stores remain (Aldi-style: what the store
  stocks, its house brand, cost per 25 g), one dietary-niche guide (low-histamine,
  low-FODMAP style: a narrow medical or diet restriction, careful and not medical
  advice), and brand reviews of mass-market brands people ask trust questions about.
- An "is <brand> good" page must not target a brand that already has a review page,
  because the two would compete for the same searches.

### What the data showed (Nov 16 export, kept for history)

| Format | Google (24 h, 1,316 impr.) | Bing (~4 weeks, 1,464 impr.) |
|---|---|---|
| Brand reviews / "is X good" | avg. pos 14, 1.3% CTR | **61% of clicks**, pos 5.5, 3.6% CTR |
| X-vs-Y comparisons | **42% of clicks**, pos 6.7, 2.9% CTR | almost unseen (1 impression) |
| Single flavour / single use / single type guides | pos 3-7 (coffee #6, cookies & cream #3) | 16% of clicks, 4.0% CTR |
| Store-brand guides (Walmart, Costco, Aldi, Target) | barely seen | 8% of clicks, pos 5.8 |
| Broad "best protein powder for [goal]" | **pos 47, 0.5% CTR** | pos 6.6, 2.3% CTR |
| Informational / how-to | pos 26, 0 clicks | very little |

In short, Google rewards specific comparisons and narrow guides and buries broad head
terms. Bing ranks almost everything on page one and sends its clicks to brand reviews
that answer trust questions.

### X-vs-Y queue: 2 articles every run (do these first)

The programmatic `/compare/` pages were removed on Nov 21, 2026 (they 301 now). Every
brand pair that showed Google demand and has no article yet is queued, highest demand
first, in **`VS-QUEUE.md`** (this folder). Every run:

1. Take the **top 2 unticked rows** of `VS-QUEUE.md`. Check the slug is not taken and
   no existing article already covers the pair (`src/data/compare-redirects.json`).
2. Write each as a brand-level head-to-head (`ARTICLE-FORMAT.md` type C) in the
   section order of `/ghost-vs-optimum-nutrition/`: Short Answer with a factor table,
   picks at a glance, one product card per side, spec sheets side by side, the deciding
   questions, what each does well and where it falls short, which to buy, who should
   skip both, 5 mistakes, 7 FAQs, sources and recent updates. Label numbers come from
   `src/data/db/products.json`; the "Searched as" phrasings go in the title, an H2 and
   FAQ 1.
3. Add `{ url, brands, title }` to `src/data/compare-redirects.json` and run
   `node scripts/build-compare-redirects.mjs` (the build fails if `vercel.json` is
   stale). Product cards and product pages start linking to the article automatically.
4. Alias the cards' ids to the database rows (`ALIASES` in
   `scripts/db/import-research.mjs` and the row's `aliases` in `products.json`), add
   ASINs and images for the ids, a `best-of.astro` row and a `priorityGuides` entry.
5. Tick the rows in `VS-QUEUE.md` with the date, in the same commit.

The two queue articles count toward the day's batch: they fill the 2 comparison slots
on a Google day, and 2 of the 5 slots while the run is Bing/DuckDuckGo-only
(brand-vs-brand pages work on Bing too, see rule 6 below). When a new Search Console
export lands, re-rank the remaining rows by it and add any new pair that shows demand.
When the queue is empty, say so in the run report.

### The daily split

Every batch is exactly **5 Google articles + 5 Bing articles = 10**. Label each one
`google` or `bing` in your working notes and in the run report. No two articles in
the batch may share a primary keyword (first tag), and none may match an existing
page's primary keyword, whichever engine it is for.

### Rules for Google (5 articles)

Mix: **2 comparisons, 2 brand reviews (each adds a database row), 1 narrow guide.**

**Update from the 2026-11-18 export** (`content/search-console/2026-11-18/google/`, 7 days):

| Page type | Pages seen | Clicks | Impressions | Avg. position | Pages in top 10 |
|---|---|---|---|---|---|
| Programmatic `/compare/` pairs | 148 | 21 | 1,466 | **7.8** | **114** |
| Brand reviews | 45 | 21 | 1,965 | 15.5 | 6 (Ryse alone: 14 clicks) |
| Brand hubs `/brands/<x>/` | 55 | 4 | 769 | 20.2 | 14 |
| Broad `best-*` guides | 70 | 7 | 4,528 | **45.2** | 12 |

The compare pairs that rank are the ones built from products with search demand
(Levels, Ascent, Isopure, Premier, Clean Simple Eats, FlavCity, Jocko, Ryse).
**Superseded on Nov 21:** a new product no longer unlocks indexable compare pages
automatically (see "READ FIRST" above). Every Google brand review still adds its
product to the database, so its label page and noindex compare pairs exist and can
be promoted by hand once they show demand:

- Pick brands with **`<brand> protein powder` volume of 1,000 or more** in the newest
  keyword export that are **not yet in `src/data/db/products.json`**.
- Write a label row in the `scripts/db/SCHEMA.md` format (real supplement-facts
  numbers and the printed ingredient list, sources listed, `null` for anything you
  couldn't confirm). Add its demand to `DEMAND`, and map the review's product-card
  id to the row in `ALIASES` (both in `scripts/db/import-research.mjs`). Then run
  `node scripts/db/import-research.mjs <batch.json>`.
- Product cards whose id resolves to a database row automatically show "Compare: vs …"
  links to that product's strongest compare pages (`topComparisons` in
  `src/lib/db.mjs`), so the alias is what connects the review to its compare pages.
- Editorial "X vs Y" articles come from the queue below, 2 a day.

History: the earlier 3-comparison mix came from the second Google export (2026-11-17, in
`content/search-console/2026-11-17/google/`), which repeated the first. Comparison pages
took 3 of 4 clicks at an average position of 6.1, with 18 of them in the top 10.
Brand reviews sat around position 15 and broad "best" guides around position 47.

**Keep the product database's `demand` field filled in** (Semrush US volume; see
`DEMAND` in `scripts/db/import-research.mjs`). It orders compare links and the
order of head-to-head links. The `/compare/` pages no longer exist (see above).

1. **Comparisons (2): "X vs Y" between well-known brands or products** (e.g.
   "Dymatize ISO100 vs Elite", "Orgain vs Vega", "Optimum Nutrition vs Body Fortress").
   This is Google's best format on the site. Rules:
   - Pick pairs people actually search (keyword export, or "vs" queries in the Google
     Queries file). Prefer pairs where both brands already have a review page.
   - Write it at brand level ("Isopure vs Optimum Nutrition"), covering each
     brand's main products, so it can absorb every product pair between the two
     brands. Register it in `src/data/compare-redirects.json` and rerun
     `node scripts/build-compare-redirects.mjs`. Link to both products' database
     pages (`/protein-powder/<slug>/`). Follow the section order of the Nov 21
     articles (e.g. `/ghost-vs-optimum-nutrition/`): Short Answer with a factor table,
     picks at a glance, product cards, spec sheets side by side, the deciding
     questions, who should skip both, mistakes, FAQ, sources and recent updates.
   - Use `scaffold-roundup.mjs` with one product card per side. Kicker
     "Head-to-Head", section "Comparisons". Give a clear verdict for each kind of buyer.
2. **Brand reviews (2): brands or products searched by name (1,000+ volume) that have
   no page and no database row yet.** Same format as the Bing reviews below, plus the
   database row described above. For Google, lean toward brands with
   striking-distance impressions in the Google Queries file (positions 8-30).
3. **One narrow guide (1): one flavour, one use or one type** (like
   `best-protein-powder-for-coffee` or `best-cookies-and-cream-protein-powder`, both
   on page one). Never a broad goal or audience head term.
4. **Do not write broad "best protein powder for [goal or audience]" pages for
   Google** (muscle gain, weight loss, women, men, seniors). They rank around #47.
5. **Product cards always carry a live Amazon price and ASIN.** Product snippets
   (the price and rating rich result) drove a third of Google clicks.
6. **Answer label facts in plain, quotable sentences.** Google now sends many
   conversational, AI-style queries ("evaluate Thorne on protein powder", "is this
   3rd party tested", "which is the better purchase"). Put the direct answer (protein
   per scoop, sweetener, third-party testing status, cost per 25 g) in the first
   sentence of its section and in the FAQ.

### Lesson from our sister site (besthometheaterreview.com, Nov 17–19 Google export)

Its single-product pages (`/gear/<model>/`, the same template as our `/protein-powder/<slug>/`
label pages) are its best format: 119 pages, 44 in the top 10, and #1 for "<model> review".
Its compare pages and broad "best" guides do worse than ours. What those pages do, and what
ours now do too:

- Title `<Product> Review: Label, Score & Verdict (NN/100)`, with the score in the title.
- A "Compare <product>" section linking its strongest head-to-heads.
- A "Featured in" box naming the roundups that rank it, and a sticky buy bar.

So every product added to the label database is also a page that can rank for its own
model-name search. When you add a database row, prefer products people search by exact
name (flavor-neutral product lines such as "isopure zero carb" or "ascent native fuel").

### Rules for Bing (5 articles)

Mix: **4 brand reviews or "is X good" pages, 1 store-brand or type/flavour guide.**

1. **Brand reviews (4): named brands with search demand and no page yet.** These are
   61% of Bing clicks. Use the keyword export and the Bing KeywordReport to find
   brand-name queries. Format: `scaffold-roundup.mjs`, kicker "Brand Review", badge
   "Label-Checked", section "Brand Reviews", 3-5 product cards, ctaLink to the most
   relevant best-* pillar. An "is <brand> good" page counts as one of these when the
   query is phrased that way (see `is-elevation-protein-powder-good`).
2. **Every Bing review's FAQ must answer these trust questions**, citing only what the
   label or the brand actually states (say so plainly if the brand doesn't say):
   - "Is <brand> third-party tested?" (always the **first** FAQ). Bing searchers
     asked this for Prodough, Paleovalley, Ballerina Farm, Oath, Ryse and CBUM.
   - "Is <brand> healthy / clean?"
   - "Does <brand> contain <casein / lactose / sweetener / lead>?", whichever the
     queries show people asking.
   - "Which <brand> flavour is best?", reported as buyer feedback, never as our tasting.
   - Reviews and complaints: summarise the common praise and complaints from buyer
     reviews, attributed as such.
3. **Put the direct answer to the brand's top question in the description.**
   The Ascent review ranks #1 on Bing for "does ascent native whey protein contain
   casein" (110 impressions) and got zero clicks because the snippet didn't answer it.
4. **One store-brand or type/flavour guide (1)** (Walmart, Costco, Aldi, Target,
   Sam's Club, or a single type or flavour such as casein, unflavoured or fruity
   pebbles). Both formats get Bing clicks at page-one positions.
5. **Weight gain is the one open broad topic on Bing.** About 40 weight-gain and
   mass-gainer queries all land on `best-protein-powder-for-weight-gain`. Mass gainer
   brand reviews, "best mass gainer" and "mass gainer vs whey" are valid Bing slots
   (check for cannibalisation against that page first).
6. **Brand-vs-brand editorial comparisons work on Bing** ("Optimum Nutrition vs Dymatize").
   On thehonestreviewers.com they have the best Bing CTR of any format (5.5%;
   Milwaukee vs DeWalt 6.6% at #3), so one can take a Bing review slot.
7. **Pick winnable keywords and build clusters.** See "Choose keywords you can win"
   and "Build clusters, not islands" in `ARTICLE-FORMAT.md`.

### Both engines

- Never claim hands-on testing; all guardrails at the end of this file still apply.
- Each article links to its pillar and to at least one sibling from the same batch.
  Link Google comparisons to the review pages of both brands, and link Bing reviews
  to the comparison pages for that brand where they exist.
- Titles: brand reviews use "<Brand> Protein Powder Review: <promise>";
  comparisons use "<X> vs <Y>: <verdict promise>".

## 1. Get the brief

```bash
npm run topics -- --json
```

Returns the target pillar, the intents it is still missing, its existing spokes, and
the pages to link out to. Use it to fill any slot that the section 0 rules and the
keyword export can't fill. It is no longer the day's only source of topics.

If the brief names a pillar that is a genuinely bad fit (a discontinued product, a
topic with no search demand), skip it with `npm run topics -- --json --skip 1` and
say so in the run report.

### If a Search Console export is present

`content/search-console/` may hold recent exports. When it does, run
`npm run gsc` before writing and read the report, because it changes what the day
is worth spending on:

- Anything in **IMPROVE FIRST** (position 5-20, real impressions) beats writing a
  new article. If today's pillar or one of its spokes appears there, improving that
  page is the better use of one of the ten slots — do it, and say so in the report.
- **REWRITE TITLE/META** items are five-minute fixes with real upside. Doing one or
  two alongside the batch is free value.
- **QUERIES WITH NO PAGE** are candidates for the batch, but verify each against
  existing slugs first — the matcher is generous and some are already covered.

The topic picker already accounts for demand if `demand.json` exists, so you do not
need to second-guess which cluster it chose.

## 2. Turn each intent into a real article

**Every page follows `ARTICLE-FORMAT.md` (in this folder):** page type A–E, the
snippet formulas, the skeleton with "The Short Answer" first and question-phrased H2s,
and the pre-publish checklist. Read it before writing the first spec.

For each of the ten slots, decide the actual title, slug and angle. Rules:

- **Search intent, not a rephrasing of the pillar.** `whey-protein-bloating` is a
  spoke; `best-whey-protein-reviewed` is a second pillar and must not be written.
- **Check the slug does not exist** in `src/pages/` before writing.
- **No two articles in a batch may target the same primary keyword.** The first
  entry in `tags` is the primary keyword and the gate checks it against every page.
- Titles follow the house pattern: a plain question or statement, then a colon and
  the promise. No year in the title unless the topic is genuinely annual.

## 3. Write the spec and scaffold it

Write content as JSON, then let the scaffolder produce the markup:

```bash
node scripts/scaffold-article.mjs /tmp/spec-1.json
```

Spec fields (all required):

```jsonc
{
  "slug": "whey-protein-bloating",
  "published": "2026-10-16",                 // today
  "crumb": "Whey Protein Bloating",
  "title": "Whey Protein Bloating? The Five Causes, in Order",
  "description": "One sentence, 150-160 chars, says what the page settles.",
  "section": "Whey Protein",                 // match the pillar's section
  "tags": ["whey protein bloating", "..."],  // first tag = primary keyword
  "ctaText": "See Our Top Whey Isolate Picks",
  "ctaLink": "/best-whey-protein-isolate/",  // ALWAYS the pillar
  "kicker": "Troubleshooting",
  "h1": "Whey Protein Bloating?",            // plain text, no colored spans
  "heroLede": "One or two sentences under the H1.",
  "lede": "The opening paragraph. Say the thing the page exists to say.",
  "toc": [["anchor-1", "Short Label"], ["anchor-2", "Short Label"]],
  "sections": [
    { "anchor": "anchor-1", "heading": "Section Heading", "blocks": [
      { "type": "p", "text": "..." },
      { "type": "h3", "text": "..." },
      { "type": "callout", "kicker": "THE RULE", "headline": "...", "body": "..." },
      { "type": "stats", "kicker": "By the Numbers",
        "stats": [{ "value": "25 g", "label": "Protein per scoop" }] },
      { "type": "table", "headers": ["A", "B"], "rows": [["a1", "b1"]] }
    ]}
  ],
  "mistakes": [["Heading", "Body"]],          // exactly 5
  "faq": [["Question?", "Answer."]],          // exactly 7
  "relatedHeading": "Related Whey Protein Guides",
  "related": [{ "url": "/best-whey-protein-isolate/", "color": "text-[#FF4500]",
                "kicker": "Buyer's Guide", "name": "Best Whey Protein Isolate", "blurb": "..." }],
  "moreInCategory": [{ "title": "...", "url": "/..." }],
  "closing": ["Bottom line paragraph one.", "Paragraph two."]
}
```

### Roundup (pillar) specs

New pillars use `node scripts/scaffold-roundup.mjs spec.json`. Same shared fields, minus
`ctaText`/`ctaLink`/`kicker`, plus `badge`, `picksAfter`, `picksHeading`,
`picksIntro` and a `products` array. Each product has `id` (kebab-case, unique site-wide),
`name`, `brand`, `badge`, `category`, `description`, `pros`, `cons`, `bottomLine` and a
four-entry `specs` object (e.g. protein per serving, calories, third-party testing, best
for). Leave out `rating` and `reviewCount` unless they are copied from the retailer's
listing on the day — the card only shows a rating when they are present.

Both scaffolders emit the shared mobile template: `ArticleHeader` (headline, byline,
methodology note), a collapsible `TableOfContents`, `QuickPicks` (swipeable picks) and
`ProductCard` for each product, and FAQ accordions. Change those components, not the
generated pages, to restyle every article at once.

### Length is a hard gate

`validate:words` fails below **2,500 words of body prose**. Aim for **2,700-2,900** so a draft clears the floor on the first pass — landing on 2,48x and topping up wastes a cycle every time. Frontmatter, tables and
markup do not count. What reliably clears it: **7 sections of 4-5 real paragraphs**,
plus 7 FAQ answers of 50-70 words and 5 mistakes of 45-60 words. Tables and callouts
are for scannability, not word count — they contribute almost nothing.

Write to the site's established voice: direct, specific, willing to say when
something is not worth buying. Concrete numbers beat adjectives. Every section should
tell the reader something they could act on.

## 4. Wire the batch in

An unlinked page is an orphan and the gate will fail it. For every article:

1. **Pillar → spoke.** Add a card to the pillar's cluster grid (the
   "Everything Else About …" block; create it before the `<!-- Related Guides -->`
   comment if the pillar has none yet) and refresh the pillar's `moreInCategory`.
2. **Spoke → pillar.** Handled by `ctaLink` plus at least one body link.
3. **Spoke → siblings.** Each article links to at least two other pages, including
   at least one from the same batch.
4. **Index.** Add a row to the matching category in `src/pages/best-of.astro`.
5. **Sitemap priority.** Add each slug to `priorityGuides` in `astro.config.mjs`.

## 5. Run every gate

```bash
npm run validate:all
```

That is word count, internal links, canonical format, and the new-page gates
(duplicate titles, keyword cannibalisation, orphans, pillar link). **Fix until all
four pass.** Do not weaken a validator to get a page through — if an article cannot
reach 2,500 honest words, the topic was too thin and should be replaced.

Then confirm the site builds:

```bash
npm run build
```

The build also regenerates `/llms.txt` and `/llms-full.txt`; new pages are indexed
automatically, so neither needs an edit. It fails if a curated link in
`src/data/llms-full-intro.md` points at a page or `#anchor` that no longer exists —
fix the link there.

## 5b. Affiliate links for any new products

If the batch added a roundup with a `PRODUCTS` array, its products have no direct
Amazon links yet — they fall back to a tagged search until matched.

```bash
npm run images:status
```

- **Credentials present** — run `npm run images:fetch:all`, then `npm run images:review`.
  Read the low-confidence list and delete any match pointing at a materially
  different product from both `src/data/product-asins.json` and
  `src/data/product-images.json`. A tagged search for the right product beats a
  confident link to the wrong one. Commit the two JSON files with the batch.
- **No credentials** — skip it and say so in the run report. Links still work and
  still pay; they are just worth less. Never block a publish on this.

## 6. Publish

```bash
git add -A
git commit -m "Add ten articles (<date>): <short topic list>"   # + the standard trailers
git push origin main
```

Straight to `main`; Vercel deploys and the `postbuild` hook submits the new URLs to
IndexNow automatically. No PR — that is the configured workflow.

## 7. Report

End the run with: the ten slugs published, each labelled `google` or `bing` with its
primary keyword and monthly volume, which `VS-QUEUE.md` rows were written and how many remain, the gate results, and anything skipped and why. If the run failed, say exactly which gate and what is
needed — never push a partial batch.

## Guardrails

- **Ten articles: five for Google, five for Bing (section 0). Never more.** If a
  batch finishes early, stop. While Google is recovering (see "READ FIRST"), five
  Bing/DuckDuckGo articles only.
- **Never open more than ~20 new indexable URLs in a day,** and never bulk-flip
  programmatic pages to indexable.
- **Never touch an existing article's content** except to add links to the new ones.
- **Never edit a validator to make a page pass.**
- **Never invent a product that does not exist**, a price that cannot be checked, or
  a specification you cannot source. Product claims in roundups must be checkable.
  Nutrition figures come from the label and are hedged ("per the label at the time of
  writing; varies by flavor").
- **Never claim hands-on testing that did not happen.** Guides are built on label
  analysis, certification status and published research; buyer feedback on taste or
  mixing is reported as such.
- **Health content is not medical advice.** Cite the research accurately, and point
  readers with kidney disease, pregnancy, allergies or medication to a doctor or
  registered dietitian.
- If the same cluster comes up two days running because yesterday's push failed,
  investigate the push rather than writing the same articles again.

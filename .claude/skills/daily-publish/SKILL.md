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

## 0. Search-engine rules: 5 for Google, 5 for Bing

These rules come from the November 2026 exports committed in
`content/search-console/2026-11-16/` (`google/` holds the Search Console Pages and
Queries files; `bing/` holds the Bing Webmaster page, keyword and daily overview
files). When a newer export lands, re-check the numbers below and update this
section if the pattern has changed.

### What the data showed

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

### The daily split

Every batch is exactly **5 Google articles + 5 Bing articles = 10**. Label each one
`google` or `bing` in your working notes and in the run report. No two articles in
the batch may share a primary keyword (first tag), and none may match an existing
page's primary keyword, whichever engine it is for.

### Rules for Google (5 articles)

Mix: **3 comparisons, 1 brand review, 1 narrow guide.**

Why 3 comparisons: the second Google export (2026-11-17, in
`content/search-console/2026-11-17/google/`) repeated the first. Comparison pages
took 3 of 4 clicks at an average position of 6.1, with 18 of them in the top 10.
Brand reviews sat around position 15 and broad "best" guides around position 47.

**Keep the product database's `demand` field filled in.** The programmatic
`/compare/<a>-vs-<b>/` pages are only indexable when *both* products have
`demand >= 1000` (Semrush US volume for the product or brand's "<name> protein
powder" query; see `DEMAND` in `scripts/db/import-research.mjs`). When a batch adds
or reviews a brand that is in `src/data/db/products.json`, set its demand from the
newest keyword export in both places. Each product that crosses 1,000 unlocks a
comparison page against every other indexable product in its protein family.

1. **Comparisons (3): "X vs Y" between well-known brands or products** (e.g.
   "Dymatize ISO100 vs Elite", "Orgain vs Vega", "Optimum Nutrition vs Body Fortress").
   This is Google's best format on the site. Rules:
   - Pick pairs people actually search (keyword export, or "vs" queries in the Google
     Queries file). Prefer pairs where both brands already have a review page.
   - The programmatic `/compare/<a>-vs-<b>/` pages already exist for products in
     `src/data/db/products.json`. An editorial comparison must be a brand-level or
     product-line question those pages don't answer (for example two products from
     the same brand, or brand vs brand), not a copy of an existing pair. Link to the
     matching `/compare/` page from the body when one exists.
   - Use `scaffold-roundup.mjs` with one product card per side. Kicker
     "Head-to-Head", section "Comparisons". Give a clear verdict for each kind of buyer.
2. **Brand review (1): a brand or product searched by name that has no page yet.**
   Same format as the Bing reviews below. For Google, lean toward brands with
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
6. **Programmatic `/compare/` product pairs are not a Bing format yet**, but
   **brand-vs-brand editorial comparisons are** ("Optimum Nutrition vs Dymatize").
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
primary keyword and monthly volume, the gate results, and anything skipped and why. If the run failed, say exactly which gate and what is
needed — never push a partial batch.

## Guardrails

- **Ten articles: five for Google, five for Bing (section 0). Never more.** If a
  batch finishes early, stop.
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

---
name: daily-publish
description: The daily article run. Publishes five supporting articles into the thinnest cluster on the site, wires them into the pillar and the index, runs every gate, and pushes to main. Use when the daily publishing Routine fires, or when asked to run the daily batch manually.
---

# Daily publish run

Five supporting articles a day, all into **one** cluster — the thinnest one on the
site. Finishing a cluster beats scattering pages, and the topic picker enforces it
so no one has to keep a list.

## 1. Get the brief

```bash
npm run topics -- --json
```

Returns the target pillar, the intents it is still missing, its existing spokes, and
the pages to link out to. Work that pillar and nothing else today.

If the brief names a pillar that is a genuinely bad fit (a discontinued product, a
topic with no search demand), skip it with `npm run topics -- --json --skip 1` and
say so in the run report.

### If a Search Console export is present

`content/search-console/` may hold recent exports. When it does, run
`npm run gsc` before writing and read the report, because it changes what the day
is worth spending on:

- Anything in **IMPROVE FIRST** (position 5-20, real impressions) beats writing a
  new article. If today's pillar or one of its spokes appears there, improving that
  page is the better use of one of the five slots — do it, and say so in the report.
- **REWRITE TITLE/META** items are five-minute fixes with real upside. Doing one or
  two alongside the batch is free value.
- **QUERIES WITH NO PAGE** are candidates for the batch, but verify each against
  existing slugs first — the matcher is generous and some are already covered.

The topic picker already accounts for demand if `demand.json` exists, so you do not
need to second-guess which cluster it chose.

## 2. Turn each intent into a real article

For each of the five intents, decide the actual title, slug and angle. Rules:

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
  "h1": "Whey Protein <span class=\"text-[#38BDF8]\">Bloating?</span>",
  "heroLede": "One or two sentences under the H1.",
  "cta1": "Start the Diagnostic",
  "lede": "The italic opening paragraph. Say the thing the page exists to say.",
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
`ctaText`/`ctaLink`/`kicker`/`cta1`, plus `badge`, `cta2`, `picksAfter`, `picksHeading`,
`picksIntro` and a `products` array. Each product has `id` (kebab-case, unique site-wide),
`name`, `brand`, `badge`, `category`, `description`, `pros`, `cons`, `bottomLine` and a
four-entry `specs` object (e.g. protein per serving, calories, third-party testing, best
for). Leave out `rating` and `reviewCount` unless they are copied from the retailer's
listing on the day — the card only shows stars when they are present.

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
git commit -m "Add five <cluster> cluster articles"   # + the standard trailers
git push origin main
```

Straight to `main`; Vercel deploys and the `postbuild` hook submits the new URLs to
IndexNow automatically. No PR — that is the configured workflow.

## 7. Report

End the run with: the cluster worked, the five slugs published, the gate results,
and anything skipped and why. If the run failed, say exactly which gate and what is
needed — never push a partial batch.

## Guardrails

- **Five articles. One cluster. Never more.** If a batch finishes early, stop.
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

# Article format: built for Google, works on Bing

This is the page format every daily article follows. It is based on the search data
from three sites built on the same template:

- **best-proteinpowder.com**: a Google Search Console export (24 h) and Bing Webmaster
  page and keyword reports (about 4 weeks). Files are in `content/search-console/2026-11-16/`.
- **treadmillreviewsusa.com**: Bing Webmaster page and keyword reports (6,726
  impressions, 311 clicks), plus the HTML of its 16 best-performing pages.
- **thehonestreviewers.com**: Bing Webmaster page and keyword reports (**444,880
  impressions, 14,118 clicks**), plus the HTML of 9 winning and losing pages. This is
  the most established of the three, and it shows what the format looks like at scale.

The section-0 rules in `SKILL.md` decide **what** to write (5 Google + 5 Bing).
This file decides **how every page is built**.

---

## 1. What the data says

| Finding | Evidence |
|---|---|
| **A direct answer with a number in the snippet wins clicks.** | Treadmill "How much does a treadmill cost?" gets 444 Bing impressions at #2.5 with a **10% CTR**. Its description opens "Treadmills run from about $200 … to $10,000+". The pace chart has more impressions (851) but a 1% CTR, because its description converts nothing. |
| **Question, chart and how-to pages are the biggest Bing format** when a site has them. | About 47% of treadmill Bing clicks, at average position 4.6. Troubleshooting pages have the best CTR at 6.2%. |
| **Brand and model reviews come second on Bing for both sites.** | 61% of protein Bing clicks; 19% of treadmill clicks. |
| **Google rewards specific pages and buries broad ones.** | Protein comparison pages average #6.7 on Google; narrow guides sit at #3–7 (coffee, cookies & cream). Broad "best protein powder for muscle gain" sits at #48. |
| **A snippet that doesn't answer the question gets zero clicks, even at #1.** | Ascent review: #1 on Bing for the casein question, 110 impressions, 0 clicks (snippet since fixed). |
| **Topic depth wins: one hub, many spokes.** | Honest Reviewers' driveway-sealer cluster has about 20 pages: best sealer, asphalt, concrete, paver, crack filler, how to seal, cost, drying time, rain after sealing, oil vs water-based, Home Depot, Menards, pros and cons. The hub ranks #3.3 with 1,134 clicks at 5% CTR, and almost every spoke ranks on page one. |
| **The same format fails on keywords big sites own.** | Honest Reviewers' "best portable power station" gets 52,560 impressions at #5 but a **0.26% CTR**; "best electric pressure washer" gets 0.12%. They are built exactly like the driveway-sealer hub. The difference is the keyword: brands, retailers and shopping results crowd the page. Niche categories (driveway sealer, garage epoxy, basement wall sealer, exterior caulk) get 4–5% CTR. |
| **Cost pages and brand-vs-brand pages have the best CTR.** | Honest Reviewers: "How much does it cost to seal a driveway?" 7.2% CTR; cost pages overall 4.5%; brand-level X-vs-Y pages 5.5% (Milwaukee vs DeWalt 6.6% at #3). |
| **Store-specific pages pull real traffic.** | "Driveway sealer Home Depot" 2,155 impressions; "Menards" 1,304. Protein: Walmart, Costco, Aldi and Target guides all click on Bing. |
| **Top pages are kept fresh.** | Honest Reviewers' best pages were all modified within the last week (13–14 Nov) despite being published March–August. |
| **Question-phrased headings beat generic numbered ones.** | The treadmill site's October pages use H2s like "How Much Does an Anti-Gravity Treadmill Session Cost?" and "Why Is My Treadmill Safety Key Not Working?". Its April pages use "1. Overview and Who It's For" and "4. Performance Deep Dive". The October pages carry the site's best CTRs. |

---

## 2. Pick the page type first

Every article is one of these five types. If a topic doesn't fit one, it is
probably a broad head term, so don't write it.

| Type | Use it for | Example slug | Best engine |
|---|---|---|---|
| **A. Question answer** | "how much / how long / does / can / is it safe / X vs Y (concept)" | `how-much-protein-powder-per-day`, `does-protein-powder-expire` | Both. Google likes the specific question; Bing ranks it on page one. |
| **B. Brand or product review** | a brand or product searched by name | `ascent-protein-powder-review`, `is-elevation-protein-powder-good` | Bing first, Google second |
| **C. Head-to-head** | two named brands or products | `dymatize-iso100-vs-elite` | Google first |
| **D. Narrow buyer's guide** | one flavour, one use, one type or one store | `best-protein-powder-for-coffee`, `best-walmart-protein-powder` | Both |
| **E. Problem / fix** | something going wrong | `protein-powder-clumping`, `whey-protein-bloating` | Both (highest CTR on the treadmill site) |

### Choose keywords you can win

Before picking any topic, ask: **do big brands, retailers or national publishers own this
search?** If yes ("best protein powder", "best whey protein"), the page will get
impressions and almost no clicks, like Honest Reviewers' portable power station page
(52,560 impressions, 0.26% CTR). Prefer:

- specific brands and products (reviews, "is X good", brand vs brand);
- one store (Walmart, Costco, Aldi, Target, Sam's Club, GNC, Trader Joe's);
- one flavour, one use, one type or one diet;
- cost, how-to and problem questions inside a cluster you already cover.

### Build clusters, not islands

Each new page should strengthen a hub. Honest Reviewers' driveway-sealer hub ranks
because ~20 spokes around it answer every sub-question (cost, drying time, rain,
types, store, how-to). For protein, the same shape works around a brand or a store:
e.g. an Aldi hub with Elevation review, "is Elevation good", Aldi vs Costco, Aldi
protein cost per 25 g, Aldi vegan protein. Every spoke links up to the hub and to two
sibling spokes, and the hub's "Everything Else About …" grid links down to every spoke.

Never write: broad "best protein powder for [goal or audience]", "ultimate guide to …",
history or trivia pages with no buying link, or a page whose answer is one sentence.

---

## 3. The snippet: title, description, URL

This is the part searchers see before they decide to click. Get it right first.

### Title (50–60 characters, never over 62)

```
[The query, phrased the way people type it]: [specific promise or the answer]
```

| Type | Formula | Example |
|---|---|---|
| A | `<Question>? <Answer-shaped promise>` | `Does Protein Powder Expire? Shelf Life, Signs and Storage` |
| B | `<Brand> Protein Powder Review: <the brand's top question>` | `Ascent Protein Powder Review: Does Native Whey Contain Casein?` |
| C | `<X> vs <Y>: <verdict promise>` | `Dymatize ISO100 vs Elite: Which Whey Is Worth It?` |
| D | `<N> Best <Narrow Thing> (2026): <how ranked or the hook>` | `7 Best Protein Powders for Coffee: Picks That Won't Clump` |
| E | `<Problem>? <The fix promise>` | `Protein Powder Clumping? Six Fixes That Work` |

- The exact query goes at the **start**.
- Use "(2026)" only for reviews, roundups and deals, never for question pages.
- Roundups lead with the count: "7 Best …". Honest Reviewers' roundups all do
  ("7 Best Asphalt Driveway Sealers in 2026"), and roundups are 72% of its clicks.
- Never put "Tested" in a title, or "we tested" in a description, unless the testing
  really happened. Our pages say "label-checked" or "ranked by cost per 25 g".
- No brand name of the site in the title; the layout adds it.

### Meta description (140–158 characters)

**The first clause is the answer, with a number or a yes/no.** Then list what else the
page covers.

- ✅ `No: Ascent native whey has no added casein, per its label. We check the whey, the Micellar Casein, Informed Sport status and cost per 25 g.`
- ✅ `A home treadmill draws 300 to 900 watts in use and costs most households under 4 dollars a month. Here is the arithmetic…` (treadmill site, 5.6% CTR)
- ❌ `Ascent protein reviewed by label: what native whey is, whether it contains casein…` (teases the answer instead of giving it, and got 0 clicks at #1)

### URL

Short, lowercase, the query itself: `/does-protein-powder-expire/`. No dates, no stop
words beyond what the query needs.

---

## 4. Page skeleton

Use this order for every type. Section 5 adds what each type needs on top.

```
H1            The query, plain (no colon, no promise)
Hero lede     1–2 sentences: who this is for and what it settles
Byline        Author + "Updated <date>" (the layout renders it; keep `published` accurate)

LEDE (40–70 words)
  Sentence 1 answers the question outright, with a number or a verdict.
  Sentence 2 says what changes the answer.
  Sentence 3 says what the page covers.

H2  "<Query>: The Short Answer"            ← always first
    50–90 words + ONE scannable element:
    a stats block, a 3–5 row table, or (for B/C/D) the Quick Picks cards.

H2–H2  5–8 body sections, each phrased as a question people search
    (take them from the keyword export, the Bing KeywordReport,
     Google Queries.csv and "People also ask").
    Each section: answer in the first sentence → 3–4 paragraphs of reasons,
    numbers and caveats → optional h3s / table / callout.

H2  "Common Mistakes With <Topic>"          ← exactly 5, 45–60 words each
H2  "Frequently Asked Questions"            ← exactly 7, 50–70 words each
H2  "Related <Cluster> Guides"              ← pillar + 2 siblings minimum
H2  "The Bottom Line"                       ← 2 short paragraphs, restate the verdict
```

**Length:** 2,800–3,500 words of body prose (the gate is 2,500). The treadmill site's
best pages run 3,000–5,700. Length comes from more answered questions, not padding.

### Heading rules

- **Phrase H2s as questions or as the answer itself**, never as a label.
  - ✅ "Why Does Whey Clump in Hot Coffee?" / "How Much Protein Is in Ascent Casein?"
  - ❌ "Overview", "Performance Deep Dive", "Our Thoughts", "Background"
- Use the exact wording searchers use at least once in an H2 ("is it third-party tested",
  "does it have casein", "how much does it cost").
- The scaffolders number H2s automatically ("3. …"). Write the heading text without
  a number.
- Never use a heading that implies hands-on testing ("Our Taste Test", "Performance
  Deep Dive", "We Tried It").

### Writing rules

- **Answer first, explain second**, in every section and every FAQ. The first
  sentence must work as a quote on its own. Google's AI answers and Bing's snippets
  both lift single sentences.
- **Put numbers in sentences, not only in tables.** "Ascent casein gives 25 g of protein
  in a 36 g scoop" is quotable. A table cell is not.
- **Name the source of every figure**: "per the label at the time of writing", "per the
  NSF Certified for Sport database", "a 2018 study in…". Link to it.
- **Vary the boilerplate.** The 5 mistakes, 7 FAQs, lede and bottom line must be
  specific to this page. Copy-paste structure is fine; copy-paste sentences are not.
  Google discounts sites where 200 pages read the same.

---

## 5. Extra blocks by page type

### A. Question answer
- Short Answer block: a **stats block or a small table holding the answer** (e.g. shelf
  life by type, protein per day by body weight).
- At least one **original calculation or conversion table**, the thing the treadmill
  pace and incline charts did. For protein: grams per day by weight, cost per 25 g,
  scoops per tub.
- Link to the one buyer's guide that a reader with this question will want next.

### B. Brand or product review
- Short Answer = verdict in 2 sentences + "Buy it if… / Skip it if…".
- Quick Picks / product cards: 3–5 products with a live Amazon ASIN and price. If the
  brand isn't on Amazon, say so and add the closest alternative, badged.
- Required H2s (phrased as questions):
  - "Is <Brand> Third-Party Tested?" (the first FAQ asks it too)
  - "What Is in <Brand> <Product>?" (label: protein, calories, sweetener, additives)
  - "How Much Does <Brand> Cost per 25 g of Protein?"
  - "What Do Buyers Say About Taste and Mixing?" (attributed: "buyers report")
  - "<Brand> vs <closest competitor>" with a link to the `/compare/` page if it exists
  - "Who Should Buy <Brand>, and Who Should Skip It?"
- FAQ must include: third-party tested, healthy/clean, contains <casein/lactose/lead/
  sweetener>, best flavour, complaints.

### C. Head-to-head
- Short Answer = one line per buyer type ("Pick X if…, pick Y if…").
- A **side-by-side spec table** in the first screen: protein, calories, sugar,
  sweetener, certification, cost per 25 g, where sold.
- One product card per side with ASIN.
- Required H2s: the differences that decide it, each as a question ("Which Has More
  Protein per Scoop?", "Which Is Cheaper per Gram?", "Which Is Third-Party Tested?").
- Link to both brands' review pages and to the programmatic `/compare/` page.

### D. Narrow buyer's guide
- Quick comparison table first, then ranked product cards (5–7) with ASINs.
- "How We Picked" section: label analysis, certification, cost per 25 g. Never testing.
- The rest are the questions specific to the niche ("Does heat damage the protein?",
  "Can you bake with whey?").

### E. Problem / fix
- Short Answer = the most likely cause and its fix in 2 sentences.
- Causes **in order of likelihood**, each an H2 phrased as the symptom
  ("Clumps Only in Hot Coffee?", "Bloating Only With Concentrate?").
- A "when to see a doctor" or "when it's not the powder" section for anything
  health-related.

---

## 6. What Google needs on top (why pages rank on Bing but not Google)

Bing ranks pages largely on relevance: a matching title, the query in headings, a
clean site. Google adds quality and trust signals, and that's where these sites lose.
Each of the following must be on every page:

1. **Proof of expertise without fake testing.** We don't claim hands-on use, so earn
   trust with the evidence we do have:
   - original numbers (cost per 25 g, Label Score, protein density) that no one else
     publishes;
   - outbound links to primary sources (brand label pages, NSF and Informed Sport
     databases, PubMed studies);
   - the author byline linking to the methodology and editorial pages.
2. **Specific beats broad.** Target the exact sub-question. A broad page competing with
   the big health publishers will sit at #40+. A specific page answering
   something they don't can reach page one in weeks.
3. **No near-duplicate pages.** One primary keyword per page (the gate checks this).
   Before writing, search the site for the query, and if a page already half-covers
   it, improve that page instead.
4. **Fresh dates that mean something.** When a page's prices or facts are updated,
   update `modified` too. Reviews, roundups and deals get re-checked monthly. Honest
   Reviewers' top pages were all updated within the past week.
5. **Structured data stays valid.** Article + FAQPage + BreadcrumbList on every page;
   Product + ItemList on pages with product cards. These come from the layout, so
   don't hand-edit JSON-LD.
6. **Internal links from strong pages.** Every new page gets a link from its pillar and
   from at least one page that already gets impressions (see the GSC/Bing exports).

## 7. What Bing needs on top

1. **The answer in the description** (section 3). Bing shows descriptions verbatim
   more often than Google does.
2. **Brand name + question in the title and H2s**: "is X third-party tested",
   "is X healthy", "X reviews and complaints". These exact queries convert on Bing.
3. **Brand-vs-brand comparisons work on Bing** (Milwaukee vs DeWalt: 6.6% CTR at #3).
   Write them at brand level ("Optimum Nutrition vs Dymatize"), not as another
   product pair; the programmatic `/compare/` product pairs are the ones Bing ignores.
4. **Store pages**: "<product> at <store>" and "best <store> protein powder" pull steady
   Bing traffic.
5. **The page in the sitemap and submitted via IndexNow** (automatic on each production
   deploy via `postbuild`).

---

## 8. Pre-publish checklist

- [ ] Page type is A–E and is not a broad head term
- [ ] Title 50–62 chars, query first
- [ ] Description 140–158 chars, **first clause is the answer**
- [ ] H1 = the query; lede answers it in sentence one
- [ ] First H2 is "<Query>: The Short Answer" with one table, stats block or picks block
- [ ] 5–8 body H2s, every one phrased as a searched question or as its answer
- [ ] 2,800–3,500 words of body prose
- [ ] Exactly 5 mistakes and 7 FAQs, all specific to this page
- [ ] Every figure attributed and, where possible, linked to its source
- [ ] Product cards: live Amazon ASIN + price + cost per 25 g (types B, C, D)
- [ ] Health caveat where relevant; no claim of hands-on testing
- [ ] Links: pillar (ctaLink + body), 2+ siblings incl. one from today's batch,
      matching `/compare/` page if one exists
- [ ] Wired into pillar grid, `best-of.astro`, `priorityGuides`
- [ ] `npm run validate:all` and `npm run build` pass

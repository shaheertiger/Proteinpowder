# Snippet (title/description) changes and their baselines

The daily run fixes 1-2 "page one, no clicks" snippets a day (skill step 0b). Log every
change here with its baseline so the next Bing export shows whether it worked. After
14 days, compare clicks for the same query in `npm run bing`, and note the result.
If a rewrite didn't lift CTR, try the other proven lever (number vs. trust question).

Proven pattern (ARTICLE-FORMAT.md section 3): exact query first in the title; the
description's first clause is the answer with a number or yes/no; reviews add (2026);
roundups lead with the count.

| Date | Page | Query (Bing, 28 d before change) | Baseline | Change | Result (fill in ~14 d later) |
|---|---|---|---|---|---|
| 2026-11-21 | /devotion-protein-powder-review/ | devotion protein powder | 57 imp, 0 cl, pos 6.6 | Title gives the price (Worth $2.70 per 25 g?); description opens with 20 g + price |  |
| 2026-11-21 | /oath-protein-powder-review/ | oath protein | 30 imp, 0 cl, pos 9 | Title: "Oath Protein Review" exact match + 20 g + from $1.40/25 g; description answers testing |  |
| 2026-11-21 | /prodough-protein-powder-review/ | prodough protein powder | 16 imp, 0 cl, pos 10 | Title adds 25 g + "No Testing Seal" (answers "is prodough third party tested") |  |
| 2026-11-21 | /just-ingredients-protein-powder-review/ | just ingredients protein powder | 17 imp, 0 cl, pos 10 | Title adds 22 g + $2.85 per 25 g; description opens with the numbers |  |
| 2026-11-21 | /best-costco-protein-powder/ | costco protein powder | 13 imp, 0 cl, pos 8 | Count-led title (7 Best Picks); description names the winner (Kirkland, 25 g) |  |
| 2026-11-21 | /best-whey-protein-powder/ | best whey protein powder | 32 imp, 0 cl, pos 9 | (2026) + description names the winner (Gold Standard, 24 g) |  |
| 2026-11-21 | /ascent-protein-powder-review/ | does ascent native whey protein contain casien | 124 imp, 0 cl, pos 1 | Already answered "No" since Nov 15 and still 0 clicks (likely zero-click or bot traffic). Description now keeps the answer and adds a reason to click (which tub to buy) |  |
| 2026-11-22 | /happy-viking-protein-powder-review/ | happy viking protein powder | 68 imp, 1 cl, pos ~5 | Title adds (2026) + the price question (~$3 per 25 g); description opens with 30 g + cost and answers the testing question |  |
| 2026-11-22 | /best-walmart-protein-powder/ | protein powder walmart / walmart protein powder / walmart whey protein | page 86 imp, 1 cl, pos 5 (rising, 0 → 86) | Exact "Walmart Protein Powder" first, count-led (7 Best Picks) + (2026); description names the cheapest, best whey and NSF picks |  |

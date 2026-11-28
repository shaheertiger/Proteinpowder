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
| 2026-11-23 | /ascent-protein-powder-review/ | does ascent native whey protein contain casien | 121 imp, 0 cl, pos 1.0 (28 d) | Checked, no change: title already asks the question and the description opens with the answer ("No added casein"), changed only on Nov 21. Re-check after Dec 5 before touching it again; if still 0 clicks, treat as zero-click/bot impressions |  |
| 2026-11-27 | /happy-viking-protein-powder-review/ | happy viking protein powder, venus williams protein powder, happy viking protein shake | 298 imp, 5 cl (Bing API to Nov 20) | Title leads with exact query + "Venus Williams' 30 g Vegan Shake"; description names Venus Williams, 30 g, 10 g fiber, $3-$3.40/25 g, no seal. Note: overlaps the Nov 22 change, whose effect is not yet in the data |  |
| 2026-11-27 | /ascent-protein-powder-review/ | does ascent native whey protein contain casein, ascent protein powder reviews, ascent casein reviews | 180 imp, 2 cl, pos 2.8 | Title now leads with the casein question; description opens "No"; lede answers casein in sentence one |  |
| 2026-11-27 | /best-protein-powder-for-weight-gain/ | weight gain protein powder, best hard gainer protein powder, top 10 mass gainer | 175 imp, 1 cl | Count-led roundup title with "Weight Gain Protein Powders" + "Hard Gainers"; description gives 1,250 kcal / 50 g; lede names picks first |  |
| 2026-11-27 | /best-walmart-protein-powder/ | protein powder walmart, walmart whey protein, walmart protein shakes | 103 imp, 1 cl | Title adds "& Whey", "Cheapest First"; description adds Equate and protein shakes |  |
| 2026-11-27 | /best-costco-protein-powder/ | costco protein powder, costco whey protein cost | 63 imp, 0 cl | Title adds "Kirkland Whey Cost"; description gives 25 g, ~70 servings per 5.4 lb bag, testing |  |
| 2026-11-27 | /muscleblaze-protein-review/ | muscleblaze review, muscleblaze biozyme | 36 imp, 0 cl | Exact "MuscleBlaze Review" first + Biozyme + 25 g; description names the testing claims |  |
| 2026-11-27 | /just-ingredients-protein-powder-review/ | just ingredients protein powder reviews, size | 36 imp, 0 cl | "Reviews" plural + 20-serving tub size; H1 now the plain query |  |
| 2026-11-27 | /devotion-protein-powder-review/ | devotion protein powder, devotion nutrition reviews | 33 imp, 0 cl | Description opens "Devotion Nutrition"; title promise "20 g Whey for Baking"; H1 now the plain query |  |
| 2026-11-27 | /best-tasting-protein-powder/ | best tasting protein powder flavour, who has the best tasting protein flavors | 16 imp, 0 cl, pos 11 | Count-led "Best Tasting Protein Powder Flavors"; description and lede name ISO100 Fudge Brownie / Gourmet Vanilla first; H1 adds "Flavors" |  |
| 2026-11-28 | /happy-viking-protein-powder-review/ | (see Bing report 28 Nov) | redo of the 21/27 Nov rewrite | Sister-site pattern: query + "Review 2026" + the answer (treadmill/HR reviews). Was: Happy Viking Protein Powder: Venus Williams' 30 g Vegan Shake |  |
| 2026-11-28 | /best-protein-powder-for-weight-gain/ | (see Bing report 28 Nov) | redo of the 21/27 Nov rewrite | Sister-site pattern: count + "in 2026" + short hook (thehonestreviewers.com roundups). Was: 6 Best Weight Gain Protein Powders for Hard Gainers (2026) |  |
| 2026-11-28 | /best-whey-protein-powder/ | (see Bing report 28 Nov) | redo of the 21/27 Nov rewrite | Sister-site pattern: count + "in 2026" + short hook (thehonestreviewers.com roundups). Was: Best Whey Protein Powder (2026): 6 Picks Ranked on Real Value |  |
| 2026-11-28 | /oath-protein-powder-review/ | (see Bing report 28 Nov) | redo of the 21/27 Nov rewrite | Sister-site pattern: query + "Review 2026" + the answer (treadmill/HR reviews). Was: Oath Protein Review (2026): 20 g Clear Whey From $1.40/25 g |  |
| 2026-11-28 | /ascent-protein-powder-review/ | (see Bing report 28 Nov) | redo of the 21/27 Nov rewrite | Sister-site pattern: query + "Review 2026" + the answer (treadmill/HR reviews). Was: Does Ascent Native Whey Contain Casein? Ascent Review (2026) |  |
| 2026-11-28 | /best-walmart-protein-powder/ | (see Bing report 28 Nov) | redo of the 21/27 Nov rewrite | Sister-site pattern: count + "in 2026" + short hook (thehonestreviewers.com roundups). Was: Walmart Protein Powder & Whey: 7 Best Picks, Cheapest First |  |
| 2026-11-28 | /best-costco-protein-powder/ | (see Bing report 28 Nov) | redo of the 21/27 Nov rewrite | Sister-site pattern: count + "in 2026" + short hook (thehonestreviewers.com roundups). Was: Costco Protein Powder: Kirkland Whey Cost and 7 Best Picks |  |
| 2026-11-28 | /just-ingredients-protein-powder-review/ | (see Bing report 28 Nov) | redo of the 21/27 Nov rewrite | Sister-site pattern: query + "Review 2026" + the answer (treadmill/HR reviews). Was: Just Ingredients Protein Powder Reviews: 22 g, 20-Serving Tub |  |
| 2026-11-28 | /muscleblaze-protein-review/ | (see Bing report 28 Nov) | redo of the 21/27 Nov rewrite | Sister-site pattern: query + "Review 2026" + the answer (treadmill/HR reviews). Was: MuscleBlaze Review: Is Biozyme Whey Worth It? 25 g per Scoop |  |
| 2026-11-28 | /devotion-protein-powder-review/ | (see Bing report 28 Nov) | redo of the 21/27 Nov rewrite | Sister-site pattern: query + "Review 2026" + the answer (treadmill/HR reviews). Was: Devotion Protein Powder Review (2026): 20 g Whey for Baking |  |
| 2026-11-28 | /best-tasting-protein-powder/ | (see Bing report 28 Nov) | redo of the 21/27 Nov rewrite | Sister-site pattern: count + "in 2026" + short hook (thehonestreviewers.com roundups). Was: 6 Best Tasting Protein Powder Flavors, by Buyer Consensus |  |

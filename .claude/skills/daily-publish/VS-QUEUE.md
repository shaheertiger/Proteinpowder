# X-vs-Y article queue

Brand pairs whose old `/compare/` pages or "X vs Y" queries showed Google demand (Search Console,
Nov 1-21, 2026: `content/search-console/2026-11-21/google-nov1-21/`) and that have no article yet.
Ordered by demand (old compare-page impressions + vs-query impressions). The daily run takes from the
top (see "X-vs-Y queue" in SKILL.md). When a newer export lands, re-rank the remaining rows.

Writing one: a brand-level article in the format of `/ghost-vs-optimum-nutrition/`, with label data
from `src/data/db/products.json`. Then add `{ url, brands, title }` to `src/data/compare-redirects.json`
(brands = the two database brand slugs below) and run `node scripts/build-compare-redirects.mjs`, so the
old pair URLs 301 to it. Then tick the row here (`[x] 2026-MM-DD`).

| Done | # | Article | Suggested slug | Brand slugs | Demand | Clicks | Searched as | Strongest old pair |
|---|---|---|---|---|---|---|---|---|
| [x] 2026-11-21 | 1 | Isopure vs Levels | `/isopure-vs-levels/` | `isopure`, `levels` | 114 | 3 | isopure vs levels protein powder (7) | `isopure-zero-carb-vs-levels-grass-fed-whey` |
| [x] 2026-11-21 | 2 | Clean Simple Eats vs Isopure | `/clean-simple-eats-vs-isopure/` | `clean-simple-eats`, `isopure` | 85 | 1 | - | `clean-simple-eats-whey-protein-vs-isopure-zero-carb` |
| [x] 2026-11-21 | 3 | FlavCity vs Just Ingredients | `/flavcity-vs-just-ingredients/` | `flavcity`, `just-ingredients` | 63 | 0 | flavcity vs just ingredients (3) | `flavcity-protein-smoothie-vs-just-ingredients-protein-powder` |
| [x] 2026-11-21 | 4 | Ryse vs Dymatize | `/ryse-vs-dymatize/` | `ryse`, `dymatize` | 53 | 2 | ryse vs dymatize (2) | `dymatize-iso100-vs-ryse-loaded-protein` |
| [x] 2026-11-21 | 5 | Body Fortress vs Premier Protein | `/body-fortress-vs-premier-protein/` | `body-fortress`, `premier-protein` | 53 | 0 | - | `body-fortress-super-advanced-whey-vs-premier-protein-powder` |
| [x] 2026-11-22 | 6 | Naked vs Optimum Nutrition | `/naked-vs-optimum-nutrition/` | `naked-nutrition`, `optimum-nutrition` | 51 | 2 | - | `naked-whey-vs-optimum-nutrition-gold-standard-whey` |
| [x] 2026-11-22 | 7 | Clean Simple Eats vs Levels | `/clean-simple-eats-vs-levels/` | `clean-simple-eats`, `levels` | 49 | 2 | - | `clean-simple-eats-whey-protein-vs-levels-grass-fed-whey` |
| [ ] | 8 | Levels vs Premier Protein | `/levels-vs-premier-protein/` | `levels`, `premier-protein` | 46 | 0 | - | `levels-grass-fed-whey-vs-premier-protein-powder` |
| [ ] | 9 | Isopure vs Premier Protein | `/isopure-vs-premier-protein/` | `isopure`, `premier-protein` | 45 | 2 | isopure vs premier protein (2) | `isopure-low-carb-vs-premier-protein-powder` |
| [ ] | 10 | FlavCity vs Premier Protein | `/flavcity-vs-premier-protein/` | `flavcity`, `premier-protein` | 45 | 0 | - | `flavcity-protein-smoothie-vs-premier-protein-powder` |
| [ ] | 11 | Body Fortress vs Dymatize | `/body-fortress-vs-dymatize/` | `body-fortress`, `dymatize` | 43 | 0 | - | `body-fortress-super-advanced-whey-vs-dymatize-iso100` |
| [ ] | 12 | Jocko vs Ryse | `/jocko-vs-ryse/` | `jocko-fuel`, `ryse` | 43 | 0 | - | `jocko-molk-protein-vs-ryse-loaded-protein` |
| [ ] | 13 | Clean Simple Eats vs Ryse | `/clean-simple-eats-vs-ryse/` | `clean-simple-eats`, `ryse` | 43 | 0 | - | `clean-simple-eats-whey-protein-vs-ryse-loaded-protein` |
| [ ] | 14 | Premier Protein vs Ryse | `/premier-protein-vs-ryse/` | `premier-protein`, `ryse` | 42 | 2 | - | `premier-protein-powder-vs-ryse-loaded-protein` |
| [ ] | 15 | Clean Simple Eats vs Optimum Nutrition | `/clean-simple-eats-vs-optimum-nutrition/` | `clean-simple-eats`, `optimum-nutrition` | 39 | 0 | - | `clean-simple-eats-whey-protein-vs-optimum-nutrition-gold-standard-whey` |
| [ ] | 16 | Ghost vs Isopure | `/ghost-vs-isopure/` | `ghost`, `isopure` | 38 | 0 | - | `ghost-whey-vs-isopure-zero-carb` |
| [ ] | 17 | Clean Simple Eats vs Premier Protein | `/clean-simple-eats-vs-premier-protein/` | `clean-simple-eats`, `premier-protein` | 33 | 2 | - | `clean-simple-eats-whey-protein-vs-premier-protein-powder` |
| [ ] | 18 | Just Ingredients vs Optimum Nutrition | `/just-ingredients-vs-optimum-nutrition/` | `just-ingredients`, `optimum-nutrition` | 33 | 1 | - | `just-ingredients-protein-powder-vs-optimum-nutrition-gold-standard-whey` |
| [ ] | 19 | Ballerina Farm vs Clean Simple Eats | `/ballerina-farm-vs-clean-simple-eats/` | `ballerina-farm`, `clean-simple-eats` | 32 | 0 | - | `ballerina-farm-protein-powder-vs-clean-simple-eats-whey-protein` |
| [ ] | 20 | Isopure vs Ryse | `/isopure-vs-ryse/` | `isopure`, `ryse` | 31 | 1 | - | `isopure-infusions-vs-ryse-loaded-protein` |
| [ ] | 21 | Dymatize vs Ghost | `/dymatize-vs-ghost/` | `dymatize`, `ghost` | 30 | 0 | - | `dymatize-iso100-vs-ghost-whey` |
| [ ] | 22 | Ascent vs Clean Simple Eats | `/ascent-vs-clean-simple-eats/` | `ascent`, `clean-simple-eats` | 29 | 2 | - | `ascent-native-fuel-whey-vs-clean-simple-eats-whey-protein` |
| [ ] | 23 | Ascent vs Jocko | `/ascent-vs-jocko/` | `ascent`, `jocko-fuel` | 29 | 1 | - | `ascent-native-fuel-whey-vs-jocko-molk-protein` |
| [ ] | 24 | Ascent vs Isopure | `/ascent-vs-isopure/` | `ascent`, `isopure` | 29 | 0 | - | `ascent-native-fuel-whey-vs-isopure-zero-carb` |
| [ ] | 25 | Orgain vs Vega | `/orgain-vs-vega/` | `orgain`, `vega` | 29 | 0 | orgain vs vega protein powder (3) | `orgain-organic-plant-protein-vs-vega-sport-premium-protein` |
| [ ] | 26 | Jocko vs Levels | `/jocko-vs-levels/` | `jocko-fuel`, `levels` | 27 | 0 | - | `jocko-molk-protein-vs-levels-grass-fed-whey` |
| [ ] | 27 | Just Ingredients vs Levels | `/just-ingredients-vs-levels/` | `just-ingredients`, `levels` | 27 | 0 | - | `just-ingredients-protein-powder-vs-levels-grass-fed-whey` |
| [ ] | 28 | Just Ingredients vs Ballerina Farm | `/just-ingredients-vs-ballerina-farm/` | `just-ingredients`, `ballerina-farm` | 27 | 0 | just ingredients vs ballerina farm protein powder (4) | `ballerina-farm-protein-powder-vs-just-ingredients-protein-powder` |
| [ ] | 29 | Dymatize vs Optimum Nutrition | `/dymatize-vs-optimum-nutrition/` | `dymatize`, `optimum-nutrition` | 26 | 0 | - | `dymatize-iso100-vs-optimum-nutrition-gold-standard-whey` |
| [ ] | 30 | Ascent vs Dymatize | `/ascent-vs-dymatize/` | `ascent`, `dymatize` | 25 | 0 | - | `ascent-native-fuel-whey-vs-dymatize-iso100` |
| [ ] | 31 | Dymatize vs Jocko | `/dymatize-vs-jocko/` | `dymatize`, `jocko-fuel` | 23 | 0 | - | `dymatize-iso100-vs-jocko-molk-protein` |
| [ ] | 32 | Ascent vs Ghost | `/ascent-vs-ghost/` | `ascent`, `ghost` | 23 | 0 | - | `ascent-native-fuel-whey-vs-ghost-whey` |
| [ ] | 33 | Dymatize ISO100 vs Elite 100% Whey | `/dymatize-iso100-vs-elite/` | `dymatize`, `dymatize` | 23 | 0 | dymatize iso 100 vs elite (8); dymatize iso 100 vs elite whey (6); dymatize elite whey vs iso 100 (6) | `(same brand: no /compare/ page)` |
| [ ] | 34 | Clean Simple Eats vs Dymatize | `/clean-simple-eats-vs-dymatize/` | `clean-simple-eats`, `dymatize` | 22 | 0 | - | `clean-simple-eats-whey-protein-vs-dymatize-iso100` |
| [ ] | 35 | Body Fortress vs Ghost | `/body-fortress-vs-ghost/` | `body-fortress`, `ghost` | 21 | 0 | - | `body-fortress-super-advanced-whey-vs-ghost-whey` |
| [ ] | 36 | FlavCity vs Isopure | `/flavcity-vs-isopure/` | `flavcity`, `isopure` | 21 | 0 | - | `flavcity-protein-smoothie-vs-isopure-zero-carb` |
| [ ] | 37 | Ascent vs Premier Protein | `/ascent-vs-premier-protein/` | `ascent`, `premier-protein` | 20 | 0 | - | `ascent-native-fuel-whey-vs-premier-protein-powder` |
| [ ] | 38 | Ghost vs Levels | `/ghost-vs-levels/` | `ghost`, `levels` | 20 | 0 | - | `ghost-whey-vs-levels-grass-fed-whey` |
| [ ] | 39 | FlavCity vs Levels | `/flavcity-vs-levels/` | `flavcity`, `levels` | 17 | 3 | - | `flavcity-protein-smoothie-vs-levels-grass-fed-whey` |
| [ ] | 40 | Isopure vs Dymatize | `/isopure-vs-dymatize/` | `isopure`, `dymatize` | 17 | 0 | isopure vs dymatize (7) | `dymatize-iso100-vs-isopure-low-carb` |
| [ ] | 41 | Just Ingredients vs Naked | `/just-ingredients-vs-naked/` | `just-ingredients`, `naked-nutrition` | 14 | 1 | - | `just-ingredients-protein-powder-vs-naked-whey` |
| [ ] | 42 | Quest vs Isopure | `/quest-vs-isopure/` | `isopure`, `quest-nutrition` | 12 | 0 | quest vs isopure protein powder (12) | `(no /compare/ page)` |
| [ ] | 43 | FlavCity vs Jocko | `/flavcity-vs-jocko/` | `flavcity`, `jocko-fuel` | 9 | 1 | - | `flavcity-protein-smoothie-vs-jocko-molk-protein` |
| [ ] | 44 | Clean Simple Eats vs Naked | `/clean-simple-eats-vs-naked/` | `clean-simple-eats`, `naked-nutrition` | 8 | 1 | - | `clean-simple-eats-whey-protein-vs-naked-whey` |
| [ ] | 45 | FlavCity vs Ghost | `/flavcity-vs-ghost/` | `flavcity`, `ghost` | 6 | 1 | - | `flavcity-protein-smoothie-vs-ghost-whey` |
| [ ] | 46 | Ballerina Farm vs Levels | `/ballerina-farm-vs-levels/` | `ballerina-farm`, `levels` | 5 | 1 | - | `ballerina-farm-protein-powder-vs-levels-grass-fed-whey` |
| [ ] | 47 | Ballerina Farm vs Naked | `/ballerina-farm-vs-naked/` | `ballerina-farm`, `naked-nutrition` | 2 | 1 | - | `ballerina-farm-protein-powder-vs-naked-whey` |

Same-brand rows (Dymatize ISO100 vs Elite) are product-line articles: do not add them to
`compare-redirects.json`, which maps brand pairs. Quest is in the database but had no compare page.

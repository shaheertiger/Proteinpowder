# Product label row — output format

Write a JSON array to the file you were given. One object per product:

```jsonc
{
  "slug": "optimum-nutrition-gold-standard-whey",   // given to you, keep it
  "brand": "Optimum Nutrition",
  "name": "Gold Standard 100% Whey",                // product name without brand
  "proteinType": "whey-blend",   // one of: whey-concentrate, whey-isolate, whey-blend (concentrate+isolate), whey-hydrolysate, casein, milk-blend (whey+casein), pea, soy, rice, hemp, plant-blend, collagen, egg-white, beef, bone-broth
  "labelFlavor": "Double Rich Chocolate",           // the flavor the numbers below come from
  "servingSizeG": 30.4,          // grams per serving as printed
  "scoopsPerServing": 1,
  "proteinG": 24,
  "calories": 120,
  "carbsG": 3,
  "sugarG": 1,                   // total sugars
  "fatG": 1.5,
  "sodiumMg": 130,
  "fiberG": 1,                   // null if not printed
  "leucineG": null,              // only if the brand publishes it (amino profile); else null
  "bcaaG": 5.5,                  // only if published; else null
  "servingsPerContainer": 29,
  "containerSize": "2 lb",
  "ingredients": "Protein blend (whey protein isolate, whey protein concentrate, ...), cocoa, ...",  // as printed for that flavor; null if you could not find it
  "sweeteners": ["sucralose", "acesulfame potassium"],   // lowercase; [] if unsweetened; null if unknown
  "flaggedAdditives": ["carrageenan", "xanthan gum"],    // gums, carrageenan, artificial colors, dyes; [] if none
  "allergens": ["milk", "soy"],                          // as declared
  "certifications": ["Informed Choice"],   // ONLY from: Informed Choice, Informed Sport, NSF Certified for Sport, NSF Contents Certified, BSCG, Clean Label Project, USDA Organic, Non-GMO Project, Certified Gluten-Free, Kosher, Halal, Labdoor tested — and only if the brand or the registry states it for THIS product
  "claims": ["gluten-free", "grass-fed", "lactose-free", "vegan", "keto", "no artificial sweeteners", "soy-free"],  // only what the brand states
  "flavors": ["Double Rich Chocolate", "Extreme Milk Chocolate", "Vanilla Ice Cream"],   // up to 12, as listed by the brand
  "price": { "usd": 64.99, "servings": 29, "size": "2 lb", "retailer": "Brand site", "url": "https://...", "checked": "2026-11-01" },  // a price you actually saw today; null if you could not see one
  "heavyMetals": "Clean Label Project 2024 ... (source)" ,  // a published third-party result for this product with its source, or null
  "description": "One neutral sentence on what the product is (no marketing adjectives).",
  "sources": ["https://brand.com/product-page", "https://..."],
  "notes": "Anything uncertain: e.g. 'serving size from Amazon listing, brand page did not load'."
}
```

Rules:
- Never guess. A number you could not find is `null`. A wrong number is far worse than a missing one.
- Prefer the brand's own product page / supplement-facts image. A large retailer listing (Amazon, Walmart, Target, iHerb, GNC, Vitamin Shoppe) is acceptable — say so in notes.
- Certifications: check the registry where you can (choice.wetestyoutrust.com, nsfsport.com) for the exact product, not just the brand. If only the brand claims it, keep it but note "brand claim".
- If a product is discontinued or renamed, use the current equivalent and say so in notes; if there is none, set "discontinued": true and fill what you can.

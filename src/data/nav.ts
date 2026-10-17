// Header navigation, shared by the desktop dropdowns in Layout.astro and the
// mobile menu (MobileNav.tsx). Every url must be a real page with a trailing
// slash — validate-internal-links checks the `url:` entries here.
export interface NavLink {
  title: string;
  blurb: string;
  icon: string;
  url: string;
}

export interface NavGroup {
  label: string;
  links: NavLink[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Protein Powders',
    links: [
      { title: 'Best Protein Powder', blurb: 'Our overall rankings', icon: '🏆', url: '/best-protein-powder/' },
      { title: 'Best Whey Isolate', blurb: 'Leanest, lowest-lactose whey', icon: '🥛', url: '/best-whey-protein-isolate/' },
      { title: 'Best Plant-Based Protein', blurb: 'Pea, soy and blends compared', icon: '🌱', url: '/best-plant-based-protein-powder/' },
      { title: 'Best Tasting Protein', blurb: 'Flavors buyers rate highest', icon: '🍫', url: '/best-tasting-protein-powder/' },
      { title: 'Protein Powder Comparison', blurb: 'Top powders side by side', icon: '📊', url: '/protein-powder-comparison/' },
    ],
  },
  {
    label: 'By Goal',
    links: [
      { title: 'Muscle Gain', blurb: 'Build muscle faster', icon: '💪', url: '/best-protein-powder-for-muscle-gain/' },
      { title: 'Weight Loss', blurb: 'Protein per calorie', icon: '⚖️', url: '/best-protein-powder-for-weight-loss/' },
      { title: 'For Women', blurb: 'What actually matters', icon: '🏃‍♀️', url: '/best-protein-powder-for-women/' },
      { title: 'For Men', blurb: 'Bigger doses, no gimmicks', icon: '🏋️', url: '/best-protein-powder-for-men/' },
      { title: 'Weight Gain', blurb: 'Mass gainers compared', icon: '🍽️', url: '/best-protein-powder-for-weight-gain/' },
    ],
  },
  {
    label: 'Guides',
    links: [
      { title: 'How Much Protein Do I Need?', blurb: 'Grams per kilo, by goal', icon: '📏', url: '/how-much-protein-do-i-need/' },
      { title: 'Whey vs Whey Isolate', blurb: 'What the extra filtering buys', icon: '🥤', url: '/whey-vs-whey-isolate/' },
      { title: 'Whey vs Plant Protein', blurb: 'Amino acids, digestion, cost', icon: '🌾', url: '/whey-vs-plant-protein/' },
      { title: 'Is Protein Powder Safe?', blurb: 'Heavy metals and testing', icon: '🔬', url: '/is-protein-powder-safe/' },
      { title: 'When to Take Protein Powder', blurb: 'Timing that actually matters', icon: '⏱️', url: '/when-to-take-protein-powder/' },
    ],
  },
];

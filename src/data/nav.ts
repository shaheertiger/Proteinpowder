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
    ],
  },
  {
    label: 'Guides',
    links: [
      { title: 'How Much Protein Do I Need?', blurb: 'Grams per kilo, by goal', icon: '📏', url: '/how-much-protein-do-i-need/' },
      { title: 'Whey vs Whey Isolate', blurb: 'What the extra filtering buys', icon: '⚖️', url: '/whey-vs-whey-isolate/' },
      { title: 'Whey vs Plant Protein', blurb: 'Amino acids, digestion, cost', icon: '🌾', url: '/whey-vs-plant-protein/' },
      { title: 'Is Protein Powder Safe?', blurb: 'Heavy metals and testing', icon: '🔬', url: '/is-protein-powder-safe/' },
      { title: 'When to Take Protein Powder', blurb: 'Timing that actually matters', icon: '⏱️', url: '/when-to-take-protein-powder/' },
    ],
  },
];

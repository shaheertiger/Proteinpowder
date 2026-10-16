export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  url: string;
}

// The site's top-level categories. The home page renders these as tiles, and each
// links to the anchor of the same id on /best-of/.
export const CATEGORIES: Category[] = [
  { id: '1', name: 'Whey Protein', slug: 'whey', icon: '🥛', url: '/best-of/#whey' },
  { id: '2', name: 'Plant Protein', slug: 'plant', icon: '🌱', url: '/best-of/#plant' },
  { id: '3', name: 'Protein Basics', slug: 'basics', icon: '📏', url: '/best-of/#basics' },
  { id: '4', name: 'Safety & Labels', slug: 'safety', icon: '🔬', url: '/best-of/#safety' },
];

export const BRAND_COLORS = {
  primary: '#FF4500',
  secondary: '#1E90FF',
  text: '#333333',
  bg: '#FFFFFF',
};

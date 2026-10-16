import { SITE_URL, SITE_NAME } from './site';

export { SITE_URL };

export interface Author {
  slug: string;
  name: string;
  role: string;
  short: string;
  bio: string[];
  initials: string;
  beat: string[];
}

// NOTE: before launch, replace (or add alongside) this entry with the real person
// who writes and reviews the guides — a named author with genuine nutrition or
// coaching credentials is a strong trust signal on health-adjacent content. Never
// invent credentials: every claim here is published on /authors/<slug>/ and in
// the Person schema on every article.
export const AUTHORS: Record<string, Author> = {
  'editorial-team': {
    slug: 'editorial-team',
    name: `${SITE_NAME} Editorial Team`,
    role: 'Supplements Desk',
    initials: 'BP',
    short:
      'The editorial team reads the label, the certificate and the price per gram of protein before a powder gets near a ranking — and says plainly when a cheaper tub does the same job.',
    bio: [
      `The ${SITE_NAME} editorial team writes and maintains every buying guide and explainer on the site, covering whey, casein, plant and blended protein powders and the questions people ask before buying one.`,
      'Every guide starts from the nutrition facts panel rather than the marketing on the front of the tub: protein per serving, protein as a share of the scoop, the full ingredient list, sweeteners, and whether the amino acid profile is being padded with cheap free amino acids. Cost is always worked out per 25 g of protein, because that is the number that decides value.',
      'Third-party certification carries real weight in our rankings. Programmes such as NSF Certified for Sport and Informed Sport test for banned substances and label accuracy, and a powder that has paid for that scrutiny is ranked accordingly. We do not accept payment for coverage, and manufacturers do not see a guide before it is published.',
    ],
    beat: [
      'Whey and whey isolate',
      'Plant-based protein',
      'Label accuracy and third-party testing',
      'Protein intake and timing',
      'Cost per gram of protein',
    ],
  },
};

export const DEFAULT_AUTHOR = 'editorial-team';

export function authorSchema(slug: string = DEFAULT_AUTHOR) {
  const a = AUTHORS[slug] ?? AUTHORS[DEFAULT_AUTHOR];
  return {
    '@type': 'Person',
    name: a.name,
    url: `${SITE_URL}/authors/${a.slug}/`,
    jobTitle: a.role,
    worksFor: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    knowsAbout: a.beat,
  };
}

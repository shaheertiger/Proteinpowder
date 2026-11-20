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
  /** Work and education history, exactly as the person publishes it. */
  background?: { org: string; role: string; years: string; place?: string }[];
  sameAs?: string[];
  alumniOf?: string;
  description?: string;
  publications?: { title: string; venue: string; url: string }[];
  disclosure?: string;
}

// NOTE: before launch, replace (or add alongside) this entry with the real person
// who writes and reviews the guides — a named author with genuine nutrition or
// coaching credentials is a strong trust signal on health-adjacent content. Never
// invent credentials: every claim here is published on /authors/<slug>/ and in
// the Person schema on every article.
export const AUTHORS: Record<string, Author> = {
  'adam-franczyk': {
    slug: 'adam-franczyk',
    name: 'Adam Franczyk, PhD',
    role: 'Protein Quality Scientist',
    initials: 'AF',
    short:
      'Adam Franczyk is a protein-quality scientist with a PhD in Food and Human Nutritional Sciences from the University of Manitoba. He writes the buying guides, brand reviews and label verdicts on this site, working from the supplement-facts panel and the cost per 25 g of protein.',
    bio: [
      `Adam Franczyk writes the buying guides, brand reviews and label verdicts on ${SITE_NAME}. He is a protein-quality scientist at the University of Manitoba, where he spent nine years as a research assistant in protein quality, evaluating thousands of food samples with in vitro protein digestibility and amino acid analysis, before completing his PhD in Food and Human Nutritional Sciences and starting as a postdoctoral researcher.`,
      'He has developed and tested laboratory methods for protein digestibility, one of them validated by the American Oil Chemists\' Society, and has published peer-reviewed work on how processing affects the protein quality of pulses. That background shapes how this site reads a label: protein per serving is only the start, and the type of protein, its amino acid profile and whether the total is padded with cheap free amino acids decide how much of that protein your body can use.',
      'Every guide starts from the nutrition facts panel and the full ingredient list. Cost is worked out per 25 g of protein at a dated price, and certifications are checked in the certifier\'s own registry for the exact product. Taste and mixability are reported from buyer reviews, never from our own tasting. Adam is a nutrition scientist, not a physician or registered dietitian, so readers with kidney disease, pregnancy or other medical conditions are told to check with a doctor or registered dietitian before changing their protein intake.',
    ],
    beat: [
      'Protein quality and digestibility',
      'Amino acid profiles and amino spiking',
      'Plant, pulse and hemp proteins',
      'Supplement-facts labels and the label database',
      'Third-party certification checks',
    ],
    background: [
      { org: 'University of Manitoba', role: 'Postdoctoral Researcher', years: '2026–present', place: 'Winnipeg' },
      { org: 'Manitoba Harvest Hemp Foods', role: 'Quality Control Laboratory Technician (contract)', years: '2025', place: 'Manitoba' },
      { org: 'University of Manitoba', role: 'Research Assistant in Protein Quality', years: '2015–2024', place: 'Winnipeg' },
      { org: 'Canadian Malting Barley Technical Centre', role: 'Student Malt Technician', years: '2013–2014', place: 'Winnipeg' },
      { org: 'University of Manitoba', role: 'PhD, Food and Human Nutritional Sciences', years: '2018–2026' },
      { org: 'University of Manitoba', role: 'MSc, Food and Human Nutritional Sciences', years: '2016–2018' },
    ],
    publications: [
      { title: 'The impact of mechanical scouring and moisture conditioning on the in vitro protein digestibility and quality of roller-milled green lentil (Lens culinaris) and yellow pea (Pisum sativum)', venue: 'Cereal Chemistry (first author)', url: 'https://onlinelibrary.wiley.com/doi/10.1002/cche.10831' },
      { title: 'The assessment of in vitro protein digestibility and quality on mechanically scoured and moisture conditioned navy beans (Phaseolus vulgaris) and chickpeas (Cicer arietinum) subject to roller-milling', venue: 'Cereal Chemistry', url: 'https://doi.org/10.1002/cche.70003' },
      { title: 'A collaborative study to validate in vitro assays for protein digestibility assessment using pH-drop and pH-stat methods', venue: 'Journal of Food Composition and Analysis (co-author)', url: 'https://doi.org/10.1016/j.jfca.2026.108918' },
    ],
    disclosure: 'Adam worked as a contract quality control laboratory technician at Manitoba Harvest Hemp Foods in 2025. Manitoba Harvest products in our database are scored by the same published method as every other brand.',
    sameAs: ['https://www.linkedin.com/in/ajf17/'],
    alumniOf: 'University of Manitoba',
    description: 'Protein quality scientist; PhD and MSc in Food and Human Nutritional Sciences, University of Manitoba; postdoctoral researcher.',
  },
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

export const DEFAULT_AUTHOR = 'adam-franczyk';

export function authorSchema(slug: string = DEFAULT_AUTHOR) {
  const a = AUTHORS[slug] ?? AUTHORS[DEFAULT_AUTHOR];
  return {
    '@type': 'Person',
    name: a.name,
    url: `${SITE_URL}/authors/${a.slug}/`,
    jobTitle: a.role,
    worksFor: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    knowsAbout: a.beat,
    ...(a.description ? { description: a.description } : {}),
    ...(a.sameAs?.length ? { sameAs: a.sameAs } : {}),
    ...(a.alumniOf ? { alumniOf: { '@type': 'CollegeOrUniversity', name: a.alumniOf } } : {}),
  };
}

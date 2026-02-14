export const CAUSE_VALUES = [
  'animal_welfare',
  'environmental',
  'humanitarian',
  'education',
  'healthcare',
  'poverty_alleviation',
  'women_empowerment',
  'child_welfare',
  'elderly_care',
  'disability_support',
  'rural_development',
  'urban_development',
  'arts_culture',
  'sports',
  'technology',
  'other',
] as const;

export type Cause = (typeof CAUSE_VALUES)[number];

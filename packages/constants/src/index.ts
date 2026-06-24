import type { ExperienceLevel } from '@fitown/types';

export const FOCUS_OPTIONS = [
  'Strength',
  'Cardio',
  'General Health',
  'Sports',
  'Rehab',
] as const;

export const EXPERIENCE_OPTIONS: { label: string; value: ExperienceLevel }[] = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
];

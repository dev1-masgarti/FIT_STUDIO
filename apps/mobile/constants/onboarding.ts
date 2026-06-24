export const ONBOARDING_TOTAL_STEPS = 5;

export const FITNESS_GOALS = [
  'Build Muscle',
  'Gain Strength',
  'Improve Endurance',
  'Lose Fat',
  'Increase Flexibility & Mobility',
  'Maintain Shape',
  'General Health',
  'Rehab / Recovery',
  'Other',
] as const;

export type FitnessGoal = (typeof FITNESS_GOALS)[number];
